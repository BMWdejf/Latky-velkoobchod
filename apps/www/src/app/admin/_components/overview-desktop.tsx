import {
  CRITICAL_STOCK,
  INTEGRATIONS,
  ORDERS,
  PERIODS,
  REVENUE_BARS,
  SORTIMENT,
} from "./overview-data";

const CARD = "rounded-[12px] border border-[#e2ddd5] bg-white";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.04em] text-[#78716c]";

/** Desktop overview. Content width 960px, sections spaced as in the Figma frame. */
export function OverviewDesktop({ updatedLabel }: { updatedLabel: string }) {
  return (
    <div className="mx-auto hidden w-full max-w-[960px] flex-col gap-0 md:flex">
      {/* 1. Breadcrumb and title row */}
      <section className="flex h-[84px] flex-col justify-between">
        <div className="flex h-[26px] items-center justify-between">
          <span className={LABEL}>Administrace B2B</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#57534e]">
            <span className="size-1.5 rounded-full bg-[#059669]" />
            ERP automatická synchronizace: {updatedLabel}
          </span>
        </div>
        <div className="flex h-[42px] items-center justify-between">
          <h1 className="font-[family-name:var(--font-newsreader)] text-[26px] leading-8 text-[#1c1917]">
            Hlavní operativní přehled (Live ERP)
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-[4px] border border-[#e2ddd5] bg-white p-0.5">
              {PERIODS.map((period, index) => (
                <span
                  key={period}
                  className={
                    index === 2
                      ? "rounded-[4px] bg-[#1e3f35] px-2.5 py-1 text-xs font-semibold text-white"
                      : "px-2.5 py-1 text-xs font-semibold text-[#57534e]"
                  }
                >
                  {period}
                </span>
              ))}
            </div>
            <span className="flex h-[30px] items-center rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-xs font-semibold text-[#57534e]">
              Aktualizovat
            </span>
            <span className="flex h-[30px] items-center rounded-[4px] border border-[#c6ebdc] bg-[#1e3f35] px-3 text-xs font-semibold text-white">
              Exportovat report (PDF/XLSX)
            </span>
          </div>
        </div>
      </section>

      {/* 2. Key metrics */}
      <section className="flex flex-col pt-8">
        <div className="flex h-[368px] gap-5">
          <div
            className={`${CARD} flex flex-1 flex-col justify-between bg-[#1e3f35] p-6 text-white`}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#c6ebdc]">
              Klíčová metrika měsíce
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-[#c6ebdc]">
                Měsíční velkoobchodní obrat
              </span>
              <span className="text-[44px] leading-none font-bold">
                3 840 500 Kč
              </span>
              <span className="text-sm text-[#c6ebdc]">
                +18.4 % meziměsíční nárůst
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-[#c6ebdc]">
                <span>Splněno kvartálu 92 % (Q4 cíl)</span>
                <span>Cíl: 4.2 M Kč</span>
              </div>
              <div className="h-2 rounded-full bg-white/15">
                <div className="h-2 w-[92%] rounded-full bg-[#c6ebdc]" />
              </div>
              <span className="text-xs text-[#c6ebdc]">
                Odběr VIP & Gold: 84 % tržeb
              </span>
            </div>
          </div>

          <div className="flex w-[300px] flex-col gap-5">
            <div className={`${CARD} flex flex-1 flex-col justify-between p-5`}>
              <span className={LABEL}>Průměr AOV</span>
              <span className="text-2xl font-bold text-[#1c1917]">
                28 650 Kč
              </span>
              <span className="text-xs text-[#57534e]">B2B nákupní košík</span>
              <span className="text-xs font-semibold text-[#1e3f35] underline">
                Upravit ceníkové matice
              </span>
            </div>
            <div className={`${CARD} flex flex-1 flex-col justify-between p-5`}>
              <span className={LABEL}>Optimalizace rabatů</span>
              <span className="text-xs text-[#57534e]">
                Automatický pooling spuštěn denně v 07:00
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-4">
          {[
            [
              "Expedovaná metráž & role",
              "14 850 m",
              "+12.6 % vysoká obrátka skladu",
            ],
            [
              "Vyskladněno za cyklus",
              "240 rolí",
              "Průměrná B2B zakázka 38.5 metrů",
            ],
            ["Rampa A2 expedice", "98.4 % včas", "Expediční svoz do 15:30 hod"],
            ["Aktivní B2B partneři", "248 firem", "+18 nových tento týden"],
          ].map(([label, value, hint]) => (
            <div key={label} className={`${CARD} flex flex-col gap-2 p-4`}>
              <span className={LABEL}>{label}</span>
              <span className="text-xl font-bold text-[#1c1917]">{value}</span>
              <span className="text-xs text-[#57534e]">{hint}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Revenue chart and assortment */}
      <section className="flex flex-col pt-8">
        <div className="grid h-[602px] grid-cols-[2fr_1fr] gap-5">
          <div className={`${CARD} flex flex-col gap-4 p-5`}>
            <div className="flex flex-col gap-1">
              <h2 className="font-[family-name:var(--font-newsreader)] text-xl text-[#1c1917]">
                Vývoj velkoobchodních tržeb a poptávky po látkách
              </h2>
              <span className="text-xs text-[#57534e]">
                Porovnání odběrů metráže v rolích vs. hotové ložní soupravy
                (Květen – Říjen 2025)
              </span>
            </div>
            <RevenueChart />
            <span className="text-[11px] text-[#78716c]">
              Model kalkulace: Exp-Trend V3.8 • Live ERP
            </span>
          </div>

          <div className={`${CARD} flex flex-col gap-5 p-5`}>
            <div className="flex flex-col gap-1">
              <span className={LABEL}>Rozložení sortimentu</span>
              <span className="text-xs text-[#57534e]">
                Podíl na tržbách podle typu látky a velkoobchodního balení.
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {SORTIMENT.map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1c1917]">{item.label}</span>
                    <span className="font-bold text-[#1e3f35]">
                      {item.share} %
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e9e1dd]">
                    <div
                      className="h-2 rounded-full bg-[#1e3f35]"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Orders and critical stock */}
      <section className="flex flex-col pt-8">
        <div className="grid h-[656px] grid-cols-[2fr_1fr] gap-5">
          <div className={`${CARD} flex flex-col overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-[#e9e1dd] p-5">
              <div className="flex flex-col gap-1">
                <h2 className="font-[family-name:var(--font-newsreader)] text-xl text-[#1c1917]">
                  Objednávky čekající na expedici
                </h2>
                <span className="text-xs text-[#57534e]">
                  Sklad Praha Hostivař • Expediční rampa A2
                </span>
              </div>
              <span className="rounded-[4px] bg-[#e8f0ec] px-2 py-1 text-[11px] font-semibold text-[#1e3f35]">
                4 prioritní k odbavení
              </span>
            </div>
            <div className="grid grid-cols-[1.3fr_1.4fr_0.8fr_1fr] gap-3 bg-[#faf9f6] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.04em] text-[#78716c]">
              <span>Číslo zakázky & klient</span>
              <span>Položky & objem metráže</span>
              <span>Hodnota</span>
              <span>Logistika / stav</span>
            </div>
            <ul className="flex flex-col divide-y divide-[#e9e1dd]">
              {ORDERS.map((order) => (
                <li
                  key={order.number}
                  className="grid grid-cols-[1.3fr_1.4fr_0.8fr_1fr] items-center gap-3 px-5 py-3 text-sm"
                >
                  <span className="flex flex-col">
                    <span className="font-bold text-[#1c1917]">
                      {order.number}
                    </span>
                    <span className="text-xs text-[#57534e]">
                      {order.client}
                    </span>
                  </span>
                  <span className="text-xs text-[#1c1917]">{order.items}</span>
                  <span className="font-bold">{order.value}</span>
                  <span className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1e3f35]">
                      {order.status}
                    </span>
                    <span className="text-[11px] text-[#78716c]">
                      {order.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <span className="mt-auto border-t border-[#e9e1dd] px-5 py-3 text-xs font-semibold text-[#1e3f35] underline">
              Přejít na kompletní expediční frontu (12)
            </span>
          </div>

          <div className={`${CARD} flex flex-col gap-4 p-5`}>
            <div className="flex flex-col gap-1">
              <h2 className="font-[family-name:var(--font-newsreader)] text-xl text-[#1c1917]">
                Kritické skladové zásoby
              </h2>
              <span className="text-xs text-[#57534e]">
                Podlimitní stavy na centrálním skladě
              </span>
            </div>
            <span className="self-start rounded-[4px] bg-[#fff1e8] px-2 py-1 text-[11px] font-semibold text-[#b45309]">
              2 artikly pod prahem
            </span>
            {CRITICAL_STOCK.map((item) => (
              <div
                key={item.sku}
                className="flex flex-col gap-2 rounded-[8px] border border-[#e9e1dd] p-3"
              >
                <span className="text-[11px] text-[#78716c]">
                  SKU: {item.sku}
                </span>
                <span className="text-sm font-bold text-[#1c1917]">
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-[#b45309]">
                  {item.stock}
                </span>
                <span className="text-xs text-[#57534e]">{item.note}</span>
                <span className="text-xs font-semibold text-[#1e3f35] underline">
                  {item.action}
                </span>
              </div>
            ))}
            <span className="mt-auto text-[11px] text-[#78716c]">
              Automatický pooling spuštěn denně v 07:00
            </span>
          </div>
        </div>
      </section>

      {/* 5. Integrations */}
      <section className="flex flex-col pt-8 pb-8">
        <div className={`${CARD} flex flex-col gap-4 p-5`}>
          <div className="flex items-center justify-between">
            <span className={LABEL}>
              Systémové integrace, datové toky & API healthcheck
            </span>
            <span className="text-xs text-[#57534e]">
              Všechny služby v provozu • 0 výpadků za 30 dní
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-2 rounded-[8px] border border-[#e9e1dd] p-4"
              >
                <span className="text-sm font-bold text-[#1c1917]">
                  {item.name}
                </span>
                <span className="text-xs text-[#57534e]">{item.desc}</span>
                <span className="text-xs font-semibold text-[#1e3f35]">
                  {item.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Bars for the monthly revenue in millions of CZK, with the design's labels. */
function RevenueChart() {
  const max = 4;
  return (
    <div className="flex h-[300px] items-end gap-6 border-b border-l border-[#e9e1dd] px-6 pb-6">
      {REVENUE_BARS.map((bar, index) => (
        <div
          key={bar.month}
          className="flex flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="text-[11px] font-semibold text-[#57534e]">
            {bar.value.toFixed(2)}M
          </span>
          <div
            className={
              index === REVENUE_BARS.length - 1
                ? "w-full rounded-t-[4px] bg-[#1e3f35]"
                : "w-full rounded-t-[4px] bg-[#c6ebdc]"
            }
            style={{ height: `${(bar.value / max) * 220}px` }}
          />
          <span className="text-[11px] text-[#78716c]">{bar.month}</span>
        </div>
      ))}
    </div>
  );
}
