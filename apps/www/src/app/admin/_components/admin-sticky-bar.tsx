import { WAREHOUSE_FORM_ID } from "../warehouse-form-id";

/**
 * Bottom action bar from the mobile design. It stays on the bottom edge of the
 * screen while the main area scrolls. Its buttons belong to the settings form.
 */
export function AdminStickyBar() {
  return (
    <div className="flex shrink-0 gap-2 border-t border-[#e9e1dd] bg-[#fff8f5] p-4 md:hidden">
      <button
        type="reset"
        form={WAREHOUSE_FORM_ID}
        className="h-10 rounded-[4px] bg-[#f4ece8] px-4 text-sm font-semibold text-[#414845]"
      >
        Zrušit
      </button>
      <button
        type="submit"
        form={WAREHOUSE_FORM_ID}
        className="h-14 flex-1 rounded-[4px] bg-[#052920] px-4 text-sm font-semibold text-white"
      >
        Uložit nastavení
      </button>
    </div>
  );
}
