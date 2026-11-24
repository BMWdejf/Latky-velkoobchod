import type { Pool } from "pg";
import { SettingsService } from "./settings.service";

describe("SettingsService (Postgres)", () => {
  const originalUrl = process.env.DATABASE_URL;
  let query: jest.Mock;
  let service: SettingsService;

  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://test";
    query = jest.fn().mockResolvedValue({ rows: [] });
    service = new SettingsService({ query } as unknown as Pool);
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  it("returns the global stock default when no row exists", async () => {
    await expect(service.get()).resolves.toEqual({
      warehouseId: null,
      rules: [],
    });
  });

  it("creates the table on first use", async () => {
    await service.get();

    expect(query.mock.calls[0]?.[0]).toMatch(
      /CREATE TABLE IF NOT EXISTS app_settings/,
    );
  });

  it("upserts the warehouse id", async () => {
    query.mockImplementation(async (sql: string) =>
      sql.startsWith("SELECT")
        ? { rows: [{ value: { warehouseId: "7", rules: [] } }] }
        : { rows: [] },
    );

    await expect(
      service.update({ warehouseId: "9", rules: [] }),
    ).resolves.toEqual({ warehouseId: "9", rules: [] });

    const upsert = query.mock.calls.find(([sql]) =>
      String(sql).startsWith("INSERT"),
    );
    expect(upsert?.[1]).toEqual([
      "app",
      JSON.stringify({ warehouseId: "9", rules: [] }),
    ]);
  });

  it("stores the rules with the warehouse", async () => {
    await service.update({
      rules: [{ field: "stock", op: "gt", value: 0 }],
    });

    const upsert = query.mock.calls.find(([sql]) =>
      String(sql).startsWith("INSERT"),
    );
    expect(JSON.parse(upsert?.[1][1] as string)).toEqual({
      warehouseId: null,
      rules: [{ field: "stock", op: "gt", value: 0 }],
    });
  });

  it("clears the warehouse when set to null", async () => {
    await expect(
      service.update({ warehouseId: null, rules: [] }),
    ).resolves.toEqual({ warehouseId: null, rules: [] });
  });

  it("treats a blank stored warehouse id as unset", async () => {
    query.mockResolvedValue({
      rows: [{ value: { warehouseId: "   ", rules: [] } }],
    });

    await expect(service.get()).resolves.toEqual({
      warehouseId: null,
      rules: [],
    });
  });

  it("fails clearly when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(service.get()).rejects.toThrow("Database is not configured");
    expect(query).not.toHaveBeenCalled();
  });
});
