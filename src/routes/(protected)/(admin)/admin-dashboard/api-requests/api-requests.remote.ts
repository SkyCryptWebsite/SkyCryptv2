import { form, query, requested } from "$app/server";
import { invalid } from "@sveltejs/kit";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { audit, requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { apikey, apiKeyRequest, user } from "#lib/server/db/schema";
import { listArgs, reviewSchema } from "#lib/shared/admin";
import { roleRank } from "#lib/shared/roles";
import { getOverview } from "../admin.remote";

const reviewer = alias(user, "reviewer");

export const listApiRequests = query(
  listArgs.extend({ status: z.enum(["pending", "approved", "denied", "revoked", "all"]).default("pending") }),
  async ({ page, size, q, status }) => {
    await requireStaff({ user: ["list"] });
    const filters: (SQL | undefined)[] = [
      status === "all" ? undefined : eq(apiKeyRequest.status, status),
      q ? or(ilike(apiKeyRequest.name, `%${q}%`), ilike(user.name, `%${q}%`)) : undefined
    ];
    const where = and(...filters);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: apiKeyRequest.id,
          name: apiKeyRequest.name,
          useCase: apiKeyRequest.useCase,
          description: apiKeyRequest.description,
          url: apiKeyRequest.url,
          status: apiKeyRequest.status,
          reviewNote: apiKeyRequest.reviewNote,
          createdAt: apiKeyRequest.createdAt,
          reviewedAt: apiKeyRequest.reviewedAt,
          reviewerName: reviewer.name,
          keyEnabled: apikey.enabled,
          user: { id: user.id, name: user.name, image: user.image, createdAt: user.createdAt }
        })
        .from(apiKeyRequest)
        .innerJoin(user, eq(user.id, apiKeyRequest.userId))
        .leftJoin(reviewer, eq(reviewer.id, apiKeyRequest.reviewedBy))
        .leftJoin(apikey, eq(apikey.id, apiKeyRequest.apiKeyId))
        .where(where)
        // The pending queue is first come, first served; history shows the newest first.
        .orderBy(status === "pending" ? asc(apiKeyRequest.createdAt) : desc(apiKeyRequest.createdAt))
        .limit(size)
        .offset((page - 1) * size),
      db.select({ total: count() }).from(apiKeyRequest).innerJoin(user, eq(user.id, apiKeyRequest.userId)).where(where)
    ]);
    return { total, rows };
  }
);

export const reviewApiRequest = form(reviewSchema, async ({ id, decision, note }) => {
  const { staff } = await requireStaff({ apiAccess: ["review"] });
  const [request] = await db
    .select({ userId: apiKeyRequest.userId, role: user.role })
    .from(apiKeyRequest)
    .innerJoin(user, eq(user.id, apiKeyRequest.userId))
    .where(eq(apiKeyRequest.id, id));
  if (!request) invalid("This request no longer exists.");
  if (request.userId === staff.id) invalid("Ask another staff member to review your own request.");
  if (roleRank(request.role) >= roleRank(staff.role)) invalid("Only higher-ranked staff can review this request.");

  const reviewed = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(apiKeyRequest)
      .set({
        status: decision === "approve" ? "approved" : "denied",
        reviewNote: note || null,
        reviewedBy: staff.id,
        reviewedAt: new Date()
      })
      // Only pending requests can be reviewed, so two staff members can't both decide.
      .where(and(eq(apiKeyRequest.id, id), eq(apiKeyRequest.status, "pending")))
      .returning({ id: apiKeyRequest.id });
    if (row) {
      await audit(tx, {
        actorId: staff.id,
        action: decision === "approve" ? "api_request.approve" : "api_request.deny",
        targetUserId: request.userId,
        targetId: id,
        note
      });
    }
    return row;
  });
  if (!reviewed) invalid("Someone already reviewed this request.");
  await Promise.all([requested(listApiRequests, 1).refreshAll(), getOverview().refresh()]);
});
