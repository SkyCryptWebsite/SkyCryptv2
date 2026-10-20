import { command, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { audit, requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { banner } from "#lib/server/db/schema";
import { publish } from "#lib/server/live";
import { getPublicProfiles } from "#lib/server/public-profile";
import { assertValidContent, renderContent } from "#lib/server/rich-text";
import { bannerData } from "#lib/shared/newsroom";

const requireEditor = () => requireStaff({ content: ["manage"] });

export const listBanners = query(async () => {
  await requireEditor();
  const rows = await db.select().from(banner).orderBy(desc(banner.createdAt));
  const profiles = await getPublicProfiles(rows.map((row) => row.createdBy));
  return rows.map((row) => ({
    ...row,
    html: renderContent(row.content),
    author: (row.createdBy && profiles.get(row.createdBy)) || null
  }));
});

export const saveBanner = command(z.object({ id: z.string().nullable(), data: bannerData }), async ({ id, data }) => {
  const { staff } = await requireEditor();
  assertValidContent(data.content, "banner");
  await db.transaction(async (tx) => {
    if (id) {
      const [row] = await tx.update(banner).set(data).where(eq(banner.id, id)).returning({ id: banner.id });
      if (!row) error(404, "Banner not found.");
      await audit(tx, { actorId: staff.id, action: "banner.update", targetId: id });
    } else {
      const newId = crypto.randomUUID();
      await tx.insert(banner).values({ id: newId, ...data, createdBy: staff.id });
      await audit(tx, { actorId: staff.id, action: "banner.create", targetId: newId });
    }
  });
  publish("banners");
  await listBanners().refresh();
});

export const deleteBanner = command(z.string(), async (id) => {
  const { staff } = await requireEditor();
  await db.transaction(async (tx) => {
    const [row] = await tx.delete(banner).where(eq(banner.id, id)).returning({ id: banner.id });
    if (!row) error(404, "Banner not found.");
    await audit(tx, { actorId: staff.id, action: "banner.delete", targetId: id });
  });
  publish("banners");
  await listBanners().refresh();
});
