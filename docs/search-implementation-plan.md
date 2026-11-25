# Plán implementace: vyhledávání a stránka výsledků

Zdroj návrhu: `design/figma/Search result page.json` (hlavní repozitář, složka `design/` je zatím netrackovaná).
Stránka je navržena pro desktop (šířka 1280 px). Mobilní verze v návrhu chybí.

## Stav implementace

Implementováno (nezcommitováno, větev `claude/search-implementation-plan-ace886`):
- API: `product-search.ts` (čistá logika, filtry, facety, řazení, stránkování) s testy; `GET /products/search`; `labels`, `notice` v mapperu.
- API: textová pravidla pro zásobu (`action: "text"`, pouze pole `stock`), `noticeFor` a úprava `product-rules.ts`.
- Admin `/admin/pravidla`: sloupec „Akce“ a pole „Text na webu“ u pravidel pro zásobu.
- Web: `/hledat` (drobečky, nadpis, kategorie, filtry, řazení, stránkování, prázdný stav a chyba), vyhledávání v hlavičce, odstraněn Partner Gold (hlavička i hero).
- Ověřeno: testy API (72) a webu (14), `biome check`, `tsc`, `nest build`, `next build`, render `/hledat` proti mock API.

Zatím neimplementováno nebo otevřeno:
- Flexibee: název pole pro štítky (`stitky`) a přesné texty štítků typu metráže a certifikací musí sedět s reálnou instancí. Dokud ne, filtry typu a certifikací zůstanou prázdné.
- Kategorie (pilulky): skupiny `skupZboz` nejsou známé, takže v `SEARCH_CATEGORIES` jsou prázdné a kategorie nevrací produkty.
- Režim „B2B řádky“, mobilní šuplík filtrů, Playwright test `search.spec.ts`: nejsou hotové.
- Název skladu v odpovědi API (`warehouse`) není vrácen.

## 1. Co návrh obsahuje

| Sekce návrhu | Komponenta | Stav v kódu |
|---|---|---|
| Header: logo, vyhledávací pole, košík, profil, navigace | `site-header.tsx` | Existuje, ale vyhledávání je `disabled`. Partner Gold badge se odstraní (rozhodnutí 4) |
| Drobečková navigace „Domů / Výsledky vyhledávání / „q““ | `search-breadcrumbs.tsx` (nová) | Chybí |
| H1 „Výsledky vyhledávání pro „q““ + „Nalezeno N položek ve 3 kategoriích“ + štítek skladu | `search-heading.tsx` (nová) | Chybí |
| Pilulky kategorií s počty (Všechny 14, Metráž 9, Úplety 3, Doplňky 2) | `category-pills.tsx` (nová) | Chybí |
| Banner „Rychlý import podle SKU / Hromadná objednávka“ | `bulk-order-banner.tsx` (nová) | Chybí, tlačítka jsou jen vizuální (jako dnes ostatní „(brzy)“) |
| Levý panel filtrů (280 px): reset, aktivní chipy, skupiny Dostupnost, Typ metráže, Gramáž, Šířka role, Certifikace, Cena | `search-filters.tsx` (nová) | Chybí |
| Řádek: „Zobrazeno N výsledků“, přepínač Mřížka / B2B řádky, řazení (bez Partner Gold toggle, rozhodnutí 4) | `search-sort-bar.tsx` (nová) | Chybí |
| Mřížka 3 sloupce, 6 položek na stránku | `product-card.tsx` (rozšířit), `product-catalog.tsx` vzor | Karta existuje; zobrazení ceny a skladu se řídí nastavením eshopu (rozhodnutí 4, otevřeno) |
| Stránkování „Zobrazeno 1–6 z 14, Předchozí 1 2 Další“ | `search-pagination.tsx` (nová) | Chybí |
| Blok „B2B zakázkový servis & vzorky zdarma“ | `service-cta.tsx` (nová, může sdílet s domovskou stránkou) | Chybí |
| Patička | `site-footer.tsx` | Existuje |

Velikosti z návrhu: obsah 1280 px, aside 280 px, pravý sloupec 904 px, mezera 24 px, stránkování 66 px.
Počet na stránku 6 odpovídá dnešní konstantě `DEFAULT_PAGE_SIZE = 6` v API.

## 2. Stav dnes

- **API** (`apps/api/src/products/`): jediný veřejný endpoint `GET /products?limit&start`. Nemá vyhledávání ani filtry.
  Seznam viditelných produktů se skládá a cachuje 60 s (`visibleProducts`), admin už v paměti filtruje podle názvu a SKU (`adminList`). Stejný princip lze použít pro veřejné vyhledávání.
