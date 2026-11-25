import type { SearchParamValues } from "@/lib/products";

/** Products per results page; matches the API default. */
export const SEARCH_PAGE_SIZE = 6;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "name_asc", label: "Název A–Z" },
  { value: "price_asc", label: "Cena: od nejnižší" },
  { value: "price_desc", label: "Cena: od nejvyšší" },
  { value: "stock_desc", label: "Největší zásoba" },
] as const;

/** Everything the results page reads from the URL. Lists are repeated parameters. */
export type SearchState = {
  q: string;
  availability: string[];
  fabricType: string[];
  gsm: string[];
  widthCm: string[];
  certification: string[];
  priceMin: string;
  priceMax: string;
  category: string;
  sort: string;
  page: number;
};

export type ListKey =
  | "availability"
  | "fabricType"
  | "gsm"
  | "widthCm"
  | "certification";

const first = (value: string | string[] | undefined): string => {
  const text = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return text.trim();
};

const list = (value: string | string[] | undefined): string[] =>
  (Array.isArray(value) ? value : [value ?? ""])
    .map((item) => item.trim())
    .filter((item) => item !== "");

export const readSearchState = (params: SearchParamValues): SearchState => {
  const page = Number.parseInt(first(params.strana), 10);

  return {
    q: first(params.q),
    availability: list(params.availability),
    fabricType: list(params.fabricType),
    gsm: list(params.gsm),
    widthCm: list(params.widthCm),
    certification: list(params.certification),
    priceMin: first(params.priceMin),
    priceMax: first(params.priceMax),
    category: first(params.category),
    sort: first(params.sort),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
};

/** Parameters for the API call: the page number becomes `start`. */
export const toApiParams = (state: SearchState): SearchParamValues => ({
  q: state.q,
  availability: state.availability,
  fabricType: state.fabricType,
  gsm: state.gsm,
  widthCm: state.widthCm,
  certification: state.certification,
  priceMin: state.priceMin,
  priceMax: state.priceMax,
  category: state.category,
  sort: state.sort,
  limit: String(SEARCH_PAGE_SIZE),
  start: String((state.page - 1) * SEARCH_PAGE_SIZE),
});

/** `/hledat?...` for a state. Empty values are left out of the URL. */
export const buildHref = (state: SearchState): string => {
  const search = new URLSearchParams();
  const scalars: Array<[string, string]> = [
    ["q", state.q],
    ["priceMin", state.priceMin],
    ["priceMax", state.priceMax],
    ["category", state.category],
    ["sort", state.sort],
  ];
  for (const [key, value] of scalars) {
    if (value !== "") {
      search.set(key, value);
    }
  }
  const lists: ListKey[] = [
    "availability",
    "fabricType",
    "gsm",
    "widthCm",
    "certification",
  ];
  for (const key of lists) {
    for (const value of state[key]) {
      search.append(key, value);
    }
  }
  if (state.page > 1) {
    search.set("strana", String(state.page));
  }
  const query = search.toString();
  return query ? `/hledat?${query}` : "/hledat";
};

/** Adds the value to a list filter, or removes it when already selected. Resets the page. */
export const toggleValue = (
  state: SearchState,
  key: ListKey,
  value: string,
): SearchState => {
  const current = state[key];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return { ...state, [key]: next, page: 1 };
};

/** Whether any filter (not the query, sort or page) is set. */
export const hasFilters = (state: SearchState): boolean =>
  state.availability.length > 0 ||
  state.fabricType.length > 0 ||
  state.gsm.length > 0 ||
  state.widthCm.length > 0 ||
  state.certification.length > 0 ||
  state.priceMin !== "" ||
  state.priceMax !== "" ||
  state.category !== "";
