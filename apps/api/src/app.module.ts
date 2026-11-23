import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [DatabaseModule, ProductsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
