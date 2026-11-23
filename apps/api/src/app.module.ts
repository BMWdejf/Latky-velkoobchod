import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [ProductsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
