import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  type AppSettings,
  SettingsService,
} from "../settings/settings.service";
import {
  type Warehouse,
  WarehousesService,
} from "../warehouses/warehouses.service";
import { AdminGuard } from "./admin.guard";

export type UpdateSettingsBody = {
  warehouseId: string | null;
};

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly settings: SettingsService,
    private readonly warehouses: WarehousesService,
  ) {}

  @Get("warehouses")
  listWarehouses(): Promise<Warehouse[]> {
    return this.warehouses.list();
  }

  @Get("settings")
  getSettings(): Promise<AppSettings> {
    return this.settings.get();
  }

  @Put("settings")
  updateSettings(@Body() body: UpdateSettingsBody): Promise<AppSettings> {
    return this.settings.update({
      warehouseId: parseWarehouseId(body),
    });
  }
}

const parseWarehouseId = (body: unknown): string | null => {
  const value = (body as Partial<UpdateSettingsBody> | undefined)?.warehouseId;

  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || !/^\d{1,18}$/.test(value.trim())) {
    throw new BadRequestException(
      "warehouseId must be a numeric Flexibee id or null",
    );
  }

  return value.trim();
};
