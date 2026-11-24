"use client";

import { usePathname } from "next/navigation";
import { RULES_FORM_ID, WAREHOUSE_FORM_ID } from "../form-ids";

/** Pages with a settings form; other pages have no action bar. */
const FORM_BY_PATH: Record<string, string> = {
  "/admin": WAREHOUSE_FORM_ID,
  "/admin/pravidla": RULES_FORM_ID,
};

/**
 * Bottom action bar from the mobile design. It stays on the bottom edge of the
 * screen while the main area scrolls. Its buttons act on the form of the page
 * that is open.
 */
export function AdminStickyBar() {
  const pathname = usePathname();
  const formId = FORM_BY_PATH[pathname];
  if (!formId) {
    return null;
  }

  return (
    <div className="flex shrink-0 gap-2 border-t border-[#e9e1dd] bg-[#fff8f5] p-4 md:hidden">
      <button
        type="reset"
        form={formId}
        className="h-10 rounded-[4px] bg-[#f4ece8] px-4 text-sm font-semibold text-[#414845]"
      >
        Zrušit
      </button>
      <button
        type="submit"
        form={formId}
        className="h-14 flex-1 rounded-[4px] bg-[#052920] px-4 text-sm font-semibold text-white"
      >
        Uložit nastavení
      </button>
    </div>
  );
}
