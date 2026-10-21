import type { Post } from "$types";
import { flushSync, untrack } from "svelte";
import { afterEach, beforeEach, describe, it } from "vitest";
import { NewsroomNotificationsContext } from "./newsroom-notifications.svelte";

const post = (id: string, publishedAt: string | null = `2026-01-${id.padStart(2, "0")}T00:00:00.000Z`): Post => ({
  id,
  title: `Post ${id}`,
  slug: `post-${id}`,
  excerpt: "",
  type: "news",
  tags: [],
  featured: false,
  heroImage: null,
  seoTitle: "",
  seoDescription: "",
  publishedAt,
  author: null,
  updatedAt: publishedAt ?? "2026-01-01T00:00:00.000Z"
});

describe("NewsroomNotificationsContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("marks latest posts as unseen until they are seen", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const posts = [post("1"), post("2")];

      untrack(() => {
        notifications.setLatestPosts(posts);
        expect(notifications.unreadCount).toBe(2);
        expect(notifications.unseenPosts.map((item) => item.id)).toEqual(["2", "1"]);
      });
    });

    cleanup();
  });

  it("markPostSeen removes exactly one post from unread state", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const posts = [post("1"), post("2")];

      untrack(() => {
        notifications.setLatestPosts(posts);
        notifications.markPostSeen(posts[0]);
        flushSync();

        expect(notifications.unreadCount).toBe(1);
        expect(notifications.unseenPosts[0].id).toBe("2");
        expect(notifications.current.seenPostIds).toEqual(["1"]);
      });
    });

    cleanup();
  });

  it("markAllSeen clears all currently tracked posts", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const posts = [post("1"), post("2")];

      untrack(() => {
        notifications.setLatestPosts(posts);
        notifications.markAllSeen();
        flushSync();

        expect(notifications.unreadCount).toBe(0);
        expect(notifications.current.seenPostIds).toEqual(["1", "2"]);
      });
    });

    cleanup();
  });

  it("de-duplicates seen ids", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const item = post("1");

      untrack(() => {
        notifications.markPostSeen(item);
        notifications.markPostSeen(item);
        flushSync();

        expect(notifications.current.seenPostIds).toEqual(["1"]);
      });
    });

    cleanup();
  });

  it("bounds seen ids to 100", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const posts = Array.from({ length: 101 }, (_, index) => post(String(index + 1)));

      untrack(() => {
        notifications.markAllSeen(posts);
        flushSync();

        expect(notifications.current.seenPostIds).toHaveLength(100);
        expect(notifications.current.seenPostIds[0]).toBe("2");
        expect(notifications.current.seenPostIds.at(-1)).toBe("101");
      });
    });

    cleanup();
  });

  it("shows newer posts after previously dismissing current latest posts", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const notifications = new NewsroomNotificationsContext();
      const firstPosts = [post("1"), post("2")];
      const newerPost = post("3", "2026-02-01T00:00:00.000Z");

      untrack(() => {
        notifications.setLatestPosts(firstPosts);
        notifications.markAllSeen();
        notifications.setLatestPosts([newerPost, ...firstPosts]);

        expect(notifications.unreadCount).toBe(1);
        expect(notifications.newestUnseen?.id).toBe("3");
      });
    });

    cleanup();
  });
});
