import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import { FLEXIBEE_PRODUCT_DETAIL } from "./product.mapper";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PRODUCTS_ENTITY,
  ProductsService,
} from "./products.service";

const catalogue = [
  {
    id: 2,
    kod: "LAT-002",
    nazev: "Látka",
    sumStavMj: 50,
    cenaZakl: 120,
    skupZboz: "code:A",
  },
  {
    id: 1,
    kod: "POV-046",
    nazev: "Povlečení",
    sumStavMj: 340,
    cenaZakl: 690,
    skupZboz: "code:B",
  },
];

describe("ProductsService (no warehouse selected)", () => {
  let service: ProductsService;
  let list: jest.Mock;

  beforeEach(async () => {
    list = jest.fn().mockResolvedValue(catalogue);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
        {
          provide: SettingsService,
          useValue: {
            get: jest.fn().mockResolvedValue({ warehouseId: null, rules: [] }),
          },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it("reads the whole price list and pages it, sorted by id", async () => {
    const page = await service.list();

    expect(list).toHaveBeenCalledWith(PRODUCTS_ENTITY, {
      detail: FLEXIBEE_PRODUCT_DETAIL,
      limit: "0",
    });
    expect(page.limit).toBe(DEFAULT_PAGE_SIZE);
    expect(page.items.map((item) => item.id)).toEqual(["1", "2"]);
    expect(page.items[0]?.stock).toBe(340);
  });

  it("clamps the page size and start", async () => {
    const page = await service.list({ limit: 5000, start: -3 });

    expect(page.limit).toBe(MAX_PAGE_SIZE);
    expect(page.start).toBe(0);
  });
});

describe("ProductsService public list", () => {
  it("does not expose the admin-only minimum stock", async () => {
    const list = jest.fn().mockResolvedValue(catalogue);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
        {
          provide: SettingsService,
          useValue: {
            get: jest.fn().mockResolvedValue({ warehouseId: null, rules: [] }),
          },
        },
      ],
    }).compile();

    const page = await module.get(ProductsService).list();

    expect(page.items.length).toBeGreaterThan(0);
    for (const item of page.items) {
      expect(item).not.toHaveProperty("minStock");
      expect(item).not.toHaveProperty("labels");
    }
  });
});
