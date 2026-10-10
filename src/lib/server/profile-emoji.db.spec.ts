import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as schema from "./db/schema";

const database = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("$lib/server/db", () => ({
  get db() {
    return database.db;
  }
}));

describe.skipIf(!process.env.DATABASE_URL)("Profile emoji grants", () => {
  const namespace = `emoji_test_${randomUUID().replaceAll("-", "")}`;
  const userId = randomUUID();
  const accountId = randomUUID();
  const uuid = randomUUID().replaceAll("-", "");
  let client: ReturnType<typeof postgres>;
  let admin: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    admin = postgres(process.env.DATABASE_URL!, { onnotice: () => {} });
    await admin`CREATE SCHEMA ${admin(namespace)}`;
    client = postgres(process.env.DATABASE_URL!, { connection: { search_path: namespace }, onnotice: () => {} });
    db = drizzle(client, { schema });
    database.db = db;
    // An isolated schema runs the real migrations without changing application data.
    for (const migration of [
      "0000_mixed_lord_tyger",
      "0001_nosy_zuras",
      "0002_lonely_nick_fury",
      "0003_mean_tiger_shark",
      "0004_swift_shotgun",
      "0005_special_medusa",
      "0006_striped_caretaker",
      "0007_wooden_molly_hayes",
      "0008_profile_emoji",
      "0009_remove_verification_cooldown_table"
    ]) {
      const sql = readFileSync(`drizzle/${migration}.sql`, "utf8").replaceAll('"public".', `"${namespace}".`);
      for (const statement of sql.split("--> statement-breakpoint")) await client.unsafe(statement);
    }
    await db.insert(schema.user).values({ id: userId, name: "Emoji test", email: `${userId}@example.invalid` });
    await db
      .insert(schema.account)
      .values({ id: accountId, userId, accountId: "mc-id-test", providerId: "mc-id", updatedAt: new Date() });
    await db.insert(schema.minecraftAccount).values({ accountId, uuid, username: "EmojiTest", primary: true });
  });

  afterAll(async () => {
    if (client) await client.end();
    if (admin) {
      await admin`DROP SCHEMA IF EXISTS ${admin(namespace)} CASCADE`;
      await admin.end();
    }
  });

  it("enforces ownership and hearts, preserves gifted permissions, and retains Patreon perks", async () => {
    const { getEmojiAccounts, saveProfileEmoji } = await import("./profile-emoji");
    await expect(saveProfileEmoji(userId, uuid, "❤️")).rejects.toMatchObject({ status: 403 });
    await db.insert(schema.profileEmoji).values({ uuid, emoji: "❤️", entitlementLevel: 1 });
    await expect(saveProfileEmoji("another-user", uuid, "💙")).rejects.toMatchObject({ status: 403 });
    await expect(saveProfileEmoji(userId, uuid, "🦆")).rejects.toMatchObject({ status: 403 });
    await saveProfileEmoji(userId, uuid, "💙");
    expect((await getEmojiAccounts(userId))[0]).toMatchObject({ emoji: "💙", entitlementLevel: 1 });

    // A friend can have any-emoji access without a Patreon membership.
    await db.update(schema.profileEmoji).set({ entitlementLevel: 2 }).where(eq(schema.profileEmoji.uuid, uuid));
    await saveProfileEmoji(userId, uuid, "🇨🇿");
    expect((await getEmojiAccounts(userId))[0]).toMatchObject({ emoji: "🇨🇿", entitlementLevel: 2 });

    await db.delete(schema.profileEmoji).where(eq(schema.profileEmoji.uuid, uuid));
    await db.insert(schema.patreonMembership).values({
      id: randomUUID(),
      userId,
      patreonUserId: "patron",
      memberId: "member",
      campaignId: "campaign",
      entitlementLevel: 2,
      patronStatus: "former_patron"
    });
    await saveProfileEmoji(userId, uuid, "👩🏽‍💻");
    await db.delete(schema.patreonMembership).where(eq(schema.patreonMembership.userId, userId));
    await saveProfileEmoji(userId, uuid, "🦆");
    expect((await getEmojiAccounts(userId))[0]).toMatchObject({ emoji: "🦆", entitlementLevel: 2 });

    await db.delete(schema.account).where(eq(schema.account.id, accountId));
    await expect(saveProfileEmoji(userId, uuid, "💜")).rejects.toMatchObject({ status: 403 });
    expect(await getEmojiAccounts(userId)).toEqual([]);
    expect((await db.select().from(schema.profileEmoji))[0]).toMatchObject({ emoji: "🦆", entitlementLevel: 2 });
  });
});
