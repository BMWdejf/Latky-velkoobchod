import { toStockEntries } from "./warehouse-stock";

describe("toStockEntries", () => {
  it("sums quantity and minimum stock per product", () => {
    const entries = toStockEntries([
      { "cenik@ref": "/c/demo/cenik/7.json", stavMJ: "20.0", minMJ: "5.0" },
      { "cenik@ref": "/c/demo/cenik/7.json", stavMJ: "3", minMJ: "1" },
      { "cenik@ref": "/c/demo/cenik/8.json", stavMJ: "4", minMJ: "" },
    ]);

    expect(entries.get("7")).toEqual({ quantity: 23, minQuantity: 6 });
    expect(entries.get("8")).toEqual({ quantity: 4, minQuantity: 0 });
  });

  it("skips cards without a product reference or quantity", () => {
    const entries = toStockEntries([
      { stavMJ: "5", minMJ: "1" },
      { "cenik@ref": "/c/demo/cenik/9.json", stavMJ: "x" },
    ]);

    expect(entries.size).toBe(0);
  });
});
