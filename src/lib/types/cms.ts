import type {
  Media,
  Post as CmsPost,
  PostBodyItem,
  PostListResponseResponse,
  PostType,
  User
} from "$lib/shared/api/cms-generated";

// Type-only re-exports: `cms-generated.ts` pulls in a server-only mutator ($env/dynamic/private),
// so this barrel must never create a runtime import of it (it's consumed by browser components).
export type { Media, PostBodyItem, PostType };

/**
 * Allowed post categories, in display order.
 *
 * This is the one value we can't derive from the generated schema: the runtime enum
 * only exists as a const in `cms-generated.ts`, and importing that value here would
 * pull the server-only mutator ($env/dynamic/private) into the browser bundle. So the
 * list is hand-written but kept honest against the schema — `satisfies` rejects entries
 * that aren't a {@link PostType}, and the assertion below fails to compile if the CMS
 * adds a type that's missing here.
 */
export const POST_TYPES = [
  "announcement",
  "news",
  "update",
  "changelog",
  "guide",
  "event"
] as const satisfies readonly PostType[];

const _postTypesAreExhaustive: Exclude<PostType, (typeof POST_TYPES)[number]> extends never
  ? true
  : ["POST_TYPES is missing a PostType:", Exclude<PostType, (typeof POST_TYPES)[number]>] = true;

/** Payload `users` doc — the public-facing author of a post. */
export type Author = User;

/** The author fields the newsroom UI renders. A string author ID resolves to a minimal placeholder. */
export type AuthorView = Pick<Author, "id" | "name" | "displayName" | "mcUuid">;

/** A single content block, straight from the generated Payload schema. */
export type Block = PostBodyItem;
export type BlockImage = Extract<PostBodyItem, { blockType: "image" }>;
export type BlockRichText = Extract<PostBodyItem, { blockType: "richText" }>;

/**
 * A post as consumed by the UI. Identical to the generated `Post`, but with the
 * relationship fields narrowed to their populated shape — every query runs with
 * `depth >= 1`, so `heroImage`/`author` are always resolved objects, never IDs.
 */
export type Post = Omit<CmsPost, "heroImage" | "author"> & {
  heroImage?: Media | null;
  author: Author | string;
};

/** Paginated list response with {@link Post}-shaped docs. */
export type PostListResponse = Omit<PostListResponseResponse, "docs"> & {
  docs: Post[];
};
