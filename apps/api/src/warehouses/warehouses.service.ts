import { Injectable } from "@nestjs/common";
import { FlexibeeClient } from "../flexibee/flexibee.client";

/**
 * Field names in the Flexibee `sklad` (warehouse) entity.
 * Assumptions: verify against the real instance and change them here only.
 */
export const FLEXIBEE_WAREHOUSE_ENTITY = "sklad";
export const FLEXIBEE_WAREHOUSE_FIELDS = {
  id: "id",
  code: "kod",
  name: "nazev",
} as const;

export type Warehouse = {
  id: string;
  code: string;
  name: string;
};

@Injectable()
export class WarehousesService {
  constructor(private readonly flexibee: FlexibeeClient) {}

  async list(): Promise<Warehouse[]> {
    const rows = await this.flexibee.list(FLEXIBEE_WAREHOUSE_ENTITY, {
      detail: `custom:${Object.values(FLEXIBEE_WAREHOUSE_FIELDS).join(",")}`,
    });

    return rows.map((row) => ({
      id: String(row[FLEXIBEE_WAREHOUSE_FIELDS.id] ?? ""),
      code: String(row[FLEXIBEE_WAREHOUSE_FIELDS.code] ?? ""),
      name: String(row[FLEXIBEE_WAREHOUSE_FIELDS.name] ?? ""),
    }));
  }
}
