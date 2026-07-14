import path from "node:path";
import { db } from "$src/lib/server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export async function runMigrations() {
  console.info("[migrate] Starting migrations...");

  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  console.info(`[migrate] Migrations folder resolved to: ${migrationsFolder}`);

  try {
    await migrate(db, { migrationsFolder });
    console.info("[migrate] All migrations complete");
  } catch (error) {
    console.error("[migrate] Migration failed:", error);
    throw error; // crash the process; never start with failed migration
  }
}
