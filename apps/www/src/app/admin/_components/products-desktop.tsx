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

const CARD = "rounded-[8px] border border-[#e2ddd5] bg-white";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.04em] text-[#78716c]";
const BUTTON =
  "flex h-[30px] items-center rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-xs font-semibold text-[#57534e]";
const CELL = "px-3 py-3 align-top";

type Props = { page: AdminProductPage; query: AdminProductQuery };

/** Desktop product inventory. Content width 960px, as in the Figma frame. */
export function ProductsDesktop({ page, query }: Props) {
  const filter = query.filter ?? "all";

  return (
    <div className="hidden w-full flex-col gap-6 md:flex">
      {/* 1. KPI summary tiles */}
      <section className="grid grid-cols-4 gap-4">
        <Kpi
          highlight
          label="Celkem aktivních SKU"
          value={formatQuantity(page.kpis.totalSku)}
          details={[
            `Skryto pro web: ${formatQuantity(page.kpis.hiddenForWeb)}`,
          ]}
        />
        <Kpi
          label="Hodnota skladu (bez DPH)"
          value={formatCzk(page.kpis.stockValue)}
          details={["Množství × základní cena"]}
        />
        <Kpi
          label="Pod bezpečnostním limitem"
          value={`${formatQuantity(page.kpis.lowStock + page.kpis.outOfStock)} artiklů`}
          details={[`Vyprodáno: ${formatQuantity(page.kpis.outOfStock)}`]}
        />
        <Kpi
          label="Průměrná B2B marže"
          value="–"
          details={["Zatím není napojeno z Flexibee"]}
        />
      </section>

      {/* 2. Search and status tabs */}
      <section className={`${CARD} flex flex-col gap-4 p-4`}>
        <form action={PRODUCT_PAGE_PATH} className="flex items-center gap-3">
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          <input
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            aria-label="Hledání produktu"
            placeholder="Vyhledat název látky nebo SKU..."
            className="h-9 w-full rounded-[4px] border border-[#e2ddd5] bg-[#faf9f6] px-3 text-sm text-[#1c1917] placeholder:text-[#78716c]"
          />
          <button type="submit" className={`${BUTTON} shrink-0`}>
            Hledat
          </button>
        </form>

        <nav className="flex flex-wrap gap-1.5" aria-label="Filtr produktů">
          {PRODUCT_FILTER_TABS.map((tab) => {
            const active = tab.filter === filter;
            return (
              <Link
                key={tab.filter}
                href={productsHref({ ...query, filter: tab.filter, start: 0 })}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-[4px] bg-[#1e3f35] px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-[4px] border border-[#e2ddd5] bg-white px-3 py-1.5 text-xs font-semibold text-[#57534e] hover:bg-[#f4f1ea]"
                }
              >
                {tab.label} ({formatQuantity(page.counts[tab.filter])})
              </Link>
            );
          })}
        </nav>
      </section>

      {/* 3. Dense product table */}
      <section className={`${CARD} flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#e2ddd5] bg-[#faf9f6] px-4 py-3 text-xs text-[#57534e]">
          <span>Produkty v katalogu: {formatQuantity(page.counts.all)}</span>
          <span className="text-[#78716c]">
            Hromadné akce a export zatím nejsou napojeny
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#e2ddd5] bg-[#faf9f6]">
                {[
                  "#",
                  "Foto",
                  "Artikl & SKU",
                  "B2B ceník (bez DPH)",
                  "MOQ",
                  "Sklad",
                  "Stav",
                  "Web",
                ].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={`${LABEL} px-3 py-2.5 font-bold`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-[#57534e]"
                  >
                    Žádné produkty neodpovídají filtru.
                  </td>
                </tr>
              ) : null}
              {page.items.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  index={page.start + index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} query={query} />
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  details,
  highlight = false,
}: {
  label: string;
  value: string;
  details: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`${CARD} flex flex-col gap-4 p-5 ${highlight ? "bg-[#1e3f35] text-white" : ""}`}
    >
      <span className={`${LABEL} ${highlight ? "text-[#c6ebdc]" : ""}`}>
        {label}
      </span>
      <span className="text-[26px] leading-8 font-bold">{value}</span>
      <div className="flex flex-col gap-1 text-xs text-[#57534e]">
        {details.map((detail) => (
          <span key={detail} className={highlight ? "text-[#c6ebdc]" : ""}>
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  index,
}: {
  product: AdminProduct;
  index: number;
}) {
  return (
    <tr className="border-b border-[#e2ddd5] last:border-b-0 hover:bg-[#faf9f6]">
      <td className={`${CELL} text-[#57534e]`}>{index}</td>
      <td className={CELL}>
        {product.imageUrl ? (
          // eslint-disable-next-line /next/no-img-element
          <Image
            src={product.imageUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="size-12 rounded-[4px] border border-[#e2ddd5] object-cover"
          />
        ) : (
          <span className="flex h-8 min-w-8 items-center justify-center rounded-[4px] border border-[#e2ddd5] bg-[#f4ece8] px-1.5 text-[10px] font-bold text-[#57534e]">
            {product.group ?? "–"}
          </span>
        )}
      </td>
      <td className={`${CELL} max-w-[260px]`}>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#1c1917]">{product.name}</span>
          <span className="text-[11px] text-[#78716c]">
            {[
              product.composition,
              product.width && `Šíře: ${product.width}`,
              product.weight,
            ]
              .filter(Boolean)
              .join(" • ") || "–"}
          </span>
          <span className="font-mono text-[11px] text-[#57534e]">
            SKU: {product.sku}
            {product.ean ? ` • EAN: ${product.ean}` : ""}
          </span>
        </div>
      </td>
      <td className={CELL}>
        <span className="text-sm font-bold text-[#1c1917]">
          {formatCzk(product.unitPrice)}
          {product.unit ? (
            <span className="ml-1 text-[11px] font-normal text-[#78716c]">
              / {product.unit}
            </span>
          ) : null}
        </span>
      </td>
      <td className={`${CELL} text-[#57534e]`}>
        {product.minOrder !== null
          ? `MOQ: ${formatQuantity(product.minOrder)}`
          : "–"}
      </td>
      <td className={`${CELL} font-bold text-[#1c1917]`}>
        {formatQuantity(product.stock)}
        {product.minStock !== null ? (
          <span className="block text-[11px] font-normal text-[#78716c]">
            Limit: {formatQuantity(product.minStock)}
          </span>
        ) : null}
      </td>
      <td className={CELL}>
        <span
          className={`rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold ${
            product.stockStatus === "in_stock"
              ? "bg-[#e8ece9] text-[#1e3f35]"
              : product.stockStatus === "low_stock"
                ? "bg-[#fff4d6] text-[#7a5a00]"
                : "bg-[#ffdad6] text-[#93000a]"
          }`}
        >
          {STOCK_STATUS_LABEL[product.stockStatus]}
        </span>
      </td>
      <td className={CELL}>
        <span
          className={`rounded-[2px] px-1.5 py-0.5 text-[11px] font-semibold ${
            product.visibleForWeb
              ? "bg-[#e8ece9] text-[#1e3f35]"
              : "bg-[#f4f1ea] text-[#78716c]"
          }`}
        >
          {product.visibleForWeb ? "Zobrazeno" : "Skryto"}
        </span>
      </td>
    </tr>
  );
}
