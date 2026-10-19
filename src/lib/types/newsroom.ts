/** Post categories, in display order. */
export const POST_TYPES = ["announcement", "news", "update", "changelog", "guide", "event"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const BANNER_VARIANTS = ["info", "success", "warning", "critical"] as const;
export type BannerVariant = (typeof BANNER_VARIANTS)[number];

/** An uploaded image; dimensions are measured in the browser before upload. */
export interface MediaImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * The public face of a user: their primary Minecraft account, with their Discord profile on interaction. Never add
 * private fields (email, role, IDs of linked accounts) here; it is sent to every visitor.
 */
export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  discordUsername: string | null;
  minecraft: { uuid: string; username: string } | null;
}

/** A published post as the newsroom renders it. `html` is only set on the post page. */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  type: PostType;
  tags: string[];
  featured: boolean;
  heroImage: MediaImage | null;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  updatedAt: string;
  author: PublicProfile | null;
  html?: string;
}

export interface PostListResponse {
  docs: Post[];
  page: number;
  totalPages: number;
  totalDocs: number;
}

export interface Banner {
  id: string;
  html: string;
  variant: BannerVariant;
  dismissible: boolean;
  startsAt: string | null;
  endsAt: string | null;
}
