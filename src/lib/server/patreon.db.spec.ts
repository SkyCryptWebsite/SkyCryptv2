import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

describe.skipIf(!process.env.DATABASE_URL)("Patreon entitlement persistence", () => {
  it("never lowers a previously earned entitlement", async () => {
    const [{ db }, { user }, { storePatreonMembership }] = await Promise.all([
      import("#lib/server/db/index.js"),
      import("#lib/server/db/schema/index.js"),
      import("./patreon")
    ]);
    const userId = randomUUID();

    await db.insert(user).values({ id: userId, name: "Patreon test", email: `${userId}@example.invalid` });
    try {
      await storePatreonMembership(userId, randomUUID(), "5264298", {
        id: randomUUID(),
        attributes: { campaign_lifetime_support_cents: 6000 }
      });
      const stored = await storePatreonMembership(userId, randomUUID(), "5264298", {
        id: randomUUID(),
        attributes: { campaign_lifetime_support_cents: 500 }
      });

      expect(stored.entitlementLevel).toBe(2);
    } finally {
      const { eq } = await import("drizzle-orm");
      await db.delete(user).where(eq(user.id, userId));
    }
  });

  it("persists rotated creator tokens", async () => {
    const [{ db }, { patreonCreatorToken }, { refreshCreatorAccessToken }, { eq }] = await Promise.all([
      import("#lib/server/db/index.js"),
      import("#lib/server/db/schema/index.js"),
      import("./patreon"),
      import("drizzle-orm")
    ]);
    const campaignId = randomUUID();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 }), {
        status: 200
      })
    );
    const originalClientId = process.env.PATREON_CLIENT_ID;
    const originalClientSecret = process.env.PATREON_CLIENT_SECRET;
    process.env.PATREON_CLIENT_ID = originalClientId || "test-client";
    process.env.PATREON_CLIENT_SECRET = originalClientSecret || "test-secret";

    await db.insert(patreonCreatorToken).values({ campaignId, accessToken: "old-access", refreshToken: "old-refresh" });
    try {
      expect(await refreshCreatorAccessToken(campaignId, "old-access")).toBe("new-access");
      const [stored] = await db
        .select()
        .from(patreonCreatorToken)
        .where(eq(patreonCreatorToken.campaignId, campaignId));
      expect(stored.refreshToken).toBe("new-refresh");
    } finally {
      fetchMock.mockRestore();
      if (originalClientId === undefined) delete process.env.PATREON_CLIENT_ID;
      else process.env.PATREON_CLIENT_ID = originalClientId;
      if (originalClientSecret === undefined) delete process.env.PATREON_CLIENT_SECRET;
      else process.env.PATREON_CLIENT_SECRET = originalClientSecret;
      await db.delete(patreonCreatorToken).where(eq(patreonCreatorToken.campaignId, campaignId));
    }
  });
});
