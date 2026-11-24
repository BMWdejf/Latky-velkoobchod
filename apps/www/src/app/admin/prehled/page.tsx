export const dynamic = "force-dynamic";

import { fetchOverview } from "@/lib/admin-api";
import { requireAdminUser } from "@/lib/admin-session";
import { OverviewView } from "../_components/overview-view";

export default async function AdminOverviewPage() {
  await requireAdminUser();

  const overview = await fetchOverview();

  if (overview.status !== "ok") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <p
          role="alert"
          className="rounded-[4px] border border-[#e2ddd5] bg-white p-3 text-sm"
        >
          Přehled nelze načíst. API nebo Flexibee není dostupné, nebo admin není
          nakonfigurovaný.
        </p>
      </div>
    );
  }

  return <OverviewView data={overview.data} updatedAt={new Date()} />;
}
