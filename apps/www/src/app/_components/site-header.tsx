import { Search, ShoppingBag, User } from "lucide-react";

const navigation = [
  { label: "Vše v katalogu", href: "#katalog" },
  { label: "Látky – metráž", href: "#katalog" },
  { label: "Teplákovina", href: "#katalog" },
  { label: "Úplety", href: "#katalog" },
  { label: "Povlečení", href: "#katalog" },
  { label: "Rychlá objednávka", href: "#katalog" },
  { label: "Novinky", href: "#katalog" },
  { label: "Výprodej", href: "#katalog" },
  { label: "Akce", href: "#katalog" },
];

/**
 * Search and cart are placeholders for now: they are rendered but disabled,
 * so the layout matches the design without pretending to be functional.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-4 md:px-6 lg:px-10">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 font-serif text-xl text-brand"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-sm bg-brand text-sm text-primary-foreground"
          >
            L
          </span>
          <span className="whitespace-nowrap">Látky Velkoobchod</span>
        </a>

        <label className="relative hidden flex-1 md:block">
          <span className="sr-only">Hledat podle názvu, SKU nebo EAN</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            disabled
            placeholder="Hledat podle názvu, SKU nebo EAN…"
            className="h-10 w-full rounded-sm border border-hairline bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-ink-muted disabled:cursor-not-allowed"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-sm bg-sage px-2.5 py-1 text-xs font-semibold text-brand lg:inline-block">
            Partner Gold (-15%)
          </span>
          <button
            type="button"
            disabled
            aria-label="Košík (brzy)"
            className="relative flex size-9 items-center justify-center rounded-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled
            aria-label="Uživatelský profil (brzy)"
            className="flex size-9 items-center justify-center rounded-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <User className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav aria-label="Hlavní navigace" className="border-t border-hairline">
        <ul className="mx-auto flex max-w-[1280px] gap-6 overflow-x-auto px-4 py-2.5 text-sm font-semibold text-foreground md:px-6 lg:px-10">
          {navigation.map((item) => (
            <li key={item.label} className="shrink-0">
              <a href={item.href} className="hover:text-brand">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
