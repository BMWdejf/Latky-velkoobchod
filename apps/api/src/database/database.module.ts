import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

export const DATABASE_POOL = Symbol("DATABASE_POOL");

/**
 * Shared Postgres pool (Neon). Reads `DATABASE_URL` once at startup.
 * When it is missing, queries fail with a clear error instead of crashing boot,
 * so non-database routes keep working.
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (): Pool =>
        new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 5,
        }),
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
