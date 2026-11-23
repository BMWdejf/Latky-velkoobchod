import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  DEFAULT_PAGE_SIZE,
  type ProductPage,
  ProductsService,
} from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query("limit", new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    limit: number,
    @Query("start", new DefaultValuePipe(0), ParseIntPipe) start: number,
  ): Promise<ProductPage> {
    return this.productsService.list({ limit, start });
  }
}
