import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let dir: string;
  let service: SettingsService;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "settings-"));
    process.env.SETTINGS_FILE = join(dir, "nested", "settings.json");
    service = new SettingsService();
  });

  afterEach(async () => {
    delete process.env.SETTINGS_FILE;
    await rm(dir, { recursive: true, force: true });
  });

  it("returns the global stock default when no file exists", async () => {
    await expect(service.get()).resolves.toEqual({ warehouseId: null });
  });

  it("persists the warehouse id and creates missing directories", async () => {
    await service.update({ warehouseId: "7" });

    await expect(service.get()).resolves.toEqual({ warehouseId: "7" });
    const raw = await readFile(process.env.SETTINGS_FILE as string, "utf8");
    expect(JSON.parse(raw)).toEqual({ warehouseId: "7" });
  });

  it("clears the warehouse when set to null", async () => {
    await service.update({ warehouseId: "7" });
    await service.update({ warehouseId: null });

    await expect(service.get()).resolves.toEqual({ warehouseId: null });
  });

  it("treats a corrupted or blank warehouse id as unset", async () => {
    await service.update({ warehouseId: "   " });

    await expect(service.get()).resolves.toEqual({ warehouseId: null });
  });
});
