import type { LucideIcon } from "lucide-react";
import { SlidersHorizontal, Warehouse } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/** A category: a title that holds links to pages below it. */
export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

/** Shared by the desktop sidebar and the mobile navigation row. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Nastavení & řízení portálu",
    items: [
      { label: "Zdroj skladu", href: "/admin/zdroj-skladu", icon: Warehouse },
      {
        label: "Pravidla zobrazení",
        href: "/admin/pravidla",
        icon: SlidersHorizontal,
      },
    ],
  },
];