- **Mapper** (`product.mapper.ts`): máme `name`, `sku`, `ean`, `unitPrice`, `stock`, `stockStatus` (jen 3 stavy), `group` (kód), `minOrder`, `width` (text), `weight` (text, „240 g/m²“), `composition`. Chybí číselná gramáž a šířka, typ metráže, certifikace, názvy skupin a pravidla pro zobrazení ceny a skladu (nastavení eshopu).
- **Web** (`apps/www`, Next 16.2, React 19): domovská stránka je `force-dynamic`, načítá data přes `fetchProducts` (`lib/products.ts`). Komponenty `ProductCard` a `QuantityStepper` lze znovu použít.
- **Testy**: jest v API (`*.spec.ts` vedle zdrojů), Playwright v `apps/www/e2e-tests` (zatím `home.spec.ts`).

## 3. Rozhodnutí, která potřebuji od tebe (blokují části)

1. **Typ metráže** — ROZHODNUTO: je ve Flexibee u produktu jako štítek s prefixem `TYP_` (např. `TYP_POCESANA`). Facet vznikne z nalezených produktů, název filtru je text za prefixem.
2. **Certifikace** — ROZHODNUTO: certifikace jsou ve Flexibee u produktu jako štítek s prefixem `CERT_` (např. `CERT_OEKOTEX`, `CERT_GOTS`). Facet vznikne stejně jako typ metráže. Porovnání nezávisí na velikosti písmen ani diakritice. Štítky bez prefixu (např. `DULEZITE`) se ignorují.
3. **Kategorie-pilulky** (Metráž & Teplákoviny v rolích, Úplety a lemy, Doplňky & ložní prádlo): mapování kódů skupin `skupZboz` na tyto názvy. Stačí konfigurace v API?
4. **Partner Gold (-15 %)** — ROZHODNUTO: nebude implementováno. Je to návrh grafika mimo business plán; odstranit badge v headeru, toggle „Ceny pro Partner Gold“ a slevy na kartách. Ceny a skladové zobrazení se řeší v nastavení eshopu podle skladové zásoby (neimplementovat napevno).
5. **Stav „Očekáváme naskladnění“** — ROZHODNUTO: texty podle zásoby se nastavují v administraci na stránce `/admin/pravidla` („Pravidla zobrazení“) stejným editorem jako ostatní pravidla, ne v kódu.
   - Stávající mechanismus: `apps/api/src/products/product-rules.ts` a `apps/www/src/app/admin/rules-editor.tsx`. Pravidlo je `pole + operátor + hodnota`, produkt se zobrazí jen tehdy, když platí všechna pravidla. Pole `stock` už existuje (operátory gt, gte, lt, lte, eq).
   - Návrh: každé pravidlo dostane akci. Výchozí „Skrýt produkt, pokud neplatí“ odpovídá dnešnímu chování. Nová „Zobrazit text“ přidá k produktu zadaný text a produkt neskrývá. Příklad: `Zásoba = 0` → „Očekáváme naskladnění“ a `Zásoba > 1` → text zadaný administrátorem.
   - Stejná úprava v API (`product-rules.ts`: nová akce a pole `text` v `ProductRule`), v `parseRules` a ve `stock` karty na webu. Textová pravidla se zobrazují na kartě místo stavu skladu. Pokud platí víc textů, rozhodne pořadí řádků.
   - Rozhodnuto: tři samostatné texty. `Zásoba = 0` → text pro vyprodáno/očekáváme, `Zásoba = 1` → samostatný text, `Zásoba > 1` → třetí text. Všechny tři se zadávají na `/admin/pravidla`.
6. **Řazení „Nejprodávanější pro velkoobchod“**: nemáme prodejní data. Navrhuji nahradit předvolbou „Název A–Z“, nebo doplnit zdroj prodejů.
7. **Režim „B2B řádky“**: v JSON je jen mřížka. Máme podle toho udělat řádkový návrh, nebo to odložit?
8. **Mobilní verze**: návrh je jen desktop. Mám navrhnout filtry jako spodní šuplík (drawer) podle `DESIGN.md`?
9. **Prázdný stav a chyba**: v návrhu nejsou. Navrhuji text „Nic jsme nenašli“ s odkazem na Rychlý import podle SKU.
10. **Dostupnost bez počtu**: některé volby v návrhu nemají počet (320 g/m², GOTS). Zobrazit s nulou, nebo skrýt?
11. **Chip „Teplákovina“** vedle „Skladem Praha“: je to hledaný výraz, nebo aktivní filtr? Předpokládám filtr, hledaný výraz je v H1.
12. **Štítek skladu „Skladem Praha“**: vychází z nastaveného skladu v nastavení (`warehouseId`)? Potřebujeme jeho název v odpovědi API.

## 4. Návrh API

Nový endpoint `GET /products/search` (rozšíření `/products` by změnilo kontrakt, který používá domovská stránka).

Parametry:
- `q` – hledání v názvu, SKU a EAN, bez ohledu na velikost písmen a diakritiku (`Teplákovina` = `teplakovina`).
- `availability` – seznam `in_stock`, `low_stock`, `out_of_stock` (čárkou).
- `fabricType`, `gsm`, `widthCm`, `certification` – seznamy hodnot (čárkou), podle rozhodnutí z bodu 1 a 2.
- `priceMin`, `priceMax` – cena bez DPH.
- `category` – klíč kategorie z bodu 3.
- `sort` – `relevance` (výchozí), `name_asc`, `price_asc`, `price_desc`, `stock_desc`.
- `limit` (výchozí 6, max 100), `start`.

