import type {
  AdminProduct,
  AdminProductFilter,
  AdminProductQuery,
} from "@/lib/admin-api";

/** Tabs of the product list. Each one is a link that keeps the search text. */
export const PRODUCT_FILTER_TABS: Array<{
  filter: AdminProductFilter;
  label: string;
}> = [
  { filter: "all", label: "Všechny produkty" },
  { filter: "low", label: "Nízký stav" },
  { filter: "out", label: "Vyprodáno" },
  { filter: "hidden", label: "Skryto pro web" },
];

export const PRODUCT_PAGE_PATH = "/admin/produkty";

/** Link to the product page with the given query; empty values are dropped. */
export const productsHref = (query: AdminProductQuery): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== "all" && value !== 0) {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${PRODUCT_PAGE_PATH}?${qs}` : PRODUCT_PAGE_PATH;
};

/** Stock flags shown next to the quantity. */
export const STOCK_STATUS_LABEL: Record<AdminProduct["stockStatus"], string> = {
  in_stock: "Skladem",
  low_stock: "Nízký stav",
  out_of_stock: "Vyprodáno",
};
