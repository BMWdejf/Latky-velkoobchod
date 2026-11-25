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
import {
  FLEXIBEE_ATTACHMENT,
  FLEXIBEE_ATTACHMENT_DETAIL,
  toImageByProductId,
} from "./product-images";
import { matchesAllRules, noticeFor, type ProductRule } from "./product-rules";
import {
  type SearchQuery,
  type SearchResult,
  searchProducts,
} from "./product-search";
import {
  type StockEntry,
  stockCardsPath,
  toStockEntries,
} from "./warehouse-stock";

export const PRODUCTS_ENTITY = "cenik";
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 6;
/** The admin table shows ten rows per page. */
export const ADMIN_DEFAULT_PAGE_SIZE = 10;

/** Stock cards and the visible product list are cached this long. */
export const CACHE_TTL_MS = 60_000;

/** Product ids per Flexibee filter request, to keep URLs short. */
const ID_CHUNK_SIZE = 50;

export type ListProductsOptions = {
  limit?: number;
  start?: number;
};

/** Product as the public list returns it: admin-only fields are left out. */
export type PublicProduct = Omit<Product, "minStock">;

export type ProductPage = {
  items: PublicProduct[];
  limit: number;
  start: number;
};

export type PublicSearchResult = Omit<SearchResult, "items"> & {
  items: PublicProduct[];
};

