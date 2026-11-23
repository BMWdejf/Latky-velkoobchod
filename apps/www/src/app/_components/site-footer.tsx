const sections = [
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
      "Hlavní distribuční park Praha",
      "Expedice 24h",
      "Vlastní závozový plán",
      "Pravidelné linky ČR & SR",
      "Osobní odběr pro registrované partnery",
      "Po–Pá 7:00–16:30",
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-card">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
            B2B zakázkový servis &amp; vzorky zdarma
          </p>
          <h2 className="font-serif text-2xl text-foreground">
            Potřebujete vzorník metráže nebo nabídku na míru pro váš projekt?
          </h2>
          <p className="text-sm leading-5 text-ink-muted">
            Zašleme vám kompletní sadu vzorků všech látek, technické listy a
            individuální velkoobchodní ceník pro váš výrobní objem.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              disabled
              className="h-10 rounded-sm bg-brand px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Vyžádat B2B vzorník zdarma
            </button>
            <button
              type="button"
              disabled
              className="h-10 rounded-sm border border-hairline bg-card px-5 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Domluvit konzultaci
            </button>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="border-b border-hairline pb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2 text-sm text-ink-muted">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between md:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} Látky Velkoobchod s.r.o.</p>
          <p>Velkoobchodní B2B licence CZ28491024 · OEKO-TEX® Standard 100</p>
        </div>
      </div>
    </footer>
  );
}
