export const dynamic = "force-dynamic";

import {
  type AdminDataResult,
  fetchSettings,
  fetchWarehouses,
} from "@/lib/admin-api";
import { requireAdminUser } from "@/lib/admin-session";
import { WarehouseForm } from "./warehouse-form";

export default async function AdminPage() {
  await requireAdminUser();

  const [warehouses, settings] = await Promise.all([
    fetchWarehouses(),
    fetchSettings(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-newsreader)] text-[26px] leading-8 text-[#1c1917]">
          Zdroj skladu
        </h1>
        <p className="mt-1 text-sm text-[#57534e]">
          Vyberte sklad z Flexibee, ze kterého se budou načítat produkty a
          skladové zásoby. „Globální zásoba“ použije výchozí hodnotu z Flexibee.
        </p>
      </header>

      {warehouses.status === "ok" && settings.status === "ok" ? (
        <WarehouseForm
          warehouses={warehouses.data}
          currentWarehouseId={settings.data.warehouseId}
        />
      ) : (
        <p
          role="alert"
          className="rounded-[4px] border border-[#e2ddd5] bg-white p-3 text-sm"
        >
          {describeError(warehouses, settings)}
        </p>
      )}
    </div>
  );
}

const describeError = (...results: AdminDataResult<unknown>[]): string => {
  if (results.some((result) => result.status === "unauthorized")) {
    return "API odmítla token. Zkontrolujte ADMIN_TOKEN ve www a v API.";
  }
  return "API nebo Flexibee není dostupné, nebo admin není nakonfigurovaný (ADMIN_TOKEN, API_URL, FLEXI_*).";
};
