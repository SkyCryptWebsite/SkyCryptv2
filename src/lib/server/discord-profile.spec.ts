import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { discordProfile } from "#lib/server/db/schema/index.js";
import { getDiscordProfile, parseDiscordProfile, syncDiscordProfile } from "./discord-profile";

const database = vi.hoisted(() => ({
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoUpdate: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn()
}));

vi.mock("#lib/server/db/index.js", () => ({ db: database }));

beforeEach(() => {
  vi.resetAllMocks();
  database.insert.mockReturnValue(database);
  database.values.mockReturnValue(database);
  database.onConflictDoUpdate.mockResolvedValue(undefined);
  database.select.mockReturnValue(database);
  database.from.mockReturnValue(database);
  database.where.mockReturnValue(database);
  database.limit.mockResolvedValue([]);
});

describe("parseDiscordProfile", () => {
  it("reads modern Discord assets, preferring decoration data over the legacy field", () => {
    expect(
      parseDiscordProfile({
        id: "123456789012345678",
        avatar: "a_avatar123",
        banner: "banner456",
        avatar_decoration: "legacy",
        avatar_decoration_data: { asset: "a_decoration789", sku_id: "987" },
        username: "skycrypt"
      })
    ).toEqual({
      discordUserId: "123456789012345678",
      username: "skycrypt",
      primaryGuild: null,
      avatarHash: "a_avatar123",
      bannerHash: "banner456",
      avatarDecorationHash: "a_decoration789"
    });
  });

  it("preserves explicit removal even when the legacy decoration field is present", () => {
    expect(
      parseDiscordProfile({
        id: "123",
        avatar: null,
        banner: null,
        avatar_decoration: "stale",
        avatar_decoration_data: null
      })
    ).toEqual({
      discordUserId: "123",
      username: null,
      primaryGuild: null,
      avatarHash: null,
      bannerHash: null,
      avatarDecorationHash: null
    });
  });

  it("falls back to the legacy decoration only when modern data is absent", () => {
    expect(parseDiscordProfile({ id: "123", avatar_decoration: "legacy" })).toEqual({
      discordUserId: "123",
      username: null,
      primaryGuild: null,
      avatarHash: null,
      bannerHash: null,
      avatarDecorationHash: "legacy"
    });
  });

  it("accepts accounts without custom assets", () => {
    expect(parseDiscordProfile({ id: "123" })).toEqual({
      discordUserId: "123",
      username: null,
      primaryGuild: null,
      avatarHash: null,
      bannerHash: null,
      avatarDecorationHash: null
    });
  });

  it("stores username and the complete primary guild without mixing in clan data", () => {
    const primaryGuild = {
      identity_guild_id: "332309672486895637",
      identity_enabled: true,
      tag: "APPL",
      badge: "fb7ebd9358a8c1f1e8d23547333a86f0"
    };
    expect(
      parseDiscordProfile({
        id: "389759544776982528",
        username: "tim_cook",
        primary_guild: primaryGuild,
        clan: { tag: "OTHER" }
      })
    ).toMatchObject({ username: "tim_cook", primaryGuild });
  });

  it("preserves disabled guild identity and nullable guild details", () => {
    expect(
      parseDiscordProfile({
        id: "123",
        primary_guild: {
          identity_guild_id: null,
          identity_enabled: false,
          tag: null,
          badge: null
        }
      })?.primaryGuild
    ).toEqual({
      identity_guild_id: null,
      identity_enabled: false,
      tag: null,
      badge: null
    });
  });

  it("clears a removed primary guild on the next sync and updates the username", async () => {
    const profile = parseDiscordProfile({ id: "123", username: "new_name", primary_guild: null });
    expect(profile?.primaryGuild).toBeNull();
    await syncDiscordProfile("authenticated-user", profile!);
    expect(database.onConflictDoUpdate).toHaveBeenCalledWith({
      target: discordProfile.userId,
      set: expect.objectContaining({ username: "new_name", primaryGuild: null })
    });
  });

  it.each([
    null,
    {},
    { id: 123 },
    { id: "not-a-discord-id" },
    { id: "123", avatar: "../image" },
    { id: "123", banner: "https://example.com/image" },
    { id: "123", avatar_decoration_data: { asset: "" } },
    { id: "123", avatar_decoration_data: {} },
    { id: "123", username: 123 },
    { id: "123", primary_guild: { identity_enabled: "false" } },
    { id: "123", primary_guild: { identity_guild_id: 123 } },
    { id: "123", primary_guild: { badge: "../image" } }
  ])("rejects malformed provider data: %j", (profile) => {
    expect(parseDiscordProfile(profile)).toBeNull();
  });
});

describe("Discord profile persistence", () => {
  it("upserts by the authenticated user and clears assets removed on Discord", async () => {
    const assets = {
      discordUserId: "123",
      username: null,
      primaryGuild: null,
      avatarHash: null,
      bannerHash: null,
      avatarDecorationHash: null
    };

    await syncDiscordProfile("authenticated-user", assets);

    expect(database.insert).toHaveBeenCalledWith(discordProfile);
    expect(database.values).toHaveBeenCalledWith({
      userId: "authenticated-user",
      ...assets,
      syncedAt: expect.any(Date)
    });
    expect(database.onConflictDoUpdate).toHaveBeenCalledWith({
      target: discordProfile.userId,
      set: { ...assets, syncedAt: expect.any(Date) }
    });
  });

  it("scopes lookups to the requested user", async () => {
    const profile = { userId: "authenticated-user", discordUserId: "123" };
    database.limit.mockResolvedValue([profile]);

    expect(await getDiscordProfile("authenticated-user")).toBe(profile);
    expect(database.from).toHaveBeenCalledWith(discordProfile);
    const condition = new PgDialect().sqlToQuery(database.where.mock.calls[0][0]);
    expect(condition.sql).toBe('"discord_profile"."user_id" = $1');
    expect(condition.params).toEqual(["authenticated-user"]);
    expect(database.limit).toHaveBeenCalledWith(1);
  });

  it("returns null for users who have not synced yet", async () => {
    expect(await getDiscordProfile("new-user")).toBeNull();
  });
});
