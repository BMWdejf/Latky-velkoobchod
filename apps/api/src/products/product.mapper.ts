/**
 * Field names in the Flexibee `cenik` (price list) entity.
 * These are assumptions that must be checked against the real Flexibee
 * instance; change them here only, the rest of the API depends on the DTO.
 */
export const FLEXIBEE_PRODUCT_FIELDS = {
  id: "id",
  sku: "kod",
  name: "nazev",
  unitPrice: "cenaZakl",
  unit: "mj",
  stock: "zasoba",
  minOrder: "minOdber",
  width: "sirka",
  weight: "gramaz",
  composition: "slozeni",
} as const;

export const FLEXIBEE_PRODUCT_DETAIL = `custom:${Object.values(
  FLEXIBEE_PRODUCT_FIELDS,
).join(",")}`;

/** Stock at or below this quantity is reported as `low_stock`. */
export const LOW_STOCK_THRESHOLD = 100;

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  currency: "CZK";
  unit: string | null;
  stock: number;
  stockStatus: StockStatus;
  minOrder: number | null;
  width: string | null;
  weight: string | null;
  composition: string | null;
};

type FlexibeeProductRow = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

export const toStockStatus = (stock: number): StockStatus => {
  if (stock <= 0) {
    return "out_of_stock";
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return "low_stock";
  }
  return "in_stock";
};

export const mapFlexibeeProduct = (row: FlexibeeProductRow): Product => {
  const stock = toNumber(row[FLEXIBEE_PRODUCT_FIELDS.stock]);

  return {
    id: String(row[FLEXIBEE_PRODUCT_FIELDS.id] ?? ""),
    sku: String(row[FLEXIBEE_PRODUCT_FIELDS.sku] ?? ""),
    name: String(row[FLEXIBEE_PRODUCT_FIELDS.name] ?? ""),
    unitPrice: toNumber(row[FLEXIBEE_PRODUCT_FIELDS.unitPrice]),
    currency: "CZK",
    unit: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.unit]),
    stock,
    stockStatus: toStockStatus(stock),
    minOrder: toNullableNumber(row[FLEXIBEE_PRODUCT_FIELDS.minOrder]),
    width: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.width]),
    weight: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.weight]),
    composition: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.composition]),
  };
};