Odpověď:
```
{
  items: PublicProduct[],        // stejný tvar jako dnes
  total: number,                 // po všech filtrech
  limit, start,
  categories: [{ key, label, count }],   // počty bez filtru kategorie
  facets: {                      // počty pro každou skupinu, bez jejího vlastního filtru
    availability: [{ value, count }],
    fabricType: [...], gsm: [...], widthCm: [...], certification: [...],
    price: { min, max }
  },
  warehouse: { id, name } | null
}
```

Implementace:
- Čistý modul `product-search.ts` (bez Nest závislostí): normalizace textu, parsování parametrů, filtrování, počty facetů, řazení. Testy jako `product-rules.spec.ts`.
- `ProductsService.search()` použije existující `visibleProducts`, takže dotazy nevolají Flexibee a využívají 60s cache.
- Validace parametrů v controlleru (`ParseIntPipe`, výčtové hodnoty). Neznámé hodnoty ignorovat, ne vracet 500.
- Mapper: přidat `gsm: number | null` (z `gramaz`), `widthCm: number | null` (z `sirka`), `fabricType`, `certifications: string[]`, `groupLabel`. Textová pole zůstanou kvůli zpětné kompatibilitě. Pole ve Flexibee ověřit na reálné instanci (podle komentáře v mapperu jsou některé názvy jen předpoklad).

## 5. Návrh webu

- Route `apps/www/src/app/hledat/page.tsx` (slug česky), `force-dynamic`, `searchParams` jako Promise (Next 16). Stránka má `robots: noindex`.
- **Stav v URL**: `?q=&availability=&...&sort=&strana=&pohled=`. Všechny filtry jsou odkazy nebo GET formulář, takže fungují i bez JavaScriptu. `search-filters` a `search-sort-bar` jsou server komponenty, jen případný drawer na mobilu bude klientský.
- `lib/products.ts`: nová funkce `searchProducts(params)` se stejným přístupem jako `fetchProducts` (nikdy nehází, vrací `unavailable`).
- `site-header.tsx`: vyhledávací pole se změní na `<form action="/hledat" method="get">` s polem `q`. Odstraní se `disabled`. Žádný našeptávač, který není v návrhu.
- `product-card.tsx`: bez Partner Gold slevy (rozhodnutí 4). Zobrazení ceny a skladu doplní pravidla z nastavení eshopu. Stav „Upozornit na naskladnění“ zůstává.
- `product-catalog.tsx` (domovská stránka) je beze změny, jen se sdílí `service-cta` a `ProductCard`.

## 6. Kroky implementace

1. **Rozhodnutí** z bodu 3 (hlavně 1, 2, 3, 4). Bez nich lze dělat kroky 2–4 a 6, facety typ a certifikace zůstanou prázdné.
2. **API – čistý modul** `product-search.ts` + testy (text, filtry, počty facetů, řazení, stránkování).
3. **API – mapper a endpoint** `GET /products/search`, `ProductsService.search()`, unit testy služby (vzor `products.service.spec.ts`).
4. **Web – data**: `searchProducts` v `lib/products.ts`, typy odpovědi.
5. **Web – header**: zpřístupnit vyhledávání v `site-header.tsx`.
6. **Web – stránka** `/hledat`: breadcrumbs, nadpis, pilulky, banner, layout se dvěma sloupci.
7. **Web – filtry a řazení**: sidebar, chipy, reset, sort bar, přepínač zobrazení.
8. **Web – karta a stránkování**: rozšířit `ProductCard`, `search-pagination`, `service-cta`, stavy prázdno a chyba.
9. **Mobil**: podle rozhodnutí 8 (drawer pro filtry, dvousloupcová mřížka z `DESIGN.md`).
10. **E2E**: Playwright test `search.spec.ts` (zadání dotazu z headeru, výsledky, filtr přes URL, stránkování, prázdný stav). Vzor `home.spec.ts`.
11. **Vizuální kontrola**: porovnání s návrhem (screenshot vs. Figma frame) v desktopové šířce 1280 px.

## 7. Testování

- `pnpm test` v `apps/api` (jest): čistý modul a služba (cache, filtry, počty).
- E2E v Dockeru podle README (`docker compose --profile e2e up --exit-code-from www-e2e www-e2e`).
- Ruční kontrola v prohlížeči proti návrhu, zvlášť diakritika v dotazu a prázdný výsledek.

## 8. Rizika

- Flexibee pole pro typ, certifikace a skupiny jsou zatím předpoklad. Chybný název dá prázdné facety bez chyby, proto je v testech potřeba ověřit na reálné instanci.
- Počty facetů se počítají v paměti nad všemi viditelnými produkty. Při velkém katalogu zvážit předpočítání při načtení cache.
- Pravidla zobrazení ceny a skladu v nastavení eshopu ještě nejsou definována. Do té doby karta zobrazuje jen základní cenu a stav skladu z API.
