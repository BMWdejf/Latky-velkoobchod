import { Module } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, FlexibeeClient],
})
export class ProductsModule {}
