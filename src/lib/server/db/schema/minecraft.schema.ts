import { boolean, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./auth.schema";

export const minecraftAccount = pgTable(
  "minecraft_account",
  {
    accountId: text("account_id")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    uuid: text("uuid").notNull(),
    username: text("username").notNull(),
    primary: boolean("primary").notNull(),
    syncedAt: timestamp("synced_at").defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.accountId, table.uuid] })]
);
