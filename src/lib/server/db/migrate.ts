import path from "node:path";
import { db } from "$src/lib/server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { log } from "evlog";

export async function runMigrations() {
  log.info("migrate", "Starting migrations...");

  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  log.info("migrate", `Migrations folder resolved to: ${migrationsFolder}`);

  try {
    await migrate(db, { migrationsFolder });
    log.info("migrate", "All migrations complete");
  } catch (error) {
    log.error({ action: "migrate.failed", error });
    throw error; // crash the process; never start with failed migration
  }
}
