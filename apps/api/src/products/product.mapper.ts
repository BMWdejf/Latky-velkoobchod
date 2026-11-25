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
  /** Total quantity on hand across all warehouses (verified on the instance). */
  stock: "sumStavMj",
  group: "skupZboz",
  minOrder: "minOdber",
  width: "sirka",
  weight: "gramaz",
  composition: "slozeni",
  /** EAN barcode, verified on the instance. */
  ean: "eanKod",
  /**
   * Labels (štítky) of the product: fabric type and certifications.
   * ASSUMPTION: the field name must be checked on the real Flexibee instance.
   */
  labels: "stitky",
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
  group: string | null;
  minOrder: number | null;
  width: string | null;
  weight: string | null;
  composition: string | null;
  ean: string | null;
  /** Stock text from the admin stock rules (e.g. "Očekáváme naskladnění"), or null. */
  notice: string | null;
  /** Photo URL from the product attachments, or null. */
  imageUrl: string | null;
  /** Labels from Flexibee: fabric type and certifications (filter facets). */
  labels: string[];
  /** Minimum stock of the selected warehouse (stock card `minMJ`); null without a warehouse. */
  minStock: number | null;
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

/** Flexibee returns references as `code:XYZ`; keep only the code. */
export const toGroupCode = (value: unknown): string | null => {
  const text = toNullableString(value);
  return text ? text.replace(/^code:/, "") : null;
};

/** Flexibee returns labels as a list of names or as one comma-separated text. */
export const toLabels = (value: unknown): string[] => {
  const items = Array.isArray(value) ? value : String(value ?? "").split(",");
  return items
    .map((item) => toNullableString(item))
    .filter((item): item is string => item !== null);
};

/**
 * Gramáž and šířka role are Flexibee labels named like `gramaz_240g` and
 * `sire_160cm`. The number in the label is the value shown and filtered on.
 */
export const GSM_LABEL = /^gramaz_(\d+(?:[.,]\d+)?)g$/i;
export const WIDTH_LABEL = /^sire_(\d+(?:[.,]\d+)?)cm$/i;

/** Numbers taken from the labels that match the pattern, in label order. */
export const labelNumbers = (labels: string[], pattern: RegExp): number[] =>
  labels
    .map((label) => label.match(pattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => Number((match[1] ?? "").replace(",", ".")));

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
  const labels = toLabels(row[FLEXIBEE_PRODUCT_FIELDS.labels]);
  // The labels win for display, so the card and the filters show the same values.
  const [gsm] = labelNumbers(labels, GSM_LABEL);
  const [widthCm] = labelNumbers(labels, WIDTH_LABEL);

  return {
    id: String(row[FLEXIBEE_PRODUCT_FIELDS.id] ?? ""),
    sku: String(row[FLEXIBEE_PRODUCT_FIELDS.sku] ?? ""),
    name: String(row[FLEXIBEE_PRODUCT_FIELDS.name] ?? ""),
    unitPrice: toNumber(row[FLEXIBEE_PRODUCT_FIELDS.unitPrice]),
    currency: "CZK",
    unit: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.unit]),
    stock,
    stockStatus: toStockStatus(stock),
    group: toGroupCode(row[FLEXIBEE_PRODUCT_FIELDS.group]),
    minOrder: toNullableNumber(row[FLEXIBEE_PRODUCT_FIELDS.minOrder]),
    width:
      widthCm !== undefined
        ? `${widthCm} cm`
        : toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.width]),
    weight:
      gsm !== undefined
        ? `${gsm} g/m²`
        : toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.weight]),
    composition: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.composition]),
    ean: toNullableString(row[FLEXIBEE_PRODUCT_FIELDS.ean]),
    labels,
    imageUrl: null,
    minStock: null,
    notice: null,
  };
};
