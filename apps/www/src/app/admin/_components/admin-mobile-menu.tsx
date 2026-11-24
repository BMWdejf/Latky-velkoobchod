"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNavList } from "./admin-nav-list";

/**
 * Hamburger button and slide-in menu for small screens. The menu repeats the
 * desktop sidebar's categories and subcategories.
 */
export function AdminMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shownPath, setShownPath] = useState(pathname);

  // Close the menu whenever the page changes (also on browser back/forward).
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setOpen(false);
  }

  // Close with Escape and lock page scrolling while the menu is open.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Otevřít menu"
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-[4px] border border-[#e2ddd5] text-[#1c1917] md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Zavřít menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside
            id="admin-mobile-menu"
            aria-label="Menu administrace"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[#1e3f35] bg-[#0e241e] text-white"
          >
            <div className="flex items-center justify-between gap-2 p-4">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-[#c6ebdc] text-xs font-bold text-[#002018]">
                  LV
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">
                    Látky Velkoobchod
                  </span>
                  <span className="text-[11px] text-white/60">
                    Administrace
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít menu"
                className="flex size-9 shrink-0 items-center justify-center rounded-[4px] text-white/80 hover:bg-white/5"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <AdminNavList onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
