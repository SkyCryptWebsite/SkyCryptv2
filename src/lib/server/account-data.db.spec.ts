import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as schema from "./db/schema";

const database = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("#lib/server/db/index.js", () => ({
  get db() {
    return database.db;
  }
}));
import { deleteAccountData, exportAccountData } from "./account-data";

describe.skipIf(!process.env.DATABASE_URL)("Account data portability and deletion", () => {
  const namespace = `privacy_test_${randomUUID().replaceAll("-", "")}`;
  let admin: ReturnType<typeof postgres>;
  let client: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  const owner = randomUUID();
  const stranger = randomUUID();
  const accountId = randomUUID();
  const uuid = randomUUID().replaceAll("-", "");
  beforeAll(async () => {
    admin = postgres(process.env.DATABASE_URL!, { onnotice: () => {} });
    await admin`CREATE SCHEMA ${admin(namespace)}`;
    client = postgres(process.env.DATABASE_URL!, { connection: { search_path: namespace }, onnotice: () => {} });
    db = drizzle(client, { schema });
    database.db = db;
    for (const file of readdirSync("drizzle")
      .filter((file) => file.endsWith(".sql"))
      .sort()) {
      const sql = readFileSync(`drizzle/${file}`, "utf8").replaceAll('"public".', `"${namespace}".`);
      for (const statement of sql.split("--> statement-breakpoint")) await client.unsafe(statement);
    }
    await db.insert(schema.user).values([
      { id: owner, name: "Owner", email: `${owner}@example.invalid` },
      { id: stranger, name: "Other user", email: `${stranger}@example.invalid` }
    ]);
    await db.insert(schema.account).values({
      id: accountId,
      userId: owner,
      accountId: "provider-id",
      providerId: "mc-id",
      accessToken: "oauth-secret",
      refreshToken: "refresh-secret",
      idToken: "id-secret",
      password: "password-secret"
    });
    await db.insert(schema.minecraftAccount).values({ accountId, uuid, username: "LinkedPlayer", primary: true });
    await db.insert(schema.profileEmoji).values({ uuid, emoji: "💜" });
    await db
      .insert(schema.discordProfile)
      .values({ userId: owner, discordUserId: "discord-id", username: "LinkedPlayer" });
    await db.insert(schema.patreonMembership).values({
      id: randomUUID(),
      userId: owner,
      patreonUserId: "patreon-id",
      memberId: "member-id",
      campaignId: "campaign-id"
    });
    for (const userId of [owner, stranger]) {
      await db.insert(schema.session).values({
        id: randomUUID(),
        userId,
        token: `session-secret-${userId}`,
        expiresAt: new Date(Date.now() + 86400000)
      });
      await db.insert(schema.apikey).values({
        id: randomUUID(),
        referenceId: userId,
        key: `key-secret-${userId}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });
  afterAll(async () => {
    if (client) await client.end();
    if (admin) {
      await admin`DROP SCHEMA IF EXISTS ${admin(namespace)} CASCADE`;
      await admin.end();
    }
  });
  it("exports personal records without secrets or other users' data, then removes linked data atomically", async () => {
    const exported = await exportAccountData(owner);
    expect(exported.profile?.id).toBe(owner);
    expect(exported.accounts).toHaveLength(1);
    expect(exported.minecraftAccounts[0].uuid).toBe(uuid);
    expect(exported.profileEmojis[0].emoji).toBe("💜");
    expect(exported.discordProfile?.discordUserId).toBe("discord-id");
    expect(exported.patreonMembership?.memberId).toBe("member-id");
    expect(exported.sessions).toHaveLength(1);
    expect(exported.apiKeys).toHaveLength(1);
    expect(JSON.stringify(exported)).not.toMatch(/secret|password|accessToken|refreshToken|idToken/);
    expect(JSON.stringify(exported)).not.toContain(stranger);
    await client.unsafe(
      `CREATE FUNCTION reject_privacy_deletion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Deletion rejected'; END; $$`
    );
    await client.unsafe(
      `CREATE TRIGGER reject_privacy_deletion BEFORE DELETE ON "user" FOR EACH ROW EXECUTE FUNCTION reject_privacy_deletion()`
    );
    await expect(deleteAccountData(owner)).rejects.toMatchObject({ cause: { message: "Deletion rejected" } });
    expect(await db.select().from(schema.profileEmoji)).toHaveLength(1);
    expect(await db.select().from(schema.apikey).where(eq(schema.apikey.referenceId, owner))).toHaveLength(1);
    await client.unsafe(`DROP TRIGGER reject_privacy_deletion ON "user"`);
    await deleteAccountData(owner);
    for (const table of [
      schema.user,
      schema.account,
      schema.minecraftAccount,
      schema.profileEmoji,
      schema.discordProfile,
      schema.patreonMembership,
      schema.session,
      schema.apikey
    ]) {
      const remaining = await db.select().from(table);
      expect(JSON.stringify(remaining)).not.toContain(owner);
      if (![schema.user, schema.session, schema.apikey].includes(table as typeof schema.user))
        expect(remaining).toHaveLength(0);
    }
    expect(await db.select().from(schema.user).where(eq(schema.user.id, stranger))).toHaveLength(1);
    expect(await db.select().from(schema.session).where(eq(schema.session.userId, stranger))).toHaveLength(1);
    expect(await db.select().from(schema.apikey).where(eq(schema.apikey.referenceId, stranger))).toHaveLength(1);
  });
});
