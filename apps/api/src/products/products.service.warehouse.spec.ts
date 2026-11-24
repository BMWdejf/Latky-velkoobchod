import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import type { ProductRule } from "./product-rules";
import { ProductsService } from "./products.service";
import {
  productIdFromRef,
  stockCardsPath,
  toStockByProductId,
} from "./warehouse-stock";

const products = {
  "1": {
    id: 1,
    kod: "POV-046",
    nazev: "Povlečení",
    cenaZakl: 690,
    skupZboz: "code:TEXTIL",
  },
  "2": {
    id: 2,
    kod: "LAT-001",
    nazev: "Látka",
    cenaZakl: 120,
    skupZboz: "code:TEXTIL",
  },
  "3": {
    id: 3,
    kod: "HOD-001",
    nazev: "Hodinky",
    cenaZakl: 990,
    skupZboz: "code:DOPLNKY",
  },
};
const cards = [
  { "cenik@ref": "/c/demo/cenik/1.json", stavMJ: "12.0" },
  { "cenik@ref": "/c/demo/cenik/3.json", stavMJ: "0.0" },
  { "cenik@ref": "/c/demo/cenik/3.json", stavMJ: "5.0" },
];

const setup = async (rules: ProductRule[] = []) => {
  const list = jest.fn(async (entity: string) => {
    if (entity === stockCardsPath("38")) {
      return cards;
    }
    const ids = [...entity.matchAll(/id=(\d+)/g)].map((m) => m[1]);
    return ids
      .map((id) => products[id as keyof typeof products])
      .filter(Boolean);
  });
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProductsService,
      { provide: FlexibeeClient, useValue: { list } },
      {
        provide: SettingsService,
        useValue: {
          get: jest.fn().mockResolvedValue({ warehouseId: "38", rules }),
        },
      },
    ],
  }).compile();

  return { service: module.get(ProductsService), list };
};

describe("ProductsService with a selected warehouse", () => {
  it("lists only products that have a stock card in the warehouse", async () => {
    const { service, list } = await setup();
    const page = await service.list({ limit: 10, start: 0 });

    expect(list).toHaveBeenCalledWith("skladova-karta/(sklad=38)", {
      detail: "full",
      limit: "0",
    });
    expect(page.items.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("uses the warehouse quantity and sums several cards per product", async () => {
    const { service } = await setup();
    const page = await service.list({ limit: 10, start: 0 });

    expect(page.items[0]).toMatchObject({
      id: "1",
      stock: 12,
      stockStatus: "low_stock",
    });
    expect(page.items[1]).toMatchObject({
      id: "3",
      stock: 5,
      stockStatus: "low_stock",
    });
  });

  it("pages over the visible products", async () => {
    const { service } = await setup();
    const page = await service.list({ limit: 1, start: 1 });

    expect(page.items.map((item) => item.id)).toEqual(["3"]);
  });

  it("applies the admin rules before paging", async () => {
    const { service } = await setup([
      { field: "group", op: "eq", value: "TEXTIL" },
    ]);
    const page = await service.list({ limit: 10, start: 0 });

    expect(page.items.map((item) => item.id)).toEqual(["1"]);
  });

  it("returns an empty page when the warehouse has no stock cards", async () => {
    const { service, list } = await setup();
    list.mockResolvedValueOnce([]);

    await expect(service.list()).resolves.toMatchObject({ items: [] });
  });
});

describe("warehouse stock helpers", () => {
  it("builds the path only for numeric warehouse ids", () => {
    expect(stockCardsPath("38")).toBe("skladova-karta/(sklad=38)");
    expect(() => stockCardsPath("38 or 1=1")).toThrow("Invalid warehouse id");
  });

  it("extracts the product id from a cenik reference", () => {
    expect(productIdFromRef("/c/demo/cenik/264.json")).toBe("264");
    expect(productIdFromRef("code:XK 3161.6 CR")).toBeNull();
  });

  it("ignores cards without a product reference or a numeric quantity", () => {
    const stock = toStockByProductId([
      { "cenik@ref": "/c/demo/cenik/7.json", stavMJ: "2.5" },
      { "cenik@ref": "", stavMJ: "9" },
      { "cenik@ref": "/c/demo/cenik/8.json", stavMJ: "n/a" },
    ]);

    expect([...stock.entries()]).toEqual([["7", 2.5]]);
  });
});

describe("warehouse stock cache", () => {
  it("reads the stock cards once within the cache window", async () => {
    const { service, list } = await setup();

    await service.list();
    await service.list();

    const cardCalls = list.mock.calls.filter(([entity]) =>
      String(entity).startsWith("skladova-karta"),
    );
    expect(cardCalls).toHaveLength(1);
  });
});

describe("ProductsService summary", () => {
  it("counts visible products, low stock and groups", async () => {
    const { service } = await setup();

    const summary = await service.summary();

    expect(summary).toMatchObject({
      warehouseId: "38",
      total: 2,
      lowStock: 2,
      outOfStock: 0,
      ruleCount: 0,
    });
    expect(summary.criticalItems.map((item) => item.stock)).toEqual([5, 12]);
    expect(summary.groups.map((group) => group.count)).toEqual([1, 1]);
  });
});
