import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductCard } from "../_components/product-card";
import { HiddenStateInputs } from "./hidden-state-inputs";
import {
  buildHref,
  hasFilters,
  SEARCH_PAGE_SIZE,
  type SearchState,
  SORT_OPTIONS,
} from "./search-state";

export function SearchSortBar({
  state,
  total,
}: {
  state: SearchState;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-hairline pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-muted">Zobrazeno {total} výsledků</p>
      <form
        action="/hledat"
        method="get"
        className="flex w-full items-center gap-2 sm:w-auto"
      >
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground sm:flex-none">
          <span className="shrink-0 font-semibold">Řadit:</span>
          <select
            name="sort"
            defaultValue={state.sort || "relevance"}
            className="h-9 min-w-0 flex-1 rounded-sm border border-hairline bg-background px-2 text-sm sm:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <HiddenStateInputs state={state} omit={["sort", "page"]} />
        <button
          type="submit"
          className="h-9 shrink-0 rounded-sm border border-brand px-3 text-sm font-semibold text-brand"
        >
          Použít
        </button>
      </form>
    </div>
  );
}

export function SearchEmpty({ state }: { state: SearchState }) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-3 rounded-sm border border-hairline bg-card p-6"
    >
      <h2 className="font-serif text-xl text-foreground">Nic jsme nenašli</h2>
      <p className="text-sm text-ink-muted">
        Zkuste jiný výraz nebo upravte filtry. Přesné SKU můžete zadat do
        hledání v hlavičce.
      </p>
      {hasFilters(state) ? (
        <Link
          href={buildHref({
            ...state,
            availability: [],
            fabricType: [],
            gsm: [],
            widthCm: [],
            certification: [],
            priceMin: "",
            priceMax: "",
            category: "",
            page: 1,
          })}
          className="self-start text-sm font-semibold text-brand underline"
        >
          Zrušit filtry
        </Link>
      ) : null}
    </div>
  );
}

export function SearchGrid({ items }: { items: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

const pageLink = (state: SearchState, page: number): string =>
  buildHref({ ...state, page });

export function SearchPagination({
  state,
  total,
}: {
  state: SearchState;
  total: number;
}) {
  const pages = Math.ceil(total / SEARCH_PAGE_SIZE);
  if (pages <= 1) {
    return null;
  }

  const from = (state.page - 1) * SEARCH_PAGE_SIZE + 1;
  const to = Math.min(state.page * SEARCH_PAGE_SIZE, total);

  return (
    <nav
      aria-label="Stránkování"
      className="flex flex-col items-center gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-ink-muted">
        Zobrazeno {from}–{to} z {total}
      </p>
      <ul className="flex items-center gap-1 text-sm">
        {state.page > 1 ? (
          <li>
            <Link
              href={pageLink(state, state.page - 1)}
              className="px-2 py-1 text-brand"
            >
              Předchozí
            </Link>
          </li>
        ) : null}
        {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
          <li key={page}>
            <Link
              href={pageLink(state, page)}
              aria-current={page === state.page ? "page" : undefined}
              className={`rounded-sm px-2.5 py-1 ${
                page === state.page
                  ? "bg-brand text-primary-foreground"
                  : "text-foreground hover:text-brand"
              }`}
            >
              {page}
            </Link>
          </li>
        ))}
        {state.page < pages ? (
          <li>
            <Link
              href={pageLink(state, state.page + 1)}
              className="px-2 py-1 text-brand"
            >
              Další
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
