/**
 * Texts and figures from the "Admin panel - Overview" Figma exports.
 * These are sample values from the design, not live data.
 */

export const PERIODS = ["Dnes", "7 dní", "Tento měsíc", "Tento rok"] as const;

export const REVENUE_BARS = [
  { month: "Květen", value: 2.45 },
  { month: "Červen", value: 2.7 },
  { month: "Červenec", value: 2.2 },
  { month: "Srpen", value: 2.85 },
  { month: "Září", value: 3.24 },
  { month: "Říjen", value: 3.84 },
];

export const SORTIMENT = [
  { label: "Teplákoviny & French Terry", share: 45 },
  { label: "Lněná plátna & Přírodní příze", share: 28 },
  { label: "Ložní mako satén & hotel", share: 18 },
  { label: "Doprodej zbytků & vzorníky", share: 9 },
];

export const ORDERS = [
  {
    number: "#VO-2025-0842",
    client: "Nordic Studio s.r.o.",
    items: "3 role (30 m) teplákoviny + 10 sad mako satén",
    value: "19 065 Kč",
    status: "Kompletace",
    note: "Paleta GLS do 15:30",
  },
  {
    number: "#VO-2025-0841",
    client: "Textil Ateliér Brno",
    items: "5 rolí lnu (75 m) Prané 100% lněné plátno",
    value: "32 400 Kč",
    status: "Připraveno",
    note: "Vlastní odběr 14:00",
  },
  {
    number: "#VO-2025-0840",
    client: "Hotel Bellaria s.r.o.",
    items: "40 sad mako satén proužek (Standard 140x200)",
    value: "48 900 Kč",
    status: "Faktura NET 30",
    note: "DB Schenker",
  },
  {
    number: "#VO-2025-0839",
    client: "Design Móda Praha",
    items: "2 role úplet terakota (20 m)",
    value: "8 250 Kč",
    status: "Čeká na platbu",
    note: "Kurýr DPD",
  },
];

export const CRITICAL_STOCK = [
  {
    sku: "UPL-1943",
    name: "Úplet Terakota 190 g/m² (Elastan 5%)",
    stock: "85 m / limit 100 m",
    note: "Centrální sklad Praha hlásí poptávku 140 m na tento týden.",
    action: "Objednat přesun z DK (do 48 h)",
  },
  {
    sku: "POV-015",
    name: "Šedý proužek bavlněný mako satén",
    stock: "0 sad (Vyprodáno)",
    note: "14 poptávek partnerů čeká na naskladnění.",
    action: "Rezervovat z výroby",
  },
];

export const INTEGRATIONS = [
  {
    name: "ERP Pohoda SQL / SAP Sync",
    desc: "Skladové zásoby, fakturace & cenové skupiny",
    metric: "100 % OK",
  },
  {
    name: "ARES Registr ČR",
    desc: "Automatické ověřování IČO a insolvence",
    metric: "112 ms",
  },
  {
    name: "VIES Evropská komise",
    desc: "Ověření DIČ pro přeshraniční reverse charge 0 %",
    metric: "Aktivní",
  },
];

/** Figures for the mobile version, which has its own copy. */
export const MOBILE = {
  heroLabel: "KLÍČOVÁ METRIKA MĚSÍCE",
  heroValue: "3 840 500 Kč",
  heroDelta: "+18.4 % MoM",
  quarter: "Splněno kvartálu 92 % (Q4 cíl)",
  target: "Cíl: 4.2 M Kč",
  vip: "Odběr VIP & Gold: 84 % tržeb",
  logistics: [
    { label: "14 850 m", note: "+12.6 % obrátka" },
    { label: "240 rolí za cyklus", note: "Průměr B2B: 38.5 m" },
    { label: "Rampa 98.4 % včas", note: "Expedice" },
  ],
  clients: [
    { label: "248 firem", note: "+18 nových / týden" },
    { label: "64 Gold smluv", note: "ARES/VIES: 100% OK" },
    { label: "NET 30/60: 98.2 %", note: "Platební kázeň" },
  ],
  warehouses: [
    { name: "Praha Hostivař (84 500 m)", share: 84 },
    { name: "Kodaň Hub (38 200 m)", share: 62 },
  ],
};
