export const dynamic = "force-dynamic";

import {
  type AdminDataResult,
  type AdminProductFilter,
  type AdminProductPage,
  type AdminProductQuery,
  fetchAdminProducts,
} from "@/lib/admin-api";
import { requireAdminUser } from "@/lib/admin-session";
import { ProductsDesktop } from "../_components/products-desktop";
import { ProductsMobile } from "../_components/products-mobile";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTERS: AdminProductFilter[] = ["all", "low", "out", "hidden"];

/** Products & SKU inventory. Data comes from the API; filters are URL query parameters. */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminUser();

  const query = parseQuery(await searchParams);
  const result = await fetchAdminProducts(query);

  if (result.status !== "ok") {
    return (
      <p
        role="alert"
        className="rounded-[4px] border border-[#e2ddd5] bg-white p-3 text-sm"
      >
        {describeError(result)}
      </p>
    );
  }

  const page: AdminProductPage = result.data;

  return (
    <>
      <ProductsDesktop page={page} query={query} />
      <ProductsMobile page={page} query={query} />
    </>
  );
}

const parseQuery = (
  params: Record<string, string | string[] | undefined>,
): AdminProductQuery => {
  const text = (name: string): string | undefined => {
    const value = params[name];
    return typeof value === "string" && value.trim() !== ""
      ? value.trim().slice(0, 100)
      : undefined;
  };
  const filter = text("filter") as AdminProductFilter | undefined;
  const start = Number(text("start"));

  return {
    q: text("q"),
    filter: filter && FILTERS.includes(filter) ? filter : "all",
    start: Number.isInteger(start) && start > 0 ? start : 0,
    limit: 10,
  };
};

const describeError = (result: AdminDataResult<unknown>): string => {
  if (result.status === "unauthorized") {
    return "API odmítla token. Zkontrolujte ADMIN_TOKEN ve www a v API.";
  }
  if (result.status === "invalid") {
    return result.message;
  }
  return "API nebo Flexibee není dostupné, nebo admin není nakonfigurovaný (ADMIN_TOKEN, API_URL, FLEXI_*).";
};
