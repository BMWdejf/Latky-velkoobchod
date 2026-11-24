import { Injectable } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import {
  FLEXIBEE_PRODUCT_DETAIL,
  LOW_STOCK_THRESHOLD,
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

export type ProductsSummary = {
  warehouseId: string | null;
  ruleCount: number;
  total: number;
  lowStock: number;
  outOfStock: number;
  criticalItems: Array<{
    id: string;
    sku: string;
    name: string;
    stock: number;
  }>;
  groups: Array<{ name: string; count: number; share: number }>;
};

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

  /** Counts and examples for the admin overview, from the same visible set. */
  async summary(): Promise<ProductsSummary> {
    const { warehouseId, rules } = await this.settings.get();
    const visible = await this.visibleProducts(warehouseId, rules);

    const lowStock = visible
      .filter(
        (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
      )
      .sort((a, b) => a.stock - b.stock);
    const outOfStock = visible.filter((product) => product.stock <= 0).length;

    const byGroup = new Map<string, number>();
    for (const product of visible) {
      const group = product.group ?? "Bez skupiny";
      byGroup.set(group, (byGroup.get(group) ?? 0) + 1);
    }
    const groups = [...byGroup.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        share: visible.length === 0 ? 0 : count / visible.length,
      }));

    return {
      warehouseId,
      ruleCount: rules.length,
      total: visible.length,
      lowStock: lowStock.length,
      outOfStock,
      criticalItems: lowStock.slice(0, 5).map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        stock: product.stock,
      })),
      groups,
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
