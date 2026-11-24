import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from "@nestjs/common";
import { parseRules } from "../products/product-rules";
import {
  ProductsService,
  type ProductsSummary,
} from "../products/products.service";
import {
  type AppSettings,
  SettingsService,
} from "../settings/settings.service";
import {
  type Warehouse,
  WarehousesService,
} from "../warehouses/warehouses.service";
import { AdminGuard } from "./admin.guard";

export type AdminOverview = ProductsSummary & {
  warehouseName: string | null;
  flexibeeOk: boolean;
  databaseOk: boolean;
};

export type UpdateSettingsBody = {
  warehouseId: string | null;
  rules?: unknown;
};

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly settings: SettingsService,
    private readonly warehouses: WarehousesService,
    private readonly products: ProductsService,
  ) {}

  @Get("warehouses")
  listWarehouses(): Promise<Warehouse[]> {
    return this.warehouses.list();
  }

  /** Data for the admin overview. Each external service is checked on its own. */
  @Get("overview")
  async overview(): Promise<AdminOverview> {
    const [summary, warehouseCheck, databaseOk] = await Promise.all([
      this.products.summary(),
      this.warehouses.list().then(
        (list) => ({ list, ok: true }),
        () => ({ list: null, ok: false }),
      ),
      this.settings.get().then(
        () => true,
        () => false,
      ),
    ]);
    const selected = warehouseCheck.list?.find(
      (warehouse) => warehouse.id === summary.warehouseId,
    );

    return {
      ...summary,
      warehouseName: selected ? `${selected.code} – ${selected.name}` : null,
      flexibeeOk: warehouseCheck.ok,
      databaseOk,
    };
  }

  @Get("settings")
  getSettings(): Promise<AppSettings> {
    return this.settings.get();
  }

  @Put("settings")
  updateSettings(@Body() body: UpdateSettingsBody): Promise<AppSettings> {
    return this.settings.update({
      warehouseId: parseWarehouseId(body),
      rules: parseRules(body?.rules),
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
