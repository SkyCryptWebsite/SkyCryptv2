import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#lib/server/db/index.js";
import { account, minecraftAccount } from "#lib/server/db/schema/index.js";

const minecraftUuid = z
  .string()
  .regex(/^(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/)
  .transform((uuid) => uuid.replaceAll("-", "").toLowerCase());
const mcIdProfileSchema = z.object({
  sub: z.string().min(1),
  name: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  accounts: z
    .array(
      z.object({
        uuid: minecraftUuid,
        username: z
          .string()
          .min(1)
          .max(16)
          .regex(/^[a-zA-Z0-9_]+$/),
        primary: z.boolean()
      })
    )
    .refine(
      (accounts) =>
        new Set(accounts.map((account) => account.uuid)).size === accounts.length &&
        accounts.filter((account) => account.primary).length <= 1
    )
});

export function parseMcIdProfile(profile: unknown) {
  const result = mcIdProfileSchema.safeParse(profile);
  return result.success ? result.data : null;
}

export type McIdProfile = NonNullable<ReturnType<typeof parseMcIdProfile>>;
export type McIdLink = Pick<typeof account.$inferSelect, "id" | "accountId" | "userId" | "providerId">;

export async function getMcIdLinks(userId: string) {
  return db
    .select({ id: account.id, accountId: account.accountId, userId: account.userId, providerId: account.providerId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id")));
}

export async function getStoredMinecraftAccounts(userId: string) {
  return db
    .select({
      uuid: minecraftAccount.uuid,
      username: minecraftAccount.username,
      primary: minecraftAccount.primary,
      syncedAt: minecraftAccount.syncedAt,
      accountId: minecraftAccount.accountId
    })
    .from(minecraftAccount)
    .innerJoin(account, eq(minecraftAccount.accountId, account.id))
    .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id")))
    .orderBy(desc(minecraftAccount.primary), asc(minecraftAccount.username));
}

export async function storeMinecraftAccounts(link: McIdLink, profile: McIdProfile) {
  if (link.providerId !== "mc-id" || profile.sub !== link.accountId)
    throw new Error("MC-ID identity does not match the linked account.");
  await db.transaction(async (tx) => {
    // Serialize snapshots and ensure the link still belongs to this user before replacing it.
    const [owner] = await tx
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.id, link.id),
          eq(account.userId, link.userId),
          eq(account.providerId, "mc-id"),
          eq(account.accountId, profile.sub)
        )
      )
      .for("update");
    if (!owner) throw new Error("MC-ID account is no longer linked.");
    await tx.delete(minecraftAccount).where(eq(minecraftAccount.accountId, link.id));
    if (profile.accounts.length) {
      const syncedAt = new Date();
      await tx
        .insert(minecraftAccount)
        .values(profile.accounts.map((minecraft) => ({ ...minecraft, accountId: link.id, syncedAt })));
    }
  });
}

export async function fetchMcIdProfile(accessToken: string) {
  const response = await fetch("https://mc-id.com/api/auth/oauth2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
    redirect: "error"
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("MC-ID could not return your Minecraft accounts.");
  const profile = parseMcIdProfile(await response.json());
  if (!profile)
    throw new Error("MC-ID returned incomplete Minecraft account data. Reconnect MC-ID to grant profile access.");
  return profile;
}
