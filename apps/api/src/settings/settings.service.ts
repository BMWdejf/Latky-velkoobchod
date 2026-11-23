import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Injectable } from "@nestjs/common";

export type AppSettings = {
  /** Flexibee `sklad` id whose stock is shown. `null` = use the global stock. */
  warehouseId: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = { warehouseId: null };

const DEFAULT_SETTINGS_FILE = "data/settings.json";

/**
 * Persists admin-editable settings as a small JSON file. The path comes from
 * `SETTINGS_FILE`; mount it on a persistent volume in production.
 */
@Injectable()
export class SettingsService {
  async get(): Promise<AppSettings> {
    try {
      const raw = await readFile(settingsFilePath(), "utf8");
      return normalize(JSON.parse(raw));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { ...DEFAULT_SETTINGS };
      }
      throw error;
    }
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const next = normalize({ ...(await this.get()), ...patch });
    await writeAtomically(
      settingsFilePath(),
      `${JSON.stringify(next, null, 2)}\n`,
    );
    return next;
  }
}

const settingsFilePath = (): string =>
  process.env.SETTINGS_FILE ?? DEFAULT_SETTINGS_FILE;

const normalize = (value: unknown): AppSettings => {
  const source = (value ?? {}) as Partial<Record<keyof AppSettings, unknown>>;
  const warehouseId =
    typeof source.warehouseId === "string" && source.warehouseId.trim() !== ""
      ? source.warehouseId.trim()
      : null;

  return { warehouseId };
};

const writeAtomically = async (
  path: string,
  content: string,
): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp`;
  await writeFile(tempPath, content, "utf8");
  await rename(tempPath, path);
};
