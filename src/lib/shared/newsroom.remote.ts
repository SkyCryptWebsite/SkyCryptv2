import { query } from "$app/server";
import { POST_TYPES } from "$types";
import { z } from "zod";
import { watch } from "#lib/server/live";
import { listActiveBanners, listLatestPosts, listPublishedPosts } from "#lib/server/newsroom";

/** Published posts, paginated, featured first. */
export const listPosts = query(
  z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20),
    type: z.enum(POST_TYPES).optional()
  }),
  (args) => listPublishedPosts(args)
);

/** The latest published posts for the unread toast; updates while the page is open. */
export const listLatestPostsForNotifications = query.live(
  z.object({ limit: z.number().int().min(1).max(10).default(5) }),
  ({ limit }) => watch("posts", () => listLatestPosts(limit), String(limit))
);

/** Site-wide banners; updates while the page is open. */
export const getActiveBanners = query.live(() => watch("banners", listActiveBanners));
