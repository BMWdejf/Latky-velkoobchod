"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "../admin-nav";
import { isActive } from "./admin-sidebar";

/** Horizontal navigation row for small screens, from the mobile Figma design. */
export function AdminMobileNav() {
  const pathname = usePathname();
  const items = ADMIN_NAV.flatMap((section) => section.items);

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#e9e1dd] bg-[#fff8f5] px-1 md:hidden">
      {items.map((item) => {
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex h-14 shrink-0 items-center border-b-2 border-[#052920] px-3 text-sm font-semibold text-[#052920]"
                : "flex h-14 shrink-0 items-center border-b-2 border-transparent px-3 text-sm text-[#414845]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
