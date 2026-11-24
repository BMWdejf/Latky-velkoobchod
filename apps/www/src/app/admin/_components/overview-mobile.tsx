import {
  CRITICAL_STOCK,
  INTEGRATIONS,
  MOBILE,
  ORDERS,
  PERIODS,
  SORTIMENT,
} from "./overview-data";

const CARD = "rounded-[12px] border border-[#e2ddd5] bg-white";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.04em] text-[#78716c]";

/** Mobile overview: one column, sections in the order of the mobile Figma frame. */
export function OverviewMobile() {
  return (
    <div className="flex flex-col gap-0 md:hidden">
      <section className="flex flex-col gap-2 px-4 py-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {PERIODS.map((period, index) => (
            <span
              key={period}
              className={
                index === 2
                  ? "shrink-0 rounded-[4px] bg-[#052920] px-3 py-1.5 text-xs font-semibold text-white"
                  : "shrink-0 rounded-[4px] border border-[#e2ddd5] bg-white px-3 py-1.5 text-xs font-semibold text-[#57534e]"
              }
            >
              {period}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-4">
        <div
          className={`${CARD} flex flex-col gap-3 bg-[#052920] p-5 text-white`}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#c6ebdc]">
            {MOBILE.heroLabel}
          </span>
          <span className="text-[34px] leading-none font-bold">
            {MOBILE.heroValue}
          </span>
          <span className="text-sm text-[#c6ebdc]">{MOBILE.heroDelta}</span>
          <div className="h-2 rounded-full bg-white/15">
            <div className="h-2 w-[92%] rounded-full bg-[#c6ebdc]" />
          </div>
          <div className="flex justify-between text-xs text-[#c6ebdc]">
            <span>{MOBILE.quarter}</span>
            <span>{MOBILE.target}</span>
          </div>
          <span className="text-xs text-[#c6ebdc]">{MOBILE.vip}</span>
        </div>

        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Logistika & expedice</span>
          {MOBILE.logistics.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="font-bold text-[#1c1917]">{item.label}</span>
              <span className="text-xs text-[#57534e]">{item.note}</span>
            </div>
          ))}
        </div>

        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Klientská síť B2B</span>
          {MOBILE.clients.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="font-bold text-[#1c1917]">{item.label}</span>
              <span className="text-xs text-[#57534e]">{item.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-5">
        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Skladové kapacity</span>
          {MOBILE.warehouses.map((item) => (
            <div key={item.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#1c1917]">{item.name}</span>
                <span className="font-bold text-[#1e3f35]">{item.share} %</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#e9e1dd]">
                <div
                  className="h-1.5 rounded-full bg-[#1e3f35]"
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Rozložení sortimentu</span>
          {SORTIMENT.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#1c1917]">{item.label}</span>
                <span className="font-bold text-[#1e3f35]">{item.share} %</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#e9e1dd]">
                <div
                  className="h-1.5 rounded-full bg-[#1e3f35]"
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-5">
        <div className={`${CARD} flex flex-col divide-y divide-[#e9e1dd]`}>
          <div className="p-4">
            <span className={LABEL}>Čeká na expedici</span>
          </div>
          {ORDERS.map((order) => (
            <div key={order.number} className="flex flex-col gap-1 p-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1c1917]">{order.number}</span>
                <span className="font-bold">{order.value}</span>
              </div>
              <span className="text-sm text-[#1c1917]">{order.client}</span>
              <span className="text-xs text-[#57534e]">{order.items}</span>
              <span className="text-xs font-semibold text-[#1e3f35]">
                {order.status} • {order.note}
              </span>
            </div>
          ))}
          <span className="p-4 text-xs font-semibold text-[#1e3f35] underline">
            Přejít na kompletní expediční frontu (12)
          </span>
        </div>

        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Kritické skladové zásoby</span>
          {CRITICAL_STOCK.map((item) => (
            <div
              key={item.sku}
              className="flex flex-col gap-1 rounded-[8px] border border-[#e9e1dd] p-3"
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
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-5 pb-6">
        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <span className={LABEL}>Systémové integrace v provozu</span>
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-0.5 border-b border-[#e9e1dd] pb-2 last:border-0 last:pb-0"
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
      </section>
    </div>
  );
}
