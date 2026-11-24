import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import { ProductsService } from "./products.service";

const catalogue = [
  {
    id: 1,
    kod: "POV-046",
    nazev: "Povlečení Luční",
    sumStavMj: 340,
    cenaZakl: 690,
    skupZboz: "code:B",
  },
  {
    id: 2,
    kod: "LAT-002",
    nazev: "Látka lněná",
    sumStavMj: 50,
    cenaZakl: 120,
    skupZboz: "code:A",
  },
  {
    id: 3,
    kod: "TEP-010",
    nazev: "Teplákovina",
    sumStavMj: 0,
    cenaZakl: 218,
    skupZboz: "code:A",
  },
];

const setup = async (rules: unknown[] = []) => {
  const list = jest.fn().mockResolvedValue(catalogue);
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProductsService,
      { provide: FlexibeeClient, useValue: { list } },
      {
        provide: SettingsService,
        useValue: {
          get: jest.fn().mockResolvedValue({ warehouseId: null, rules }),
        },
      },
    ],
  }).compile();

  return module.get(ProductsService);
};

describe("ProductsService.adminList", () => {
  it("returns every product, sorted by id, with web visibility", async () => {
    const service = await setup([{ field: "stock", op: "gt", value: 0 }]);

    const page = await service.adminList();

    expect(page.items.map((item) => item.id)).toEqual(["1", "2", "3"]);
    expect(page.items.map((item) => item.visibleForWeb)).toEqual([
      true,
      true,
      false,
    ]);
    expect(page.total).toBe(3);
  });

  it("counts every filter over the whole source, not the filtered list", async () => {
    const service = await setup([{ field: "stock", op: "gt", value: 0 }]);

    const page = await service.adminList({ filter: "low" });

    expect(page.counts).toEqual({ all: 3, low: 1, out: 1, hidden: 1 });
    expect(page.items.map((item) => item.sku)).toEqual(["LAT-002"]);
  });

  it("searches name and SKU without case sensitivity", async () => {
    const service = await setup();

    expect((await service.adminList({ q: "pov-" })).items[0]?.sku).toBe(
      "POV-046",
    );
    expect((await service.adminList({ q: "LNĚN" })).total).toBe(1);
  });

  it("filters by group code", async () => {
    const service = await setup();

    const page = await service.adminList({ group: "A" });

    expect(page.total).toBe(2);
  });

  it("pages after filtering", async () => {
    const service = await setup();

    const page = await service.adminList({ limit: 2, start: 2 });

    expect(page.items.map((item) => item.sku)).toEqual(["TEP-010"]);
    expect(page.total).toBe(3);
  });

  it("sums stock value over the whole source", async () => {
    const service = await setup();

    const page = await service.adminList();

    expect(page.kpis.stockValue).toBe(340 * 690 + 50 * 120);
    expect(page.kpis.totalSku).toBe(3);
  });
});
