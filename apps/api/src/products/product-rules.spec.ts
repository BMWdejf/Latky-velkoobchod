import { BadRequestException } from "@nestjs/common";
import type { Product } from "./product.mapper";
import { matchesAllRules, parseRules } from "./product-rules";

const product: Product = {
  id: "7",
  sku: "POV-046",
  name: "Povlečení bavlněné",
  unitPrice: 690,
  currency: "CZK",
  unit: "ks",
  stock: 12,
  stockStatus: "low_stock",
  group: "TEXTIL",
  minOrder: null,
  width: null,
  weight: null,
  composition: null,
  ean: null,
  imageUrl: null,
  minStock: null,
};

describe("parseRules", () => {
  it("accepts valid rules and treats missing input as no rules", () => {
    expect(parseRules(undefined)).toEqual([]);
    expect(
      parseRules([
        { field: "stock", op: "gt", value: "0" },
        { field: "group", op: "in", value: "TEXTIL, DOPLNKY" },
        { field: "name", op: "notContains", value: "zrušeno" },
      ]),
    ).toEqual([
      { field: "stock", op: "gt", value: 0 },
      { field: "group", op: "in", value: ["TEXTIL", "DOPLNKY"] },
      { field: "name", op: "notContains", value: "zrušeno" },
    ]);
  });

  it.each([
    [[{ field: "color", op: "eq", value: "red" }]],
    [[{ field: "stock", op: "contains", value: "1" }]],
    [[{ field: "price", op: "gt", value: "abc" }]],
    [[{ field: "group", op: "in", value: [] }]],
    [
      Array.from({ length: 21 }, () => ({
        field: "stock",
        op: "gt",
        value: 0,
      })),
    ],
  ])("rejects invalid rules %#", (input) => {
    expect(() => parseRules(input)).toThrow(BadRequestException);
  });
});

describe("matchesAllRules", () => {
  it("requires every rule to match", () => {
    expect(
      matchesAllRules(product, [
        { field: "stock", op: "gt", value: 0 },
        { field: "price", op: "lte", value: 500 },
      ]),
    ).toBe(false);
  });

  it("matches groups and text case-insensitively", () => {
    expect(
      matchesAllRules(product, [{ field: "group", op: "eq", value: "textil" }]),
    ).toBe(true);
    expect(
      matchesAllRules(product, [
        { field: "code", op: "contains", value: "pov" },
      ]),
    ).toBe(true);
    expect(
      matchesAllRules(product, [
        { field: "name", op: "notContains", value: "bavln" },
      ]),
    ).toBe(false);
  });

  it("shows everything when there are no rules", () => {
    expect(matchesAllRules(product, [])).toBe(true);
  });
});
