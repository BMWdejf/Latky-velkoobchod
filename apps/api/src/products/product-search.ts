import {
  GSM_LABEL,
  labelNumbers,
  type Product,
  type StockStatus,
  WIDTH_LABEL,
} from "./product.mapper";

/**
 * Pure search over already-visible products: no Nest or Flexibee dependencies.
 * Unknown parameter values are ignored, never an error.
 */

export const SEARCH_SORTS = [
  "relevance",
  "name_asc",
  "price_asc",
  "price_desc",
  "stock_desc",
] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const SEARCH_DEFAULT_LIMIT = 6;
export const SEARCH_MAX_LIMIT = 100;

/**
 * Fabric type and certification are Flexibee labels (štítky) with a prefix:
 * `TYP_POCESANA` is a fabric type, `CERT_OEKOTEX` a certification. Every label
 * with the prefix becomes a filter value (matched without case or diacritics);
 * the rest of the label is the name shown. Other labels are ignored.
 */
export const FABRIC_TYPE_PREFIX = "typ_";
export const CERTIFICATION_PREFIX = "cert_";

/**
 * Category pills and the group codes (`skupZboz`) behind them.
 * The codes are not known yet, so until they are filled in a category has no products.
 */
export const SEARCH_CATEGORIES: ReadonlyArray<{
  key: string;
  label: string;
  groups: readonly string[];
}> = [
  { key: "metraz", label: "Metráž & Teplákoviny v rolích", groups: [] },
  { key: "uplety", label: "Úplety a lemy", groups: [] },
  { key: "doplnky", label: "Doplňky & ložní prádlo", groups: [] },
];

const ALL_CATEGORY_KEY = "all";
const ALL_CATEGORY_LABEL = "Všechny výsledky";

export const AVAILABILITY_VALUES: readonly StockStatus[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
];

export type SearchQuery = {
  q: string;
  availability: StockStatus[];
  fabricType: string[];
  gsm: number[];
  widthCm: number[];
  certification: string[];
  priceMin: number | null;
  priceMax: number | null;
  category: string | null;
  sort: SearchSort;
  limit: number;
  start: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const firstText = (raw: string | string[] | undefined): string => {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  return value.trim();
};

/** `a,b` or repeated params -> list of trimmed, non-empty values. */
const listParam = (raw: string | string[] | undefined): string[] =>
  (Array.isArray(raw) ? raw : [raw ?? ""])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value !== "");

const numberList = (raw: string | string[] | undefined): number[] =>
  listParam(raw)
    .map(Number)
    .filter((value) => Number.isFinite(value));

const numberParam = (raw: string | string[] | undefined): number | null => {
  const text = firstText(raw);
  if (text === "") {
    return null;
  }
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

const intParam = (
  raw: string | string[] | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  const value = numberParam(raw);
  if (value === null) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(value), min), max);
};

const oneOf = <T extends string>(
  values: readonly T[],
  raw: string | string[] | undefined,
): T[] =>
  listParam(raw).filter((value): value is T =>
    (values as readonly string[]).includes(value),
  );

/** Reads query-string parameters into a typed query. Invalid values are dropped. */
export const parseSearchQuery = (params: SearchParams): SearchQuery => {
  const category = firstText(params.category);
  const sort = firstText(params.sort);

  return {
    q: firstText(params.q),
    availability: oneOf(AVAILABILITY_VALUES, params.availability),
    fabricType: prefixedList(FABRIC_TYPE_PREFIX, params.fabricType),
    gsm: numberList(params.gsm),
    widthCm: numberList(params.widthCm),
    certification: prefixedList(CERTIFICATION_PREFIX, params.certification),
    priceMin: numberParam(params.priceMin),
    priceMax: numberParam(params.priceMax),
    category: SEARCH_CATEGORIES.some((item) => item.key === category)
      ? category
      : null,
    sort: (SEARCH_SORTS as readonly string[]).includes(sort)
      ? (sort as SearchSort)
      : "relevance",
    limit: intParam(params.limit, SEARCH_DEFAULT_LIMIT, 1, SEARCH_MAX_LIMIT),
    start: intParam(params.start, 0, 0, Number.MAX_SAFE_INTEGER),
  };
};

