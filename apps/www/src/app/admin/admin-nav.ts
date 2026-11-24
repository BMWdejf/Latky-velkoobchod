export type AdminNavItem = {
  label: string;
  href: string;
  /** Path of the page this item points at; used to mark the active item. */
  path: string;
  /** Anchor on the same page, ignored when matching the active item. */
  hash?: string;
};

export type AdminNavSection = { title: string; items: AdminNavItem[] };

/** Shared by the desktop sidebar and the mobile navigation row. */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Operativa B2B",
    items: [{ label: "Katalog na webu", href: "/", path: "/" }],
  },
  {
    title: "Nastavení & řízení portálu",
    items: [
      { label: "Zdroj skladu", href: "/admin", path: "/admin" },
      {
        label: "Pravidla zobrazení",
        href: "/admin#pravidla",
        path: "/admin",
        hash: "pravidla",
      },
    ],
  },
];
