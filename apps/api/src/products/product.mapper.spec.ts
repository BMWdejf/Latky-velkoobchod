import { mapFlexibeeProduct, toStockStatus } from "./product.mapper";

describe("mapFlexibeeProduct", () => {
  it("maps a Flexibee price list row to a product", () => {
    const product = mapFlexibeeProduct({
      id: 10,
      kod: "TEP-010",
      nazev: "Teplákovina Hořčicová",
      cenaZakl: "185.00",
      mj: "m",
      sumStavMj: 1240,
      minOdber: 10,
      sirka: "160",
      gramaz: "240 g/m²",
      slozeni: "100% Bavlna",
      eanKod: "8594182910121",
    });

    expect(product).toEqual({
      id: "10",
      sku: "TEP-010",
      name: "Teplákovina Hořčicová",
      unitPrice: 185,
      currency: "CZK",
      unit: "m",
      stock: 1240,
      stockStatus: "in_stock",
      group: null,
      minOrder: 10,
      width: "160",
      weight: "240 g/m²",
      composition: "100% Bavlna",
      ean: "8594182910121",
      imageUrl: null,
      minStock: null,
      labels: [],
      notice: null,
    });
  });

  it("falls back to safe defaults for missing or invalid values", () => {
    const product = mapFlexibeeProduct({
      id: 1,
      kod: "X",
      nazev: "Y",
      cenaZakl: "not a number",
      mj: null,
      sumStavMj: null,
      minOdber: "",
      sirka: null,
      gramaz: "   ",
    });

    expect(product.unitPrice).toBe(0);
    expect(product.stock).toBe(0);
    expect(product.stockStatus).toBe("out_of_stock");
    expect(product.minOrder).toBeNull();
    expect(product.width).toBeNull();
    expect(product.weight).toBeNull();
    expect(product.composition).toBeNull();
  });
});

describe("toStockStatus", () => {
  it.each([
    [0, "out_of_stock"],
    [1, "low_stock"],
    [100, "low_stock"],
    [101, "in_stock"],
  ] as const)("maps stock %i to %s", (stock, status) => {
    expect(toStockStatus(stock)).toBe(status);
  });
});

describe("mapFlexibeeProduct label values", () => {
  it("shows gramáž and šířka from the gramaz_ and sire_ labels", () => {
    const product = mapFlexibeeProduct({
      id: 5,
      kod: "TEP-005",
      nazev: "Teplákovina",
      stitky: ["gramaz_240g", "sire_160cm", "Počesaná"],
      gramaz: "999",
      sirka: "999",
    });

    expect(product.weight).toBe("240 g/m²");
    expect(product.width).toBe("160 cm");
    expect(product.labels).toEqual(["gramaz_240g", "sire_160cm", "Počesaná"]);
  });

  it("falls back to the field values when no label is set", () => {
    const product = mapFlexibeeProduct({
      id: 6,
      kod: "TEP-006",
      nazev: "Úplet",
      gramaz: "320",
      sirka: "180",
    });

    expect(product.weight).toBe("320");
    expect(product.width).toBe("180");
  });
});