/** Lower case, no diacritics: `Teplákovina` -> `teplakovina`. */
export const normalizeText = (value: string): string =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("cs-CZ");

/** Normalized keys of labels with the prefix, e.g. `typ_pocesana`; other values are dropped. */
const prefixedList = (
  prefix: string,
  raw: string | string[] | undefined,
): string[] =>
  listParam(raw)
    .map(normalizeText)
    .filter((key) => key.startsWith(prefix) && key.length > prefix.length);

/** Whether the product has a label whose normalized text equals `key`. */
const hasLabel = (product: Product, key: string): boolean =>
  product.labels.some((label) => normalizeText(label) === key);

export const gsmValues = (product: Product): number[] =>
  labelNumbers(product.labels, GSM_LABEL);

export const widthValues = (product: Product): number[] =>
  labelNumbers(product.labels, WIDTH_LABEL);

const textFields = (product: Product): string[] => [
  product.name,
  product.sku,
  product.ean ?? "",
];

const matchesText = (product: Product, q: string): boolean => {
  const needle = normalizeText(q);
  return (
    needle === "" ||
    textFields(product).some((field) => normalizeText(field).includes(needle))
  );
};

type FacetKey =
  | "text"
  | "availability"
  | "fabricType"
  | "gsm"
  | "widthCm"
  | "certification"
  | "price"
  | "category";

/** Whether the product passes every filter except the ones in `skip`. */
const matches = (
  product: Product,
  query: SearchQuery,
  skip: ReadonlySet<FacetKey> = new Set(),
): boolean => {
  const on = (key: FacetKey) => !skip.has(key);

  if (on("text") && !matchesText(product, query.q)) {
    return false;
  }
  if (
    on("availability") &&
    query.availability.length > 0 &&
    !query.availability.includes(product.stockStatus)
  ) {
    return false;
  }
  if (
    on("fabricType") &&
    query.fabricType.length > 0 &&
    !query.fabricType.some((key) => hasLabel(product, key))
  ) {
    return false;
  }
  if (
    on("certification") &&
    query.certification.length > 0 &&
    !query.certification.some((key) => hasLabel(product, key))
  ) {
    return false;
  }
  if (
    on("gsm") &&
    query.gsm.length > 0 &&
    !gsmValues(product).some((value) => query.gsm.includes(value))
  ) {
    return false;
  }
  if (
    on("widthCm") &&
    query.widthCm.length > 0 &&
    !widthValues(product).some((value) => query.widthCm.includes(value))
  ) {
    return false;
  }
  if (
    on("price") &&
    ((query.priceMin !== null && product.unitPrice < query.priceMin) ||
      (query.priceMax !== null && product.unitPrice > query.priceMax))
  ) {
    return false;
  }
  if (on("category") && query.category !== null) {
    const category = SEARCH_CATEGORIES.find(
      (item) => item.key === query.category,
    );
    if (!category || !category.groups.includes(product.group ?? "")) {
      return false;
    }
  }
  return true;
};

export type FacetValue<T> = { value: T; count: number };

/** A prefixed label: `value` is the normalized key used in the query, `label` the name shown. */
export type LabelFacet = { value: string; label: string; count: number };

export type SearchResult = {
  items: Product[];
  total: number;
  limit: number;
  start: number;
  categories: Array<{ key: string; label: string; count: number }>;
  facets: {
    availability: FacetValue<StockStatus>[];
    fabricType: LabelFacet[];
    gsm: FacetValue<number>[];
    widthCm: FacetValue<number>[];
    certification: LabelFacet[];
    price: { min: number; max: number } | null;
  };
};

const countBy = <T>(
  products: Product[],
  values: readonly T[],
  hasValue: (product: Product, value: T) => boolean,
): FacetValue<T>[] =>
  values.map((value) => ({
    value,
    count: products.filter((product) => hasValue(product, value)).length,
  }));

