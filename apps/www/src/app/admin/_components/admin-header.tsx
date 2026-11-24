import Link from "next/link";
import { signOutAction } from "../login/actions";

type AdminHeaderProps = {
  email: string;
  flexibeeOk: boolean;
  databaseOk: boolean;
};

/**
 * Top bar from the Figma designs. Desktop shows search, status pills and the
 * web link; mobile keeps only the brand, sign-out and identity.
 */
export function AdminHeader({
  email,
  flexibeeOk,
  databaseOk,
}: AdminHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e2ddd5] bg-white px-4 md:px-5">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex size-7 items-center justify-center rounded-[4px] bg-[#0e241e] text-[11px] font-bold text-[#c6ebdc]">
          LV
        </div>
        <span className="text-sm font-semibold">Administrace</span>
      </div>

      <div className="relative hidden w-full max-w-md md:block">
        <input
          type="search"
          disabled
          aria-label="Hledání"
          placeholder="Rychlé hledání parametru, MOQ, rabatu, skladu či NET splatnosti..."
          className="h-[30px] w-full rounded-[6px] border border-[#e2ddd5] bg-[#f4f1ea] pr-12 pl-3 text-xs text-[#1c1917] placeholder:text-[#78716c] disabled:opacity-100"
        />
        <kbd className="absolute top-1/2 right-2 -translate-y-1/2 rounded-[4px] border border-[#e2ddd5] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#78716c]">
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <div className="hidden items-center gap-2 md:flex">
          <StatusPill label="Flexibee" ok={flexibeeOk} />
          <StatusPill label="Databáze" ok={databaseOk} />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="flex h-[30px] items-center rounded-[4px] border border-[#e2ddd5] bg-white px-3 text-xs font-semibold text-[#57534e] hover:bg-[#f4f1ea]"
          >
            Zobrazit web
          </Link>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex h-[30px] items-center rounded-[4px] border border-[#c6ebdc] bg-[#1e3f35] px-3 text-xs font-semibold text-white hover:bg-[#2c4d42] md:px-3.5"
          >
            Odhlásit
          </button>
        </form>

        <div className="flex items-center gap-2 md:border-l md:border-[#e2ddd5] md:pl-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#1e3f35] text-xs font-bold text-white">
            {initialsOf(email)}
          </div>
          <span className="hidden max-w-[180px] truncate text-xs text-[#57534e] md:block">
            {email}
          </span>
        </div>
      </div>
    </header>
  );
}

const StatusPill = ({ label, ok }: { label: string; ok: boolean }) => (
  <span
    className={
      ok
        ? "flex h-[22px] items-center gap-1.5 rounded-[4px] border border-[#c6ebdc] bg-[#e8f0ec] px-2 text-[11px] text-[#1e3f35]"
        : "flex h-[22px] items-center gap-1.5 rounded-[4px] border border-[#e2ddd5] bg-[#f4f1ea] px-2 text-[11px] text-[#57534e]"
    }
  >
    <span
      className={
        ok
          ? "size-1.5 rounded-full bg-[#059669]"
          : "size-1.5 rounded-full bg-[#b45309]"
      }
    />
    {label}: {ok ? "Připojeno" : "Nedostupné"}
  </span>
);

const initialsOf = (email: string): string => {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase() || "AD";
};
