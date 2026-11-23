import { Injectable } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import {
  FLEXIBEE_PRODUCT_DETAIL,
  mapFlexibeeProduct,
  type Product,
  toStockStatus,
} from "./product.mapper";
import {
  FLEXIBEE_WAREHOUSE_STOCK,
  toStockByProductId,
} from "./warehouse-stock";

export const PRODUCTS_ENTITY = "cenik";
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 6;

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
  constructor(
    private readonly flexibee: FlexibeeClient,
    private readonly settings: SettingsService,
  ) {}

  async list(options: ListProductsOptions = {}): Promise<ProductPage> {
    const limit = clamp(options.limit ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const start = Math.max(0, options.start ?? 0);

    const [rows, { warehouseId }] = await Promise.all([
      this.flexibee.list(PRODUCTS_ENTITY, {
        detail: FLEXIBEE_PRODUCT_DETAIL,
        limit: String(limit),
        start: String(start),
      }),
      this.settings.get(),
    ]);

    const items = warehouseId
      ? await this.withWarehouseStock(rows, warehouseId)
      : rows.map(mapFlexibeeProduct);

    return { items, limit, start };
  }

  /** Replaces the global stock with the quantity held in the selected warehouse. */
  private async withWarehouseStock(
    rows: Record<string, unknown>[],
    warehouseId: string,
  ): Promise<Product[]> {
    const stockRows = await this.flexibee.list(
      FLEXIBEE_WAREHOUSE_STOCK.entity,
      {
        detail: `custom:${FLEXIBEE_WAREHOUSE_STOCK.productField},${FLEXIBEE_WAREHOUSE_STOCK.quantityField}`,
        [FLEXIBEE_WAREHOUSE_STOCK.warehouseField]: warehouseId,
      },
    );
    const stockByProduct = toStockByProductId(stockRows);

    return rows.map((row) => {
      const product = mapFlexibeeProduct(row);
      const stock = stockByProduct.get(product.id) ?? 0;

      return { ...product, stock, stockStatus: toStockStatus(stock) };
    });
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