/** `TYP_POCESANA` with prefix `typ_` -> `Pocesana`; underscores become spaces. */
const labelName = (text: string, prefix: string): string => {
  const rest = text
    .slice(prefix.length)
    .replace(/_/g, " ")
    .trim()
    .toLocaleLowerCase("cs-CZ");
  return rest.charAt(0).toLocaleUpperCase("cs-CZ") + rest.slice(1);
};

/** Prefixed labels found in the candidates, sorted by name, with product counts. */
const labelFacets = (products: Product[], prefix: string): LabelFacet[] => {
  const found = new Map<string, { label: string; count: number }>();
  for (const product of products) {
    const seen = new Set<string>();
    for (const text of product.labels) {
      const key = normalizeText(text);
      if (!key.startsWith(prefix) || key.length <= prefix.length) {
        continue;
      }
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const entry = found.get(key) ?? {
        label: labelName(text, prefix),
        count: 0,
      };
      entry.count += 1;
      found.set(key, entry);
    }
  }
  return [...found.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "cs"));
};

/** Distinct numeric label values in the candidates, ascending, with product counts. */
const numericValues = (
  products: Product[],
  read: (product: Product) => number[],
): FacetValue<number>[] => {
  const counts = new Map<number, number>();
  for (const product of products) {
    for (const value of new Set(read(product))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({ value, count }));
};

const byRelevance = (q: string) => (a: Product, b: Product) => {
  if (q.trim() !== "") {
    const rank = (product: Product) =>
      normalizeText(product.name).includes(normalizeText(q)) ? 0 : 1;
    const diff = rank(a) - rank(b);
    if (diff !== 0) {
      return diff;
    }
  }
  return Number(a.id) - Number(b.id);
};

const sortProducts = (products: Product[], query: SearchQuery): Product[] => {
  const sorted = [...products];
  switch (query.sort) {
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "cs"));
    case "price_asc":
      return sorted.sort((a, b) => a.unitPrice - b.unitPrice);
    case "price_desc":
      return sorted.sort((a, b) => b.unitPrice - a.unitPrice);
    case "stock_desc":
      return sorted.sort((a, b) => b.stock - a.stock);
    default:
      return sorted.sort(byRelevance(query.q));
  }
};

/**
 * Filters, counts facets and sorts. Each facet is counted with its own filter
 * left out, so the user can still see what the other choices would give.
 */
export const searchProducts = (
  products: Product[],
  query: SearchQuery,
): SearchResult => {
  const matching = sortProducts(
    products.filter((product) => matches(product, query)),
    query,
  );

  const candidates = (...skip: FacetKey[]) =>
    products.filter((product) => matches(product, query, new Set(skip)));

  const categoryCandidates = candidates("category");
  const categories = [
    {
      key: ALL_CATEGORY_KEY,
      label: ALL_CATEGORY_LABEL,
      count: categoryCandidates.length,
    },
    ...SEARCH_CATEGORIES.map((category) => ({
      key: category.key,
      label: category.label,
      count: categoryCandidates.filter((product) =>
        category.groups.includes(product.group ?? ""),
      ).length,
    })),
  ];

  const priceCandidates = candidates("price");
  const prices = priceCandidates.map((product) => product.unitPrice);

  return {
    items: matching.slice(query.start, query.start + query.limit),
    total: matching.length,
    limit: query.limit,
    start: query.start,
    categories,
    facets: {
      availability: countBy(
        candidates("availability"),
        AVAILABILITY_VALUES,
        (product, value) => product.stockStatus === value,
      ),
      fabricType: labelFacets(candidates("fabricType"), FABRIC_TYPE_PREFIX),
      gsm: numericValues(candidates("gsm"), gsmValues),
      widthCm: numericValues(candidates("widthCm"), widthValues),
      certification: labelFacets(
        candidates("certification"),
        CERTIFICATION_PREFIX,
      ),
      price:
        prices.length === 0
          ? null
          : { min: Math.min(...prices), max: Math.max(...prices) },
    },
  };
};
