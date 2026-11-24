import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import { ProductsService } from "./products.service";
import {
  productIdFromRef,
  stockCardsPath,
  toStockByProductId,
} from "./warehouse-stock";

describe("ProductsService with a selected warehouse", () => {
  let service: ProductsService;
  let list: jest.Mock;
  let get: jest.Mock;

  const products = {
    "1": { id: 1, kod: "POV-046", nazev: "Povlečení", cenaZakl: 690 },
    "2": { id: 2, kod: "LAT-001", nazev: "Látka", cenaZakl: 120 },
    "3": { id: 3, kod: "HOD-001", nazev: "Hodinky", cenaZakl: 990 },
  };
  const cards = [
    { "cenik@ref": "/c/demo/cenik/1.json", stavMJ: "12.0" },
    { "cenik@ref": "/c/demo/cenik/3.json", stavMJ: "0.0" },
    { "cenik@ref": "/c/demo/cenik/3.json", stavMJ: "5.0" },
  ];

  beforeEach(async () => {
    list = jest.fn(async (entity: string) => {
      if (entity === stockCardsPath("38")) {
        return cards;
      }
      const ids = [...entity.matchAll(/id=(\d+)/g)].map((m) => m[1]);
      return ids
        .map((id) => products[id as keyof typeof products])
        .filter(Boolean);
    });
    get = jest.fn().mockResolvedValue({ warehouseId: "38" });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
        { provide: SettingsService, useValue: { get } },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it("lists only products that have a stock card in the selected warehouse", async () => {
    const page = await service.list({ limit: 10, start: 0 });

    expect(list).toHaveBeenCalledWith("skladova-karta/(sklad=38)", {
      detail: "full",
      limit: "0",
    });
    expect(page.items.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("uses the warehouse quantity and sums several cards per product", async () => {
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

  it("pages over the warehouse products, not over the full catalogue", async () => {
    const page = await service.list({ limit: 1, start: 1 });

    expect(page.items.map((item) => item.id)).toEqual(["3"]);
  });

  it("returns an empty page when the warehouse has no stock cards", async () => {
    list.mockResolvedValueOnce([]);

    await expect(service.list()).resolves.toMatchObject({ items: [] });
    expect(list).toHaveBeenCalledTimes(1);
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
    const list = jest.fn(async (entity: string) =>
      entity.startsWith("skladova-karta")
        ? [{ "cenik@ref": "/c/demo/cenik/1.json", stavMJ: "3.0" }]
        : [{ id: 1, kod: "POV-046", nazev: "Povlečení", cenaZakl: 690 }],
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
        {
          provide: SettingsService,
          useValue: { get: jest.fn().mockResolvedValue({ warehouseId: "38" }) },
        },
      ],
    }).compile();
    const service = module.get(ProductsService);

    await service.list();
    await service.list();

    const cardCalls = list.mock.calls.filter(([entity]) =>
      String(entity).startsWith("skladova-karta"),
    );
    expect(cardCalls).toHaveLength(1);
  });
});
