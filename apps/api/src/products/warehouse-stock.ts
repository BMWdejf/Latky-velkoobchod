/**
 * Flexibee stock cards (`skladova-karta`): one row per product per warehouse.
 * Verified against a live instance: the warehouse filter goes in the path,
 * `cenik@ref` links to the price-list item, and `stavMJ` is the quantity on hand.
 * Change these names here only.
 */
export const FLEXIBEE_STOCK_CARD = {
  entity: "skladova-karta",
  warehouseField: "sklad",
  productRef: "cenik@ref",
  quantityField: "stavMJ",
  /** Minimum stock of the product in this warehouse. */
  minQuantityField: "minMJ",
} as const;

export type StockCardRow = Record<string, unknown>;

/** Path for the stock cards of one warehouse, e.g. `skladova-karta/(sklad=38)`. */
export const stockCardsPath = (warehouseId: string): string => {
  if (!/^\d+$/.test(warehouseId)) {
    throw new Error(`Invalid warehouse id: ${warehouseId}`);
  }

  return `${FLEXIBEE_STOCK_CARD.entity}/(${FLEXIBEE_STOCK_CARD.warehouseField}=${warehouseId})`;
};

/** Extracts the price-list id from a reference such as `/c/firma/cenik/10.json`. */
export const productIdFromRef = (ref: unknown): string | null => {
  const match = /\/cenik\/(\d+)\.json$/.exec(String(ref ?? ""));
  return match?.[1] ?? null;
};

/** Sums quantity on hand per product id across the stock cards of a warehouse. */
export const toStockByProductId = (rows: StockCardRow[]): Map<string, number> =>
  new Map([...toStockEntries(rows)].map(([id, entry]) => [id, entry.quantity]));

/** Quantity on hand and minimum stock of one product in one warehouse. */
export type StockEntry = { quantity: number; minQuantity: number };

/** Sums quantity and minimum per product id across the stock cards of a warehouse. */
export const toStockEntries = (
  rows: StockCardRow[],
): Map<string, StockEntry> => {
  const entries = new Map<string, StockEntry>();

  for (const row of rows) {
    const productId = productIdFromRef(row[FLEXIBEE_STOCK_CARD.productRef]);
    const quantity = Number(row[FLEXIBEE_STOCK_CARD.quantityField]);

    if (!productId || !Number.isFinite(quantity)) {
      continue;
    }

    const minimum = Number(row[FLEXIBEE_STOCK_CARD.minQuantityField]);
    const previous = entries.get(productId) ?? { quantity: 0, minQuantity: 0 };
    entries.set(productId, {
      quantity: previous.quantity + quantity,
      minQuantity:
        previous.minQuantity + (Number.isFinite(minimum) ? minimum : 0),
    });
  }

  return entries;
};
