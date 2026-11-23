import { Module } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";
import { SettingsService } from "../settings/settings.service";
import { WarehousesService } from "../warehouses/warehouses.service";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "./admin.guard";

@Module({
  controllers: [AdminController],
  providers: [AdminGuard, FlexibeeClient, SettingsService, WarehousesService],
})
export class AdminModule {}
