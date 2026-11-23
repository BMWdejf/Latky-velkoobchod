import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import { ProductsService } from "./products.service";
import { FLEXIBEE_WAREHOUSE_STOCK } from "./warehouse-stock";

describe("ProductsService with a selected warehouse", () => {
  let service: ProductsService;
  let list: jest.Mock;
  let get: jest.Mock;

  const productRows = [
    { id: 1, kod: "POV-046", nazev: "Povlečení", zasoba: 340, cenaZakl: 690 },
    { id: 2, kod: "LAT-001", nazev: "Látka", zasoba: 50, cenaZakl: 120 },
  ];

  beforeEach(async () => {
    list = jest.fn(async (entity: string) =>
      entity === "cenik" ? productRows : [],
    );
    get = jest.fn().mockResolvedValue({ warehouseId: null });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
        { provide: SettingsService, useValue: { get } },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it("keeps the global stock when no warehouse is selected", async () => {
    const page = await service.list();

    expect(list).toHaveBeenCalledTimes(1);
    expect(page.items.map((item) => item.stock)).toEqual([340, 50]);
  });

  it("replaces stock with the selected warehouse quantities", async () => {
    get.mockResolvedValue({ warehouseId: "9" });
    list.mockImplementation(async (entity: string) => {
      if (entity === "cenik") {
        return productRows;
      }
      return [
        {
          [FLEXIBEE_WAREHOUSE_STOCK.productField]: 1,
          [FLEXIBEE_WAREHOUSE_STOCK.quantityField]: 12,
        },
      ];
    });

    const page = await service.list();

    expect(list).toHaveBeenCalledWith(
      FLEXIBEE_WAREHOUSE_STOCK.entity,
      expect.objectContaining({
        [FLEXIBEE_WAREHOUSE_STOCK.warehouseField]: "9",
      }),
    );
    expect(page.items[0]).toMatchObject({
      id: "1",
      stock: 12,
      stockStatus: "low_stock",
    });
    expect(page.items[1]).toMatchObject({
      id: "2",
      stock: 0,
      stockStatus: "out_of_stock",
    });
  });
});
