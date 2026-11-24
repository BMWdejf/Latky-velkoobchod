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
      minStock: null,
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
