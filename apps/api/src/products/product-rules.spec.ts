import { BadRequestException } from "@nestjs/common";
import type { Product } from "./product.mapper";
import { matchesAllRules, noticeFor, parseRules } from "./product-rules";

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
  labels: [],
  notice: null,
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

describe("text rules", () => {
  it("keeps text rules out of the hide check and returns the first matching text", () => {
    const rules = parseRules([
      { field: "stock", op: "eq", value: 0, action: "text", text: "Vyprodáno" },
      { field: "stock", op: "gt", value: 1, action: "text", text: "Skladem" },
      { field: "stock", op: "gt", value: 0 },
    ]);

    expect(matchesAllRules({ ...product, stock: 12 }, rules)).toBe(true);
    expect(noticeFor({ ...product, stock: 0 }, rules)).toBe("Vyprodáno");
    expect(noticeFor({ ...product, stock: 12 }, rules)).toBe("Skladem");
    expect(noticeFor({ ...product, stock: 1 }, rules)).toBeNull();
  });

  it("rejects a text rule on a field other than stock", () => {
    expect(() =>
      parseRules([
        {
          field: "group",
          op: "eq",
          value: "TEXTIL",
          action: "text",
          text: "x",
        },
      ]),
    ).toThrow(BadRequestException);
  });
});
