import { Injectable } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import {
  FLEXIBEE_PRODUCT_DETAIL,
  mapFlexibeeProduct,
  type Product,
  toStockStatus,
} from "./product.mapper";
import { matchesAllRules, type ProductRule } from "./product-rules";
import { stockCardsPath, toStockByProductId } from "./warehouse-stock";

export const PRODUCTS_ENTITY = "cenik";
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 6;

/** Stock cards and the visible product list are cached this long. */
export const CACHE_TTL_MS = 60_000;

/** Product ids per Flexibee filter request, to keep URLs short. */
const ID_CHUNK_SIZE = 50;

export type ListProductsOptions = {
  limit?: number;
  start?: number;
};

export type ProductPage = {
  items: Product[];
  limit: number;
  start: number;
};

type Cached<T> = { expiresAt: number; value: T };

@Injectable()
export class ProductsService {
  private readonly stockCache = new Map<string, Cached<Map<string, number>>>();
  private readonly listCache = new Map<string, Cached<Product[]>>();

  constructor(
    private readonly flexibee: FlexibeeClient,
    private readonly settings: SettingsService,
  ) {}

  async list(options: ListProductsOptions = {}): Promise<ProductPage> {
    const limit = clamp(options.limit ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const start = Math.max(0, options.start ?? 0);
    const { warehouseId, rules } = await this.settings.get();

    const visible = await this.visibleProducts(warehouseId, rules);

    return {
      items: visible.slice(start, start + limit),
      limit,
      start,
    };
  }

  /**
   * Products that pass the admin rules, sorted by id. The full set is built
   * first so paging stays correct, then cached for a short time.
   */
  private async visibleProducts(
    warehouseId: string | null,
    rules: ProductRule[],
  ): Promise<Product[]> {
    const key = JSON.stringify([warehouseId, rules]);
    const cached = readCache(this.listCache, key);
    if (cached) {
      return cached;
    }

    const products = warehouseId
      ? await this.warehouseProducts(warehouseId)
      : await this.globalProducts();

    const visible = products
      .filter((product) => matchesAllRules(product, rules))
      .sort((a, b) => Number(a.id) - Number(b.id));

    writeCache(this.listCache, key, visible);
    return visible;
  }

  /** Global stock: the total quantity on hand from the price list. */
  private async globalProducts(): Promise<Product[]> {
    const rows = await this.flexibee.list(PRODUCTS_ENTITY, {
      detail: FLEXIBEE_PRODUCT_DETAIL,
      limit: "0",
    });

    return rows.map(mapFlexibeeProduct);
  }

  /** Only products that have a stock card in the selected warehouse. */
  private async warehouseProducts(warehouseId: string): Promise<Product[]> {
    const stockByProduct = await this.warehouseStock(warehouseId);
    const ids = [...stockByProduct.keys()];
    const rows: Record<string, unknown>[] = [];

    for (let index = 0; index < ids.length; index += ID_CHUNK_SIZE) {
      const chunk = ids.slice(index, index + ID_CHUNK_SIZE);
      const filter = chunk.map((id) => `id=${id}`).join(" or ");
      rows.push(
        ...(await this.flexibee.list(`${PRODUCTS_ENTITY}/(${filter})`, {
          detail: FLEXIBEE_PRODUCT_DETAIL,
          limit: "0",
        })),
      );
    }

    return rows.map(mapFlexibeeProduct).map((product) => {
      const stock = stockByProduct.get(product.id) ?? 0;
      return { ...product, stock, stockStatus: toStockStatus(stock) };
    });
  }

  /** Product id -> quantity on hand in one warehouse. */
  private async warehouseStock(
    warehouseId: string,
  ): Promise<Map<string, number>> {
    const cached = readCache(this.stockCache, warehouseId);
    if (cached) {
      return cached;
    }

    const cards = await this.flexibee.list(stockCardsPath(warehouseId), {
      detail: "full",
      limit: "0",
    });
    const stock = toStockByProductId(cards);
    writeCache(this.stockCache, warehouseId, stock);

    return stock;
  }
}

const readCache = <T>(cache: Map<string, Cached<T>>, key: string): T | null => {
  const entry = cache.get(key);
  return entry && entry.expiresAt > Date.now() ? entry.value : null;
};

const writeCache = <T>(
  cache: Map<string, Cached<T>>,
  key: string,
  value: T,
): void => {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
