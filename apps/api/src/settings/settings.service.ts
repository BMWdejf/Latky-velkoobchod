import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { Pool } from "pg";
import { DATABASE_POOL } from "../database/database.module";
import { type ProductRule, parseRules } from "../products/product-rules";

export type AppSettings = {
  /** Flexibee `sklad` id whose stock is shown. `null` = use the global stock. */
  warehouseId: string | null;
  /** Conditions every shown product must meet. Empty = show all. */
  rules: ProductRule[];
};

export const DEFAULT_SETTINGS: AppSettings = { warehouseId: null, rules: [] };

const SETTINGS_KEY = "app";

/**
 * Admin-editable settings stored in Postgres (`app_settings`, one row per key).
 * The table is created on first use.
 */
@Injectable()
export class SettingsService {
  private schemaReady: Promise<void> | null = null;

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async get(): Promise<AppSettings> {
    await this.ensureSchema();

    const result = await this.pool.query<{ value: unknown }>(
      "SELECT value FROM app_settings WHERE key = $1",
      [SETTINGS_KEY],
    );

    return normalize(result.rows[0]?.value);
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    await this.ensureSchema();

    const next = normalize({ ...(await this.get()), ...patch });

    await this.pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [SETTINGS_KEY, JSON.stringify(next)],
    );

    return next;
  }

  private ensureSchema(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException("Database is not configured");
    }

    this.schemaReady ??= this.pool
      .query(
        `CREATE TABLE IF NOT EXISTS app_settings (
           key text PRIMARY KEY,
           value jsonb NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`,
      )
      .then(() => undefined)
      .catch((error: unknown) => {
        // Allow a retry on the next request if the database was unreachable.
        this.schemaReady = null;
        throw error;
      });

    return this.schemaReady;
  }
}

const normalize = (value: unknown): AppSettings => {
  const source = (value ?? {}) as Partial<Record<keyof AppSettings, unknown>>;
  const warehouseId =
    typeof source.warehouseId === "string" && source.warehouseId.trim() !== ""
      ? source.warehouseId.trim()
      : null;

  return { warehouseId, rules: storedRules(source.rules) };
};

/** Stored rules were validated on save; if they are unreadable, show all products. */
const storedRules = (value: unknown): ProductRule[] => {
  try {
    return parseRules(value);
  } catch {
    return [];
  }
};
