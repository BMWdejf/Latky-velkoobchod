import Link from "next/link";
import type { AdminProductPage, AdminProductQuery } from "@/lib/admin-api";
import { formatQuantity } from "@/lib/format";
import { productsHref } from "./products-data";

type Props = { page: AdminProductPage; query: AdminProductQuery };

const NAV_LINK =
  "rounded-[4px] border border-[#e2ddd5] bg-white px-3 py-1.5 font-semibold";

/** Previous/next links and the page position. Keeps the current filters. */
export function Pagination({ page, query }: Props) {
  const pageCount = Math.max(1, Math.ceil(page.total / page.limit));
  const current = Math.floor(page.start / page.limit) + 1;
  const from = page.total === 0 ? 0 : page.start + 1;
  const to = Math.min(page.start + page.limit, page.total);
  const hrefFor = (target: number) =>
    productsHref({ ...query, start: (target - 1) * page.limit });

  return (
    <nav
      aria-label="Stránkování"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2ddd5] px-4 py-3 text-xs text-[#57534e]"
    >
      <span>
        Zobrazeno {formatQuantity(from)}–{formatQuantity(to)} z{" "}
        {formatQuantity(page.total)} položek
      </span>
      <div className="flex items-center gap-2">
        {current > 1 ? (
          <Link href={hrefFor(current - 1)} className={NAV_LINK}>
            Předchozí
          </Link>
        ) : null}
        <span>
          Strana {current} z {pageCount}
        </span>
        {current < pageCount ? (
          <Link href={hrefFor(current + 1)} className={NAV_LINK}>
            Další
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
