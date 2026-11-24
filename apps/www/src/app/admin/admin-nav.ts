export type AdminNavItem = {
  label: string;
  href: string;
};

/** A category: a title that may hold links to pages below it. */
export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

/** Shared by the desktop sidebar and the mobile navigation row. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Operativa B2B",
    items: [{ label: "Katalog na webu", href: "/" }],
  },
  {
    title: "Nastavení & řízení portálu",
    items: [
      { label: "Zdroj skladu", href: "/admin" },
      { label: "Pravidla zobrazení", href: "/admin/pravidla" },
    ],
  },
];
