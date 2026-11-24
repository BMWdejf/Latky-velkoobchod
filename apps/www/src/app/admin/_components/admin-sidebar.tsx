"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "../admin-nav";

/** Desktop sidebar from the Figma design. Hidden on small screens. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-[#1e3f35] bg-[#0e241e] text-white md:flex">
      <div className="flex items-center gap-2.5 p-4">
        <div className="flex size-8 items-center justify-center rounded-[4px] bg-[#c6ebdc] text-xs font-bold text-[#002018]">
          LV
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Látky Velkoobchod</span>
          <span className="text-[11px] text-white/60">Administrace</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-y border-white/5 bg-[#091b15] px-3 py-2">
        <span className="px-2 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
          Aktivní uzel správy
        </span>
        <div className="flex items-center gap-2 rounded-[4px] bg-white px-2 py-1.5 text-xs font-semibold text-[#0e241e]">
          Flexibee · Neon Postgres
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
        {ADMIN_NAV.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <span className="px-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
              {group.title}
            </span>
            <div className="ml-2 flex flex-col gap-1 border-l border-white/10 pl-2">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-2.5 rounded-[4px] border border-[#c6ebdc]/40 bg-[#1e3f35] px-2.5 py-2 text-sm font-semibold text-white"
                        : "flex items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1.5 border-t border-white/10 bg-[#0a1b16] p-3 text-[10px] text-white/70">
        <span>Propojeno: Neon Postgres · Neon Auth · Flexibee</span>
      </div>
    </aside>
  );
}
