"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV } from "../admin-nav";

const COLLAPSED_KEY = "admin-sidebar-collapsed";

/**
 * Desktop sidebar from the Figma design. It can shrink to an icon rail; the
 * choice is remembered in this browser. Hidden on small screens.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "1");
  }, []);

  const setStoredCollapsed = (value: boolean) => {
    window.localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
    setCollapsed(value);
  };

  const toggle = () => setStoredCollapsed(!collapsed);

  /** Clicking a collapsed category icon opens the full menu with its subcategories. */
  const expand = () => setStoredCollapsed(false);

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col border-r border-[#1e3f35] bg-[#0e241e] text-white transition-[width] md:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2.5 p-4">
        <Link
          href="/admin"
          aria-label="Úvodní přehled"
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-[#c6ebdc] text-xs font-bold text-[#002018]">
            LV
          </span>
          {collapsed ? null : (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">
                Látky Velkoobchod
              </span>
              <span className="text-[11px] text-white/60">Administrace</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
        {ADMIN_NAV.map((group) => {
          const GroupIcon = group.icon;
          const groupActive = group.href
            ? pathname === group.href
            : group.items.some((item) => pathname === item.href);

          if (collapsed) {
            const iconClass = `flex items-center justify-center rounded-[4px] border p-2 ${
              groupActive
                ? "border-[#c6ebdc]/40 bg-[#1e3f35] text-white"
                : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
            }`;
            const icon = (
              <GroupIcon className="size-4 shrink-0" aria-hidden="true" />
            );
            // A single-page category opens its page; others open the menu.
            return group.href ? (
              <Link
                key={group.title}
                href={group.href}
                title={group.title}
                aria-label={group.title}
                aria-current={groupActive ? "page" : undefined}
                className={iconClass}
              >
                {icon}
              </Link>
            ) : (
              <button
                key={group.title}
                type="button"
                onClick={expand}
                title={group.title}
                aria-label={group.title}
                aria-expanded={false}
                className={iconClass}
              >
                {icon}
              </button>
            );
          }

          if (group.href) {
            return (
              <Link
                key={group.title}
                href={group.href}
                aria-current={groupActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-[4px] px-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.5px] text-white ${
                  groupActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <GroupIcon className="size-3.5 shrink-0" aria-hidden="true" />
                {group.title}
              </Link>
            );
          }

          return (
            <div key={group.title} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 px-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
                <GroupIcon className="size-3.5 shrink-0" aria-hidden="true" />
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
                      className={`flex items-center rounded-[4px] border px-2.5 py-2 text-sm ${
                        active
                          ? "border-[#c6ebdc]/40 bg-[#1e3f35] font-semibold text-white"
                          : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-white/10 bg-[#0a1b16] p-3">
        {collapsed ? null : (
          <span className="text-[10px] text-white/70">
            Propojeno: Neon Postgres · Neon Auth · Flexibee
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Rozbalit menu" : "Sbalit menu"}
          className="flex items-center justify-center gap-2 rounded-[4px] border border-white/10 px-2 py-1.5 text-xs text-white/80 hover:bg-white/5"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronsLeft className="size-4" aria-hidden="true" />
          )}
          {collapsed ? null : "Sbalit menu"}
        </button>
      </div>
    </aside>
  );
}
