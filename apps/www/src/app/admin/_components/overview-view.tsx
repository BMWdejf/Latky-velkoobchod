import Link from "next/link";
import type { AdminOverview } from "@/lib/admin-api";

const number = new Intl.NumberFormat("cs-CZ");

type OverviewViewProps = {
  data: AdminOverview;
  updatedAt: Date;
};

/**
 * Overview from the Figma designs. Every number comes from the API. Sections
 * that need data the app does not have (orders, revenue) show an empty state
 * instead of sample figures.
 */
export function OverviewView({ data, updatedAt }: OverviewViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#78716c]">
          <span className="font-bold tracking-[0.04em] uppercase">
            Administrace B2B
          </span>
          <span>
            Aktualizováno{" "}
            {updatedAt.toLocaleTimeString("cs-CZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-[family-name:var(--font-newsreader)] text-[26px] leading-8 text-[#1c1917]">
            Hlavní operativní přehled
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/prehled"
              className="flex h-[30px] items-center rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-xs font-semibold text-[#57534e] hover:bg-[#f4f1ea]"
            >
              Aktualizovat
            </Link>
            <button
              type="button"
              disabled
              className="flex h-[30px] items-center rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-xs font-semibold text-[#a8a29e]"
            >
              Exportovat report
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#e2ddd5] bg-white p-5 md:col-span-2">
          <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
            Produkty na webu
          </span>
          <span className="text-[40px] leading-none font-bold text-[#1c1917]">
            {number.format(data.total)}
          </span>
          <span className="text-sm text-[#57534e]">
            {data.warehouseName
              ? `Skladem na ${data.warehouseName}`
              : "Globální zásoba (výchozí)"}
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <MetricCard
            label="Kritické zásoby"
            value={number.format(data.lowStock)}
            hint={`Pod limitem 100 ks · vyprodáno ${number.format(data.outOfStock)}`}
          />
          <MetricCard
            label="Pravidla zobrazení"
            value={number.format(data.ruleCount)}
            hint="aktivních podmínek"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#e2ddd5] bg-white p-5 md:col-span-2">
          <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
            Vývoj velkoobchodních tržeb
          </span>
          <p className="text-sm text-[#57534e]">
            Zatím bez dat. Tržby a objednávky nejsou v aplikaci napojené.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#e2ddd5] bg-white p-5">
          <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
            Rozložení sortimentu
          </span>
          {data.groups.length === 0 ? (
            <p className="text-sm text-[#57534e]">
              Žádné produkty k zobrazení.
            </p>
          ) : (
            data.groups.map((group) => (
              <div key={group.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#1c1917]">{group.name}</span>
                  <span className="font-semibold">
                    {Math.round(group.share * 100)} %
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#e9e1dd]">
                  <div
                    className="h-1.5 rounded-full bg-[#1e3f35]"
                    style={{ width: `${Math.round(group.share * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#e2ddd5] bg-white p-5">
          <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
            Objednávky čekající na expedici
          </span>
          <p className="text-sm text-[#57534e]">
            Objednávky zatím nejsou napojené.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#e2ddd5] bg-white p-5">
          <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
            Kritické skladové zásoby
          </span>
          {data.criticalItems.length === 0 ? (
            <p className="text-sm text-[#57534e]">Žádné kritické zásoby.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[#e9e1dd]">
              {data.criticalItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-[#1c1917]">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#78716c]">
                      SKU: {item.sku}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[#b45309]">
                    {number.format(item.stock)} ks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-[12px] border border-[#e2ddd5] bg-white p-5">
        <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
          Systémové integrace
        </span>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <IntegrationRow label="Flexibee" ok={data.flexibeeOk} />
          <IntegrationRow
            label="Databáze (Neon Postgres)"
            ok={data.databaseOk}
          />
          <IntegrationRow label="Přihlášení (Neon Auth)" ok />
        </div>
      </section>
    </div>
  );
}

const MetricCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) => (
  <div className="flex flex-col gap-2 rounded-[12px] border border-[#e2ddd5] bg-white p-5">
    <span className="text-[11px] font-bold tracking-[0.04em] text-[#78716c] uppercase">
      {label}
    </span>
    <span className="text-2xl font-bold text-[#1c1917]">{value}</span>
    <span className="text-xs text-[#57534e]">{hint}</span>
  </div>
);

const IntegrationRow = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between gap-2 rounded-[4px] border border-[#e9e1dd] px-3 py-2">
    <span className="text-sm text-[#1c1917]">{label}</span>
    <span
      className={
        ok
          ? "flex items-center gap-1.5 text-xs font-semibold text-[#1e3f35]"
          : "flex items-center gap-1.5 text-xs font-semibold text-[#b45309]"
      }
    >
      <span
        className={
          ok
            ? "size-1.5 rounded-full bg-[#059669]"
            : "size-1.5 rounded-full bg-[#b45309]"
        }
      />
      {ok ? "Připojeno" : "Nedostupné"}
    </span>
  </div>
);
