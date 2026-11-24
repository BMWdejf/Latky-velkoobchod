import { Injectable } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import {
  FLEXIBEE_PRODUCT_DETAIL,
  mapFlexibeeProduct,
  type Product,
  toStockStatus,
} from "./product.mapper";
import { stockCardsPath, toStockByProductId } from "./warehouse-stock";

export const PRODUCTS_ENTITY = "cenik";
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 6;

/** Stock per warehouse is cached briefly so public requests do not re-read every card. */
export const STOCK_CACHE_TTL_MS = 60_000;

type CachedStock = { expiresAt: number; stock: Map<string, number> };

export type ListProductsOptions = {
  limit?: number;
  start?: number;
};

export type ProductPage = {
  items: Product[];
  limit: number;
  start: number;
};

@Injectable()
export class ProductsService {
  private readonly stockCache = new Map<string, CachedStock>();

  constructor(
    private readonly flexibee: FlexibeeClient,
    private readonly settings: SettingsService,
  ) {}

  async list(options: ListProductsOptions = {}): Promise<ProductPage> {
    const limit = clamp(options.limit ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const start = Math.max(0, options.start ?? 0);
    const { warehouseId } = await this.settings.get();

    const items = warehouseId
      ? await this.listInWarehouse(warehouseId, limit, start)
      : await this.listGlobal(limit, start);

    return { items, limit, start };
  }

  private async listGlobal(limit: number, start: number): Promise<Product[]> {
    const rows = await this.flexibee.list(PRODUCTS_ENTITY, {
      detail: FLEXIBEE_PRODUCT_DETAIL,
      limit: String(limit),
      start: String(start),
    });

    return rows.map(mapFlexibeeProduct);
  }

  /**
   * Only products that have a stock card in the selected warehouse. The page
   * is cut from that set, so paging stays correct.
   */
  private async listInWarehouse(
    warehouseId: string,
    limit: number,
    start: number,
  ): Promise<Product[]> {
    const stockByProduct = await this.warehouseStock(warehouseId);

    const pageIds = [...stockByProduct.keys()]
      .map(Number)
      .sort((a, b) => a - b)
      .slice(start, start + limit);

    if (pageIds.length === 0) {
      return [];
    }

    const filter = pageIds.map((id) => `id=${id}`).join(" or ");
    const rows = await this.flexibee.list(`${PRODUCTS_ENTITY}/(${filter})`, {
      detail: FLEXIBEE_PRODUCT_DETAIL,
      limit: "0",
    });

    return rows.map(mapFlexibeeProduct).map((product) => {
      const stock = stockByProduct.get(product.id) ?? 0;
      return { ...product, stock, stockStatus: toStockStatus(stock) };
    });
  }

  /** Product id -> quantity for one warehouse, cached for STOCK_CACHE_TTL_MS. */
  private async warehouseStock(
    warehouseId: string,
  ): Promise<Map<string, number>> {
    const now = Date.now();
    const cached = this.stockCache.get(warehouseId);
    if (cached && cached.expiresAt > now) {
      return cached.stock;
    }

    const cards = await this.flexibee.list(stockCardsPath(warehouseId), {
      detail: "full",
      limit: "0",
    });
    const stock = toStockByProductId(cards);
    this.stockCache.set(warehouseId, {
      expiresAt: now + STOCK_CACHE_TTL_MS,
      stock,
    });

    return stock;
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
