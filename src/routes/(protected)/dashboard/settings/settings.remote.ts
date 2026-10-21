import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import { deleteAccountData, exportAccountData } from "#lib/server/account-data";
import { auth } from "#lib/server/auth";

async function requireSession() {
  const { request } = getRequestEvent();
  const session = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
  if (!session) error(401, "Sign in to manage your account.");
  return { ...session, headers: request.headers };
}

export const getSessions = query(async () => {
  const { session, headers } = await requireSession();
  const sessions = await auth.api.listSessions({ headers });
  return sessions
    .map(({ id, token, userAgent, ipAddress, createdAt, expiresAt }) => ({
      id,
      current: token === session.token,
      userAgent,
      ipAddress,
      createdAt,
      expiresAt
    }))
    .sort(
      (a, b) =>
        Number(b.current) - Number(a.current) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
});

export const revokeSession = command(z.string().min(1), async (id) => {
  const { session, headers } = await requireSession();
  const sessions = await auth.api.listSessions({ headers });
  const target = sessions.find((item) => item.id === id);
  if (!target) error(404, "Session not found.");
  if (target.token === session.token) error(400, "Use the account menu to sign out of this session.");
  await auth.api.revokeSession({ headers, body: { token: target.token } });
});

export const setDeveloperMode = command(z.boolean(), async (developerMode) => {
  const { headers } = await requireSession();
  // Better Auth refreshes the cached session cookie, so later requests see the new value.
  await auth.api.updateUser({ headers, body: { developerMode } });
});

export const exportData = command(async () => {
  const { user } = await requireSession();
  return exportAccountData(user.id);
});

export const deleteAccount = command(z.literal("DELETE"), async () => {
  const { user, session, headers } = await requireSession();
  // Match Better Auth's default one-day freshness requirement for destructive account changes.
  if (Date.now() - new Date(session.createdAt).getTime() >= 86_400_000) {
    error(403, "Sign out and sign in again before deleting your account.");
  }
  if (session.impersonatedBy) error(403, "You cannot delete an account while impersonating its owner.");
  await deleteAccountData(user.id);
  await auth.api.signOut({ headers });
});