/** Strips admin-only fields and adds the stock text chosen by the admin rules. */
const toPublic = (product: Product, rules: ProductRule[]): PublicProduct => {
  const { minStock: _adminOnly, ...publicFields } = product;
  return { ...publicFields, notice: noticeFor(product, rules) };
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
  private readonly stockCache = new Map<
    string,
    Cached<Map<string, StockEntry>>
  >();
  private readonly imageCache = new Map<string, Cached<Map<string, string>>>();
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
      items: visible
        .slice(start, start + limit)
        .map((product) => toPublic(product, rules)),
      limit,
      start,
    };
  }

  /** Public search over the visible products: filters, facet counts and paging. */
  async search(query: SearchQuery): Promise<PublicSearchResult> {
    const { warehouseId, rules } = await this.settings.get();
    const visible = await this.visibleProducts(warehouseId, rules);
    const result = searchProducts(visible, query);

    return {
      ...result,
      items: result.items.map((product) => toPublic(product, rules)),
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
   * Admin product list: every product of the selected source (warehouse or
   * global), not only the visible ones. Each row says whether the web shows it.
   * Counts and KPIs always cover the whole source; filters only narrow `items`.
   */
  async adminList(
    options: ListAdminProductsOptions = {},
  ): Promise<AdminProductPage> {
    const limit = clamp(
      options.limit ?? ADMIN_DEFAULT_PAGE_SIZE,
      1,
      MAX_PAGE_SIZE,
    );
    const start = Math.max(0, options.start ?? 0);
    const filter = options.filter ?? "all";
    const { warehouseId, rules } = await this.settings.get();

    const products = await this.allProducts(warehouseId);
    const annotated: AdminProduct[] = products
      .map((product) => ({
        ...product,
        visibleForWeb: matchesAllRules(product, rules),
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));

    const counts: Record<AdminProductFilter, number> = {
      all: annotated.length,
      low: annotated.filter(isLowStock).length,
      out: annotated.filter((product) => product.stockStatus === "out_of_stock")
        .length,
      hidden: annotated.filter((product) => !product.visibleForWeb).length,
    };

    const query = options.q?.trim().toLocaleLowerCase("cs-CZ") ?? "";
    const matching = annotated.filter(
      (product) =>
        matchesFilter(product, filter) &&
        (options.group === undefined || product.group === options.group) &&
        (query === "" ||
          product.name.toLocaleLowerCase("cs-CZ").includes(query) ||
          product.sku.toLocaleLowerCase("cs-CZ").includes(query)),
    );

    return {
      items: matching.slice(start, start + limit),
      total: matching.length,
      limit,
      start,
      counts,
      kpis: {
        totalSku: annotated.length,
        hiddenForWeb: counts.hidden,
        lowStock: counts.low,
        outOfStock: counts.out,
        stockValue: annotated.reduce(
          (sum, product) => sum + product.stock * product.unitPrice,
          0,
        ),
      },
    };
  }

  /** Every product of the warehouse (only those with a stock card) or of the price list. */
  private async allProducts(warehouseId: string | null): Promise<Product[]> {
    const key = `all:${warehouseId ?? "global"}`;
    const cached = readCache(this.listCache, key);
    if (cached) {
      return cached;
    }

    const products = warehouseId
      ? await this.warehouseProducts(warehouseId)
      : await this.globalProducts();

    writeCache(this.listCache, key, products);
    return products;
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

    return this.withImages(rows.map(mapFlexibeeProduct));
  }

  /** Adds the photo URL from the product attachments. */
  private async withImages(products: Product[]): Promise<Product[]> {
    const images = await this.productImages();
    return products.map((product) => ({
      ...product,
      imageUrl: images.get(product.id) ?? null,
    }));
  }

  /** Product id -> photo URL, from all attachments, cached like the other lists. */
  private async productImages(): Promise<Map<string, string>> {
    const cached = readCache(this.imageCache, "all");
    if (cached) {
      return cached;
    }

    const rows = await this.flexibee.list(FLEXIBEE_ATTACHMENT.entity, {
      detail: FLEXIBEE_ATTACHMENT_DETAIL,
      limit: "0",
    });
    const images = toImageByProductId(rows);
    writeCache(this.imageCache, "all", images);

    return images;
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

    const products = rows.map(mapFlexibeeProduct).map((product) => {
      const entry = stockByProduct.get(product.id);
      const stock = entry?.quantity ?? 0;
      return {
        ...product,
        stock,
        stockStatus: toStockStatus(stock),
        minStock: entry?.minQuantity ?? null,
      };
    });

    return this.withImages(products);
  }

  /** Product id -> quantity on hand in one warehouse. */
  private async warehouseStock(
    warehouseId: string,
  ): Promise<Map<string, StockEntry>> {
    const cached = readCache(this.stockCache, warehouseId);
    if (cached) {
      return cached;
    }

    const cards = await this.flexibee.list(stockCardsPath(warehouseId), {
      detail: "full",
      limit: "0",
    });
    const entries = toStockEntries(cards);
    writeCache(this.stockCache, warehouseId, entries);

    return entries;
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

export type AdminProductFilter = "all" | "low" | "out" | "hidden";

export const ADMIN_PRODUCT_FILTERS: readonly AdminProductFilter[] = [
  "all",
  "low",
  "out",
  "hidden",
];

export type AdminProduct = Product & {
  /** Whether the admin rules let this product show on the web. */
  visibleForWeb: boolean;
};

export type ListAdminProductsOptions = {
  q?: string;
  filter?: AdminProductFilter;
  group?: string;
  limit?: number;
  start?: number;
};

export type AdminProductPage = {
  items: AdminProduct[];
  /** Products matching the filters, before paging. */
  total: number;
  limit: number;
  start: number;
  counts: Record<AdminProductFilter, number>;
  kpis: {
    totalSku: number;
    hiddenForWeb: number;
    lowStock: number;
    outOfStock: number;
    /** Quantity times base price, summed over the source. Assumes `cenaZakl` is without VAT. */
    stockValue: number;
  };
};

const isLowStock = (product: Product): boolean =>
  product.stockStatus === "low_stock";

const matchesFilter = (
  product: AdminProduct,
  filter: AdminProductFilter,
): boolean => {
  switch (filter) {
    case "low":
      return isLowStock(product);
    case "out":
      return product.stockStatus === "out_of_stock";
    case "hidden":
      return !product.visibleForWeb;
    default:
      return true;
  }
};
