import type { LucideIcon } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
};

/** A main category with an icon; its subcategories are links to pages. */
export type AdminNavGroup = {
  title: string;
  icon: LucideIcon;
  items: AdminNavItem[];
};

/** Shared by the desktop sidebar and the mobile navigation row. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Nastavení & řízení portálu",
    icon: SlidersHorizontal,
    items: [
      { label: "Zdroj skladu", href: "/admin/zdroj-skladu" },
      { label: "Pravidla zobrazení", href: "/admin/pravidla" },
    ],
  },
];
