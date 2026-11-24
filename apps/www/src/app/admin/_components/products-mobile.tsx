import Image from "next/image";
import Link from "next/link";
import type {
  AdminProduct,
  AdminProductPage,
  AdminProductQuery,
} from "@/lib/admin-api";
import { formatCzk, formatQuantity } from "@/lib/format";
import {
  PRODUCT_FILTER_TABS,
  PRODUCT_PAGE_PATH,
  productsHref,
  STOCK_STATUS_LABEL,
} from "./products-data";
import { Pagination } from "./products-pagination";

const CARD = "rounded-[12px] border border-[#e2ddd5] bg-white";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.04em] text-[#78716c]";

type Props = { page: AdminProductPage; query: AdminProductQuery };

/** Mobile product list: 2x2 KPI grid, search, filters and one card per product. */
export function ProductsMobile({ page, query }: Props) {
  const filter = query.filter ?? "all";

  return (
    <div className="flex flex-col gap-0 md:hidden">
      {/* 1. KPI tiles in a 2x2 grid */}
      <section className="grid grid-cols-2 gap-2.5 py-2">
        <Kpi
          highlight
          label="Aktivní SKU"
          value={formatQuantity(page.kpis.totalSku)}
          detail={`Skryto pro web: ${formatQuantity(page.kpis.hiddenForWeb)}`}
        />
        <Kpi
          label="Hodnota skladu"
          value={formatCzk(page.kpis.stockValue)}
          detail="Množství × základní cena"
        />
        <Kpi
          label="Pod limitem"
          value={`${formatQuantity(page.kpis.lowStock + page.kpis.outOfStock)} artiklů`}
          detail={`Vyprodáno: ${formatQuantity(page.kpis.outOfStock)}`}
        />
        <Kpi label="Průměrná marže" value="–" detail="Zatím není napojeno" />
      </section>

      {/* 2. Search and filters */}
      <section className="flex flex-col gap-3 pt-3">
        <form action={PRODUCT_PAGE_PATH} className="flex gap-2">
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          <input
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            aria-label="Hledání produktu"
            placeholder="Hledat název látky nebo SKU..."
            className="h-11 w-full rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-sm text-[#1c1917] placeholder:text-[#78716c]"
          />
        </form>

        <nav
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1"
          aria-label="Filtr produktů"
        >
          {PRODUCT_FILTER_TABS.map((tab) => {
            const active = tab.filter === filter;
            return (
              <Link
                key={tab.filter}
                href={productsHref({ ...query, filter: tab.filter, start: 0 })}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "shrink-0 rounded-[4px] bg-[#052920] px-3 py-1.5 text-xs font-semibold text-white"
                    : "shrink-0 rounded-[4px] border border-[#e2ddd5] bg-white px-3 py-1.5 text-xs font-semibold text-[#57534e]"
                }
              >
                {tab.label} ({formatQuantity(page.counts[tab.filter])})
              </Link>
            );
          })}
        </nav>
      </section>

      {/* 3. Product cards */}
      <section className="flex flex-col gap-3 pt-4">
        {page.items.length === 0 ? (
          <p className="text-sm text-[#57534e]">
            Žádné produkty neodpovídají filtru.
          </p>
        ) : null}
        {page.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {/* 4. Pagination */}
      <section className="pt-5 pb-2">
        <Pagination page={page} query={query} />
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`${CARD} flex flex-col gap-2 p-3 ${highlight ? "bg-[#052920] text-white" : ""}`}
    >
      <span className={`${LABEL} ${highlight ? "text-[#c6ebdc]" : ""}`}>
        {label}
      </span>
      <span className="text-lg leading-6 font-bold">{value}</span>
      <span className="text-[11px] leading-4 text-[#57534e]">{detail}</span>
    </div>
  );
}

function ProductCard({ product }: { product: AdminProduct }) {
  const outOfStock = product.stockStatus === "out_of_stock";

  return (
    <article className={`${CARD} flex flex-col gap-3 p-4`}>
      <div className="flex items-start justify-between gap-2">
        {product.imageUrl ? (
          // eslint-disable-next-line /next/no-img-element
          <Image
            src={product.imageUrl}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="size-14 rounded-[4px] border border-[#e2ddd5] object-cover"
          />
        ) : (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-[4px] border border-[#e2ddd5] bg-[#f4ece8] px-1.5 text-[10px] font-bold text-[#57534e]">
            {product.group ?? "–"}
          </span>
        )}
        <div className="flex flex-wrap justify-end gap-1">
          <span className="rounded-[2px] bg-[#f4f1ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1c1917]">
            {STOCK_STATUS_LABEL[product.stockStatus]}
          </span>
          {product.visibleForWeb ? null : (
            <span className="rounded-[2px] bg-[#f4f1ea] px-1.5 py-0.5 text-[10px] font-semibold text-[#78716c]">
              Skryto
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm leading-5 font-bold text-[#1c1917]">
          {product.name}
        </h3>
        <span className="font-mono text-[11px] text-[#78716c]">
          SKU: {product.sku}
          {product.ean ? ` • EAN: ${product.ean}` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-1 border-t border-[#e2ddd5] pt-3">
        <span className="text-base font-bold text-[#1c1917]">
          {formatCzk(product.unitPrice)}
          {product.unit ? ` / ${product.unit}` : ""}
        </span>
        {product.minOrder !== null ? (
          <span className="w-fit rounded-[2px] border border-[#e2ddd5] bg-[#f4f1ea] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#1c1917]">
            MOQ: {formatQuantity(product.minOrder)}
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between text-xs">
        <div className="flex flex-col gap-0.5">
          <span className={LABEL}>Sklad celkem</span>
          <span
            className={`font-bold ${outOfStock ? "text-[#93000a]" : "text-[#1c1917]"}`}
          >
            {formatQuantity(product.stock)}
          </span>
          {product.minStock !== null ? (
            <span className="text-[10px] text-[#57534e]">
              Limit: {formatQuantity(product.minStock)}
            </span>
          ) : null}
        </div>
        {product.width ? (
          <span className="text-[#57534e]">Šíře: {product.width}</span>
        ) : null}
      </div>
    </article>
  );
}
