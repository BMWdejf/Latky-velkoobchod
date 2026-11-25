import type { Product } from "./product.mapper";
import { parseSearchQuery, searchProducts } from "./product-search";

const make = (overrides: Partial<Product>): Product => ({
  id: "1",
  sku: "TEP-001",
  name: "Teplákovina",
  unitPrice: 200,
  currency: "CZK",
  unit: "m",
  stock: 50,
  stockStatus: "in_stock",
  group: "TEP",
  minOrder: null,
  width: "160 cm",
  weight: "240 g/m²",
  composition: null,
  ean: null,
  labels: [],
  imageUrl: null,
  minStock: null,
  notice: null,
  ...overrides,
});

const products: Product[] = [
  make({
    id: "1",
    name: "Teplákovina Hořčicová",
    sku: "TEP-010",
    unitPrice: 185,
    labels: ["TYP_POCESANA", "CERT_OEKOTEX"],
  }),
  make({
    id: "2",
    name: "Úplet žebrový",
    sku: "UPL-002",
    unitPrice: 320,
    stock: 3,
    stockStatus: "low_stock",
    weight: "320 g/m²",
    width: "180 cm",
    labels: ["TYP_ELASTAN", "DULEZITE"],
  }),
  make({
    id: "3",
    name: "Teplákovina French",
    sku: "TEP-020",
    unitPrice: 150,
    stock: 0,
    stockStatus: "out_of_stock",
    weight: "190 g/m²",
    labels: ["TYP_NEPOCESANA", "CERT_GOTS"],
  }),
];

describe("parseSearchQuery", () => {
  it("uses defaults and ignores unknown values", () => {
    const query = parseSearchQuery({
      availability: "in_stock,bogus",
      sort: "popular",
      category: "nope",
      limit: "1000",
      start: "-5",
      gsm: "abc,240",
    });

    expect(query).toMatchObject({
      availability: ["in_stock"],
      sort: "relevance",
      category: null,
      limit: 100,
      start: 0,
      gsm: [240],
    });
  });

  it("reads repeated parameters and numeric price bounds", () => {
    const query = parseSearchQuery({
      fabricType: ["TYP_POCESANA", "S elastanem"],
      certification: "OEKOTEX,cert_gots",
      priceMin: "100",
      priceMax: "200,5",
    });

    // Only prefixed labels are kept; keys are normalized to lower case.
    expect(query.fabricType).toEqual(["typ_pocesana"]);
    expect(query.certification).toEqual(["cert_gots"]);
    expect(query.priceMin).toBe(100);
    expect(query.priceMax).toBe(200.5);
  });
});

describe("searchProducts", () => {
  it("matches text without case or diacritics in name, SKU and EAN", () => {
    const result = searchProducts(
      products,
      parseSearchQuery({ q: "TEPLAKOVINA" }),
    );
    expect(result.total).toBe(2);

    const bySku = searchProducts(products, parseSearchQuery({ q: "upl-002" }));
    expect(bySku.items.map((product) => product.id)).toEqual(["2"]);
  });

  it("filters by availability and price range", () => {
    const result = searchProducts(
      products,
      parseSearchQuery({ availability: "in_stock", priceMax: "200" }),
    );
    expect(result.items.map((product) => product.id)).toEqual(["1"]);
  });

  it("filters by fabric type and certification labels", () => {
    const fabric = searchProducts(
      products,
      parseSearchQuery({ fabricType: "TYP_POCESANA" }),
    );
    expect(fabric.items.map((product) => product.id)).toEqual(["1"]);

    const certified = searchProducts(
      products,
      parseSearchQuery({ certification: "cert_gots" }),
    );
    expect(certified.items.map((product) => product.id)).toEqual(["3"]);
  });

  it("builds fabric and certification facets from prefixed labels only", () => {
    const result = searchProducts(products, parseSearchQuery({}));

    expect(result.facets.fabricType).toEqual([
      { value: "typ_elastan", label: "Elastan", count: 1 },
      { value: "typ_nepocesana", label: "Nepocesana", count: 1 },
      { value: "typ_pocesana", label: "Pocesana", count: 1 },
    ]);
    expect(result.facets.certification).toEqual([
      { value: "cert_gots", label: "Gots", count: 1 },
      { value: "cert_oekotex", label: "Oekotex", count: 1 },
    ]);
  });

  it("filters by gsm and width taken from the labels", () => {
    const labelled = [
      make({ id: "1", labels: ["gramaz_240g", "sire_160cm"] }),
      make({ id: "2", labels: ["gramaz_320g", "sire_180cm"] }),
      make({ id: "3", labels: ["Počesaná"] }),
    ];

    const byGsm = searchProducts(labelled, parseSearchQuery({ gsm: "240" }));
    expect(byGsm.items.map((product) => product.id)).toEqual(["1"]);

    const facets = searchProducts(labelled, parseSearchQuery({})).facets;
    expect(facets.gsm).toEqual([
      { value: 240, count: 1 },
      { value: 320, count: 1 },
    ]);
    expect(facets.widthCm).toEqual([
      { value: 160, count: 1 },
      { value: 180, count: 1 },
    ]);
  });

  it("counts each facet without its own filter applied", () => {
    const result = searchProducts(
      products,
      parseSearchQuery({ availability: "in_stock" }),
    );

    expect(result.total).toBe(1);
    // Availability counts ignore the availability filter itself.
    expect(result.facets.availability).toEqual([
      { value: "in_stock", count: 1 },
      { value: "low_stock", count: 1 },
      { value: "out_of_stock", count: 1 },
    ]);
    // The price range follows the other filters: only the in-stock product counts.
    expect(result.facets.price).toEqual({ min: 185, max: 185 });
  });

  it("sorts by the requested order and pages the result", () => {
    const byPrice = searchProducts(
      products,
      parseSearchQuery({ sort: "price_asc", limit: "2" }),
    );
    expect(byPrice.items.map((product) => product.id)).toEqual(["3", "1"]);
    expect(byPrice.total).toBe(3);

    const second = searchProducts(
      products,
      parseSearchQuery({ sort: "price_asc", limit: "2", start: "2" }),
    );
    expect(second.items.map((product) => product.id)).toEqual(["2"]);
  });

  it("returns empty results without an error when a category has no products", () => {
    const result = searchProducts(
      products,
      parseSearchQuery({ category: "metraz" }),
    );

    expect(result.total).toBe(0);
    expect(result.categories[0]).toEqual({
      key: "all",
      label: "Všechny výsledky",
      count: 3,
    });
  });
});
