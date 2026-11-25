import type { Metadata } from "next";
import Link from "next/link";
import { type SearchParamValues, searchProducts } from "@/lib/products";
import { SiteFooter } from "../_components/site-footer";
import { SiteHeader } from "../_components/site-header";
import { SearchFilters } from "./search-filters";
import {
  SearchEmpty,
  SearchGrid,
  SearchPagination,
  SearchSortBar,
} from "./search-results";
import {
  buildHref,
  readSearchState,
  type SearchState,
  toApiParams,
} from "./search-state";

export const dynamic = "force-dynamic";

// Search result pages are not indexed: they repeat the catalog with many variants.
export const metadata: Metadata = {
  title: "Výsledky vyhledávání",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<SearchParamValues>;
};

/** Czech locative: "v 1 kategorii", "ve 3 kategoriích". */
const categoriesPhrase = (count: number): string =>
  count === 1 ? "v 1 kategorii" : `ve ${count} kategoriích`;

export default async function SearchPage({ searchParams }: PageProps) {
  const state: SearchState = readSearchState(await searchParams);
  const result = await searchProducts(toApiParams(state));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader query={state.q} />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <Breadcrumbs state={state} />

        {result.status === "ok" ? (
          <Results state={state} result={result.result} />
        ) : (
          <p
            role="alert"
            className="rounded-sm border border-hairline bg-card p-6 text-sm"
          >
            Výsledky se momentálně nepodařilo načíst. Zkuste to prosím za
            chvíli.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Breadcrumbs({ state }: { state: SearchState }) {
  return (
    <nav aria-label="Drobečková navigace" className="text-xs text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-brand">
            Domů
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/hledat" className="hover:text-brand">
            Výsledky vyhledávání
          </Link>
        </li>
        {state.q ? (
          <>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">„{state.q}“</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

type Result = Extract<
  Awaited<ReturnType<typeof searchProducts>>,
  { status: "ok" }
>["result"];

function Results({ state, result }: { state: SearchState; result: Result }) {
  const categoryCount = result.categories.filter(
    (category) => category.key !== "all" && category.count > 0,
  ).length;
  const heading = state.q
    ? `Výsledky vyhledávání pro „${state.q}“`
    : "Všechny produkty";

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[28px] leading-9 text-foreground">
          {heading}
        </h1>
        <p className="text-sm text-ink-muted">
          Nalezeno {result.total} položek
          {categoryCount > 0 ? ` ${categoriesPhrase(categoryCount)}` : ""}
        </p>
      </header>

      <nav aria-label="Kategorie" className="flex flex-wrap gap-2">
        {result.categories.map((category) => {
          const active =
            category.key === "all"
              ? state.category === ""
              : state.category === category.key;
          return (
            <Link
              key={category.key}
              href={buildHref({
                ...state,
                category: category.key === "all" ? "" : category.key,
                page: 1,
              })}
              aria-current={active ? "true" : undefined}
              className={`rounded-sm border px-3 py-1.5 text-xs font-semibold ${
                active
                  ? "border-brand bg-brand text-primary-foreground"
                  : "border-hairline bg-card text-foreground hover:border-brand"
              }`}
            >
              {category.label} ({category.count})
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SearchFilters state={state} facets={result.facets} />

        <section
          aria-labelledby="vysledky-nadpis"
          className="flex min-w-0 flex-col gap-6"
        >
          <h2 id="vysledky-nadpis" className="sr-only">
            Produkty
          </h2>
          <SearchSortBar state={state} total={result.total} />
          {result.items.length > 0 ? (
            <SearchGrid items={result.items} />
          ) : (
            <SearchEmpty state={state} />
          )}
          <SearchPagination state={state} total={result.total} />
        </section>
      </div>
    </>
  );
}
