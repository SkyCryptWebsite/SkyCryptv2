import { form, query, requested } from "$app/server";
import { invalid } from "@sveltejs/kit";
import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { audit, requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { apikey, apiKeyRequest, rateLimitRequest, user } from "#lib/server/db/schema";
import { listArgs, reviewSchema } from "#lib/shared/admin";
import { roleRank } from "#lib/shared/roles";
import { getOverview } from "../admin.remote";

const reviewer = alias(user, "reviewer");

export const listRateLimitRequests = query(
  listArgs.extend({ status: z.enum(["pending", "approved", "denied", "all"]).default("pending") }),
  async ({ page, size, q, status }) => {
    await requireStaff({ user: ["list"] });
    const filters: (SQL | undefined)[] = [
      status === "all" ? undefined : eq(rateLimitRequest.status, status),
      q ? ilike(user.name, `%${q}%`) : undefined
    ];
    const where = and(...filters);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: rateLimitRequest.id,
          requestedMax: rateLimitRequest.requestedMax,
          reason: rateLimitRequest.reason,
          status: rateLimitRequest.status,
          reviewNote: rateLimitRequest.reviewNote,
          createdAt: rateLimitRequest.createdAt,
          reviewedAt: rateLimitRequest.reviewedAt,
          reviewerName: reviewer.name,
          projectName: apiKeyRequest.name,
          currentMax: apikey.rateLimitMax,
          timeWindow: apikey.rateLimitTimeWindow,
          requestCount: apikey.requestCount,
          user: { id: user.id, name: user.name, image: user.image }
        })
        .from(rateLimitRequest)
        .innerJoin(user, eq(user.id, rateLimitRequest.userId))
        .innerJoin(apiKeyRequest, eq(apiKeyRequest.id, rateLimitRequest.apiKeyRequestId))
        .leftJoin(apikey, eq(apikey.id, apiKeyRequest.apiKeyId))
        .leftJoin(reviewer, eq(reviewer.id, rateLimitRequest.reviewedBy))
        .where(where)
        .orderBy(status === "pending" ? asc(rateLimitRequest.createdAt) : desc(rateLimitRequest.createdAt))
        .limit(size)
        .offset((page - 1) * size),
      db
        .select({ total: count() })
        .from(rateLimitRequest)
        .innerJoin(user, eq(user.id, rateLimitRequest.userId))
        .where(where)
    ]);
    return { total, rows };
  }
);

export const reviewRateLimitRequest = form(reviewSchema, async ({ id, decision, note }) => {
  const { staff } = await requireStaff({ apiAccess: ["review"] });
  const [request] = await db
    .select({
      userId: rateLimitRequest.userId,
      role: user.role,
      requestedMax: rateLimitRequest.requestedMax,
      keyId: apiKeyRequest.apiKeyId
    })
    .from(rateLimitRequest)
    .innerJoin(user, eq(user.id, rateLimitRequest.userId))
    .innerJoin(apiKeyRequest, eq(apiKeyRequest.id, rateLimitRequest.apiKeyRequestId))
    .where(eq(rateLimitRequest.id, id));
  if (!request) invalid("This request no longer exists.");
  if (request.userId === staff.id) invalid("Ask another staff member to review your own request.");
  if (roleRank(request.role) >= roleRank(staff.role)) invalid("Only higher-ranked staff can review this request.");

  const reviewed = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(rateLimitRequest)
      .set({
        status: decision === "approve" ? "approved" : "denied",
        reviewNote: note || null,
        reviewedBy: staff.id,
        reviewedAt: new Date()
      })
      .where(and(eq(rateLimitRequest.id, id), eq(rateLimitRequest.status, "pending")))
      .returning({ id: rateLimitRequest.id });
    if (!row) return;
    if (decision === "approve" && request.keyId) {
      // Updated in the same transaction as the review and audit entry; regenerated keys read the approved request.
      await tx.update(apikey).set({ rateLimitMax: request.requestedMax }).where(eq(apikey.id, request.keyId));
    }
    await audit(tx, {
      actorId: staff.id,
      action: decision === "approve" ? "rate_limit.approve" : "rate_limit.deny",
      targetUserId: request.userId,
      targetId: id,
      note,
      details: { requestedMax: request.requestedMax }
    });
    return row;
  });
  if (!reviewed) invalid("Someone already reviewed this request.");
  await Promise.all([requested(listRateLimitRequests, 1).refreshAll(), getOverview().refresh()]);
});
