import type { LucideIcon } from "lucide-react";
import { SlidersHorizontal, Warehouse } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
};

/**
 * A main category with an icon. A category with `href` is a single link (no
 * subcategories); otherwise its `items` are the subcategory links.
 */
export type AdminNavGroup = {
  title: string;
  icon: LucideIcon;
  href?: string;
  items: AdminNavItem[];
};

/** Shared by the desktop sidebar and the mobile menu. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Přehled",
    icon: Warehouse,
    href: "/admin",
    items: [],
  },
  {
    title: "Nastavení & řízení portálu",
    icon: SlidersHorizontal,
    items: [
      { label: "Zdroj skladu", href: "/admin/zdroj-skladu" },
      { label: "Pravidla zobrazení", href: "/admin/pravidla" },
    ],
  },
];
