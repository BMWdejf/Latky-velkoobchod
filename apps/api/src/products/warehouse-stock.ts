/**
 * Per-warehouse stock rows in Flexibee.
 * These names are assumptions that must be checked against the real Flexibee
 * instance (see `GET /c/<company>/<entity>.json?detail=full`). Change them here only.
 */
export const FLEXIBEE_WAREHOUSE_STOCK = {
  entity: "skladova-zasoba",
  warehouseField: "sklad",
  productField: "cenik",
  quantityField: "mnozstvi",
} as const;

export type WarehouseStockRow = Record<string, unknown>;

/** Maps product id -> quantity on hand in the selected warehouse. */
export const toStockByProductId = (
  rows: WarehouseStockRow[],
): Map<string, number> => {
  const stock = new Map<string, number>();

  for (const row of rows) {
    const productId = String(row[FLEXIBEE_WAREHOUSE_STOCK.productField] ?? "");
    const quantity = Number(row[FLEXIBEE_WAREHOUSE_STOCK.quantityField]);

    if (productId === "" || !Number.isFinite(quantity)) {
      continue;
    }

    stock.set(productId, (stock.get(productId) ?? 0) + quantity);
  }

  return stock;
};
