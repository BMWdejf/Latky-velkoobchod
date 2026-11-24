export const dynamic = "force-dynamic";

import { fetchSettings } from "@/lib/admin-api";
import { requireAdminUser } from "@/lib/admin-session";
import { RulesForm } from "../rules-form";

export default async function AdminRulesPage() {
  await requireAdminUser();

  const settings = await fetchSettings();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-newsreader)] text-[26px] leading-8 text-[#1c1917]">
          Pravidla zobrazení
        </h1>
        <p className="mt-1 text-sm text-[#57534e]">
          Produkt se zobrazí jen tehdy, když platí všechna pravidla níže.
        </p>
      </header>

      {settings.status === "ok" ? (
        <RulesForm initialRules={settings.data.rules} />
      ) : (
        <p
          role="alert"
          className="rounded-[4px] border border-[#e2ddd5] bg-white p-3 text-sm"
        >
          API nebo Flexibee není dostupné, nebo admin není nakonfigurovaný.
        </p>
      )}
    </div>
  );
}
