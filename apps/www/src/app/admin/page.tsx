export const dynamic = "force-dynamic";

import {
  type AdminDataResult,
  fetchSettings,
  fetchWarehouses,
} from "@/lib/admin-api";
import { requireAdminUser } from "@/lib/admin-session";
import { signOutAction } from "./login/actions";
import { WarehouseForm } from "./warehouse-form";

export default async function AdminPage() {
  const user = await requireAdminUser();

  const [warehouses, settings] = await Promise.all([
    fetchWarehouses(),
    fetchSettings(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin – zdroj skladu</h1>
          <p className="text-sm text-muted-foreground">
            Vyberte sklad z Flexibee, ze kterého se budou načítat produkty a
            skladové zásoby. „Globální zásoba“ použije výchozí hodnotu z
            Flexibee.
          </p>
        </div>
        <form action={signOutAction}>
          <span className="block text-xs text-muted-foreground">
            {user.email}
          </span>
          <button type="submit" className="text-sm underline">
            Odhlásit
          </button>
        </form>
      </header>

      {warehouses.status === "ok" && settings.status === "ok" ? (
        <WarehouseForm
          warehouses={warehouses.data}
          currentWarehouseId={settings.data.warehouseId}
          currentRules={settings.data.rules}
        />
      ) : (
        <p role="alert" className="rounded-md border p-3 text-sm">
          {describeError(warehouses, settings)}
        </p>
      )}
    </main>
  );
}

const describeError = (...results: AdminDataResult<unknown>[]): string => {
  if (results.some((result) => result.status === "unauthorized")) {
    return "API odmítla token. Zkontrolujte ADMIN_TOKEN ve www a v API.";
  }
  return "API nebo Flexibee není dostupné, nebo admin není nakonfigurovaný (ADMIN_TOKEN, API_URL, FLEXI_*).";
};
