export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Mirrors the `Product` DTO returned by `GET /products` in apps/api. */
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
  /** Photo URL, or null when the product has no photo. */
  imageUrl: string | null;
  /** Stock text from the admin rules (e.g. "Očekáváme naskladnění"), or null. */
  notice: string | null;
};

export type ProductPage = {
  items: Product[];
  limit: number;
  start: number;
};

export type ProductsResult =
  | { status: "ok"; page: ProductPage }
  | { status: "unavailable" };

export type SearchFacetValue<T> = { value: T; count: number };

/** Prefixed label facet: `value` goes into the query, `label` is shown. */
export type SearchLabelFacet = { value: string; label: string; count: number };

/** Mirrors `GET /products/search` in apps/api. */
export type SearchResult = {
  items: Product[];
  total: number;
  limit: number;
  start: number;
  categories: Array<{ key: string; label: string; count: number }>;
  facets: {
    availability: SearchFacetValue<StockStatus>[];
    fabricType: SearchLabelFacet[];
    gsm: SearchFacetValue<number>[];
    widthCm: SearchFacetValue<number>[];
    certification: SearchLabelFacet[];
    price: { min: number; max: number } | null;
  };
};

export type SearchResultState =
  | { status: "ok"; result: SearchResult }
  | { status: "unavailable" };

/** Query-string values as Next passes them to a page. */
export type SearchParamValues = Record<string, string | string[] | undefined>;

const apiBaseUrl = (): string =>
  (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Loads the product list from apps/api on the server. Never throws: the page
 * renders an error state instead of failing the whole request.
 */
export const fetchProducts = async (limit: number): Promise<ProductsResult> => {
  try {
    const response = await fetch(
      `${apiBaseUrl()}/products?limit=${limit}&start=0`,
      // Never cache: a failed response must not be stored, and the API owns caching.
      { cache: "no-store" },
    );

    if (!response.ok) {
      return { status: "unavailable" };
    }

    const page = (await response.json()) as ProductPage;
    return { status: "ok", page };
  } catch {
    return { status: "unavailable" };
  }
};

/** Builds the API query string; repeated values become comma-separated lists. */
const toQueryString = (params: SearchParamValues): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const text = Array.isArray(value) ? value.join(",") : value;
    if (text !== undefined && text !== "") {
      search.set(key, text);
    }
  }
  return search.toString();
};

/**
 * Loads search results from apps/api on the server. Never throws: the page
 * renders an error state instead of failing the whole request.
 */
export const searchProducts = async (
  params: SearchParamValues,
): Promise<SearchResultState> => {
  try {
    const query = toQueryString(params);
    const response = await fetch(
      `${apiBaseUrl()}/products/search${query ? `?${query}` : ""}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return { status: "unavailable" };
    }

    const result = (await response.json()) as SearchResult;
    return { status: "ok", result };
  } catch {
    return { status: "unavailable" };
  }
};
