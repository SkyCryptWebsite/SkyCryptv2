import type { Post } from "$types";
import { PersistedState } from "runed";
import { createContext } from "svelte";

export interface SeenNewsroomPost {
  id: string;
  slug: string;
  publishedAt: string | null;
}

export interface NewsroomNotificationsData {
  seenPostIds: string[];
  lastSeenPublishedAt: string | null;
}

const STORAGE_KEY = "skycryptNewsroomNotifications";
const MAX_SEEN_POST_IDS = 100;

const defaultData = (): NewsroomNotificationsData => ({
  seenPostIds: [],
  lastSeenPublishedAt: null
});

const isValidDate = (value: string | null | undefined): value is string => {
  if (!value) return false;
  return Number.isFinite(Date.parse(value));
};

const newestDate = (current: string | null, next: string | null | undefined): string | null => {
  if (!isValidDate(next)) return current;
  if (!isValidDate(current)) return next;
  return Date.parse(next) > Date.parse(current) ? next : current;
};

const toPostId = (id: unknown): string | null => {
  if (typeof id === "string") return id.length > 0 ? id : null;
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  return null;
};

const sanitizeData = (value: unknown): NewsroomNotificationsData => {
  if (!value || typeof value !== "object") return defaultData();

  const data = value as Partial<NewsroomNotificationsData>;
  const seenPostIds = Array.isArray(data.seenPostIds)
    ? data.seenPostIds.map(toPostId).filter((id): id is string => id !== null)
    : [];
  return {
    seenPostIds: seenPostIds.filter((id, index) => seenPostIds.indexOf(id) === index).slice(-MAX_SEEN_POST_IDS),
    lastSeenPublishedAt: isValidDate(data.lastSeenPublishedAt) ? data.lastSeenPublishedAt : null
  };
};

export class NewsroomNotificationsContext {
  #data = new PersistedState<NewsroomNotificationsData>(STORAGE_KEY, defaultData());
  #latestPosts: Post[] = $state.raw([]);

  get current() {
    return sanitizeData(this.#data.current);
  }

  set current(value: NewsroomNotificationsData) {
    this.#data.current = sanitizeData(value);
  }

  get unseenPosts() {
    return this.getUnseenPosts();
  }

  get unreadCount() {
    return this.unseenPosts.length;
  }

  get newestUnseen() {
    return this.unseenPosts[0] ?? null;
  }

  getUnseenPosts(posts: Post[] = this.#latestPosts) {
    const seen = this.current.seenPostIds;
    return posts
      .filter((post) => {
        const id = toPostId(post.id);
        return id === null || !seen.includes(id);
      })
      .map((post, index) => ({ post, index }))
      .sort((a, b) => {
        const aTime = isValidDate(a.post.publishedAt) ? Date.parse(a.post.publishedAt) : null;
        const bTime = isValidDate(b.post.publishedAt) ? Date.parse(b.post.publishedAt) : null;

        if (aTime !== null && bTime !== null && aTime !== bTime) return bTime - aTime;
        if (aTime !== null && bTime === null) return -1;
        if (aTime === null && bTime !== null) return 1;
        return a.index - b.index;
      })
      .map(({ post }) => post);
  }

  getUnreadCount(posts: Post[] = this.#latestPosts) {
    return this.getUnseenPosts(posts).length;
  }

  getNewestUnseen(posts: Post[] = this.#latestPosts) {
    return this.getUnseenPosts(posts)[0] ?? null;
  }

  setLatestPosts(posts: Post[]) {
    this.#latestPosts = posts;
  }

  markPostSeen(post: Pick<Post, "id" | "slug" | "publishedAt">) {
    const id = toPostId(post.id);
    if (id === null) return;

    const current = this.current;
    const seenPostIds = current.seenPostIds.includes(id) ? current.seenPostIds : [...current.seenPostIds, id];

    this.current = {
      seenPostIds: seenPostIds.slice(-MAX_SEEN_POST_IDS),
      lastSeenPublishedAt: newestDate(current.lastSeenPublishedAt, post.publishedAt)
    };
  }

  markAllSeen(posts: Pick<Post, "id" | "slug" | "publishedAt">[] = this.#latestPosts) {
    let lastSeenPublishedAt = this.current.lastSeenPublishedAt;
    const seenPostIds = [...this.current.seenPostIds];

    for (const post of posts) {
      const id = toPostId(post.id);
      if (id !== null && !seenPostIds.includes(id)) seenPostIds.push(id);
      lastSeenPublishedAt = newestDate(lastSeenPublishedAt, post.publishedAt);
    }

    this.current = {
      seenPostIds: seenPostIds.slice(-MAX_SEEN_POST_IDS),
      lastSeenPublishedAt
    };
  }
}

const [getNewsroomNotifications, setNewsroomNotifications] = createContext<NewsroomNotificationsContext>();

function initNewsroomNotifications() {
  const notifications = new NewsroomNotificationsContext();
  setNewsroomNotifications(notifications);
  return notifications;
}

export { getNewsroomNotifications, initNewsroomNotifications };
