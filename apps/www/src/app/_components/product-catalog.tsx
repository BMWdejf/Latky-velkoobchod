import { AlertCircle } from "lucide-react";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "./product-card";

const PAGE_SIZE = 6;

const categories = ["Všechny materiály", "Teplákovina", "Úplety", "Povlečení"];

/** Server component: loads the catalog from apps/api and renders it. */
export async function ProductCatalog() {
  const result = await fetchProducts(PAGE_SIZE);

  return (
    <section
      id="katalog"
      aria-labelledby="catalog-heading"
      className="mx-auto max-w-[1280px] scroll-mt-40 px-4 py-12 md:px-6 md:py-16 lg:px-8"
    >
      <div className="flex flex-col gap-4 border-b border-hairline lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <h2
            id="catalog-heading"
            className="font-serif text-[26px] leading-8 text-foreground"
          >
            Aktuální skladové zásoby pro rychlý nákup
          </h2>
          <p className="text-sm text-ink-muted">
            {result.status === "ok"
              ? `Zobrazeno ${result.page.items.length} vybraných velkoobchodních artiklů ze skladu Praha – Horní Počernice`
              : "Skladové zásoby se momentálně nepodařilo načíst"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-ink-muted">
            Filtr:
          </span>
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              disabled
              aria-pressed={index === 0}
              className={`rounded-sm border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${
                index === 0
                  ? "border-brand bg-brand text-primary-foreground"
                  : "border-hairline bg-card text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {result.status === "ok" && result.page.items.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
          {result.page.items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div
          aria-live="polite"
          className="mt-8 flex items-start gap-3 rounded-sm border border-hairline bg-card p-6 text-sm text-foreground"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-brand"
            aria-hidden="true"
          />
          <p>
            {result.status === "ok"
              ? "Momentálně nejsou k dispozici žádné položky."
              : "Katalog se nepodařilo načíst. Zkuste to prosím za chvíli."}
          </p>
        </div>
      )}
    </section>
  );
}
