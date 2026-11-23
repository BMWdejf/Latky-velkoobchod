import { Test, TestingModule } from "@nestjs/testing";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { FLEXIBEE_PRODUCT_DETAIL } from "./product.mapper";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PRODUCTS_ENTITY,
  ProductsService,
} from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let list: jest.Mock;

  beforeEach(async () => {
    list = jest.fn().mockResolvedValue([
      {
        id: 1,
        kod: "POV-046",
        nazev: "Povlečení",
        zasoba: 340,
        cenaZakl: 690,
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: FlexibeeClient, useValue: { list } },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it("queries the price list with the default page size", async () => {
    const page = await service.list();

    expect(list).toHaveBeenCalledWith(PRODUCTS_ENTITY, {
      detail: FLEXIBEE_PRODUCT_DETAIL,
      limit: String(DEFAULT_PAGE_SIZE),
      start: "0",
    });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.sku).toBe("POV-046");
  });

  it("clamps the page size to the allowed range", async () => {
    const page = await service.list({ limit: 5000, start: -3 });

    expect(page.limit).toBe(MAX_PAGE_SIZE);
    expect(page.start).toBe(0);
    expect(list).toHaveBeenCalledWith(
      PRODUCTS_ENTITY,
      expect.objectContaining({ limit: String(MAX_PAGE_SIZE), start: "0" }),
    );
  });
});
