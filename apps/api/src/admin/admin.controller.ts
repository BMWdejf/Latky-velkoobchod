import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { parseRules } from "../products/product-rules";
import {
  ADMIN_PRODUCT_FILTERS,
  type AdminProductFilter,
  type AdminProductPage,
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

  /** Product list for the admin Products page, with search, filters and paging. */
  @Get("products")
  listProducts(
    @Query() query: Record<string, unknown>,
  ): Promise<AdminProductPage> {
    return this.products.adminList(parseProductQuery(query));
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

const MAX_QUERY_LENGTH = 100;

/** Validates the query string of `GET /admin/products`. Unknown keys are ignored. */
export const parseProductQuery = (query: Record<string, unknown>) => {
  const text = (name: string): string | undefined => {
    const value = query[name];
    if (value === undefined || value === "") {
      return undefined;
    }
    if (typeof value !== "string" || value.length > MAX_QUERY_LENGTH) {
      throw new BadRequestException(`${name} must be a short string`);
    }
    return value.trim();
  };
  const integer = (
    name: string,
    min: number,
    max: number,
  ): number | undefined => {
    const raw = text(name);
    if (raw === undefined) {
      return undefined;
    }
    if (!/^\d+$/.test(raw)) {
      throw new BadRequestException(`${name} must be a whole number`);
    }
    return Math.min(Math.max(Number(raw), min), max);
  };
  const filter = text("filter") ?? "all";
  if (!(ADMIN_PRODUCT_FILTERS as readonly string[]).includes(filter)) {
    throw new BadRequestException(
      `filter must be one of: ${ADMIN_PRODUCT_FILTERS.join(", ")}`,
    );
  }

  return {
    q: text("q"),
    filter: filter as AdminProductFilter,
    group: text("group"),
    limit: integer("limit", 1, 100),
    start: integer("start", 0, Number.MAX_SAFE_INTEGER),
  };
};
