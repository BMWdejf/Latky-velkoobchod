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
};

export type ProductPage = {
  items: Product[];
  limit: number;
  start: number;
};

export type ProductsResult =
  | { status: "ok"; page: ProductPage }
  | { status: "unavailable" };

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
