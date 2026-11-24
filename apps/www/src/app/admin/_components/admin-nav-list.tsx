"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "../admin-nav";

/**
 * Categories with their subcategories, used by the mobile drawer. Each main
 * category has an icon; subcategories are text links.
 */
export function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2.5">
      {ADMIN_NAV.map((group) => {
        const GroupIcon = group.icon;
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
                    onClick={onNavigate}
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
  );
}
