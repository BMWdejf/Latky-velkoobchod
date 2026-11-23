const linkColumns = [
  {
    title: "Sortiment pro výrobce",
    items: [
      "Teplákoviny počesané i nepočesané",
      "Single jersey úplety",
      "Saténové ložní prádlo",
      "Lněné plátno",
    ],
  },
  {
    title: "Podmínky spolupráce",
    items: [
      "Rámcové smlouvy",
      "Množstevní slevy až 25 %",
      "Možnost konsignačního skladu",
      "EDI a XML/CSV feedy",
    ],
  },
  {
    title: "Distribuce a sklady",
    items: [
      "Expedice 24h",
      "Vlastní závozový plán",
      "Pravidelné linky ČR & SR",
      "Osobní odběr pro registrované partnery",
      "Po–Pá 7:00–16:30",
    ],
  },
];

const legalLinks = ["Podmínky", "Soukromí"];

/**
 * Dark forest-green footer from the Figma frame. The CTA sits in an ink card.
 * Buttons stay disabled until their features exist.
 */
export function SiteFooter() {
  return (
    <footer className="bg-brand pt-14 text-primary-foreground">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 rounded-[16px] bg-foreground p-8 md:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[655px] flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-white/60">
              B2B zakázkový servis &amp; vzorky zdarma
            </p>
            <h2 className="font-serif text-[26px] leading-8">
              Potřebujete vzorník metráže nebo nabídku na míru pro váš projekt?
            </h2>
            <p className="text-sm leading-5 text-white/70">
              Zašleme vám kompletní sadu vzorků všech látek, technické listy a
              individuální velkoobchodní ceník pro váš výrobní objem.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled
              className="h-10 rounded-sm bg-primary-foreground px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              Vyžádat B2B vzorník zdarma
            </button>
            <button
              type="button"
              disabled
              className="h-10 rounded-sm border border-white/40 px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Domluvit konzultaci
            </button>
          </div>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {linkColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="border-b border-white/15 pb-3 text-[11px] font-semibold uppercase tracking-[0.04em]">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2 text-sm text-white/70">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-4">
            <h3 className="border-b border-white/15 pb-3 text-[11px] font-semibold uppercase tracking-[0.04em]">
              B2B helpdesk
            </h3>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <p>Přímá linka pro výrobce oděvů a hotelový textil:</p>
              <p className="font-semibold text-primary-foreground">
                +420 222 333 444
              </p>
              <p>Po–Pá 8:00–17:00 (dedikovaný tým)</p>
              <p className="pt-2">E-mail pro velkoobchodní objednávky:</p>
              <p className="font-semibold text-primary-foreground">
                objednavky@latky-b2b.cz
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a302d]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 text-xs text-white/60 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Látky Velkoobchod s.r.o. ·
            Velkoobchodní B2B licence CZ28491024 (pouze pro registrované IČO /
            DIČ subjekty) · OEKO-TEX® Standard 100 certifikováno
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase tracking-[0.04em]">
                Měna:
              </span>
              <button
                type="button"
                disabled
                className="rounded-sm bg-primary-foreground px-2.5 py-1 font-semibold text-brand disabled:cursor-not-allowed"
              >
                CZK
              </button>
              <button
                type="button"
                disabled
                className="rounded-sm border border-white/40 px-2.5 py-1 font-semibold text-primary-foreground disabled:cursor-not-allowed"
              >
                EUR
              </button>
            </div>
            {legalLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="font-semibold text-primary-foreground hover:underline"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
