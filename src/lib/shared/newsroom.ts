import { BANNER_VARIANTS, POST_TYPES } from "$types";
import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

/** Matches the Payload slugs the existing posts were published under. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/** Tiptap document JSON; the server checks it against the editor schema before saving. */
export const tiptapDoc = z.custom<JSONContent>(
  (value) => typeof value === "object" && value !== null && (value as JSONContent).type === "doc",
  "Invalid document."
);

const mediaImage = z.object({
  url: z.url({ protocol: /^https?$/ }),
  alt: z.string().trim().max(300),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

/** Everything an editor can change on a post. */
export const postData = z.object({
  title: z.string().trim().max(200),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  excerpt: z.string().trim().max(280, "Keep the excerpt under 280 characters."),
  type: z.enum(POST_TYPES),
  tags: z.array(z.string().trim().min(1).max(32)).max(10, "Use at most 10 tags."),
  featured: z.boolean(),
  heroImage: mediaImage.nullable(),
  content: tiptapDoc,
  seoTitle: z.string().trim().max(70, "Keep the SEO title under 70 characters."),
  seoDescription: z.string().trim().max(160, "Keep the SEO description under 160 characters.")
});

export type PostData = z.infer<typeof postData>;

export const bannerData = z
  .object({
    content: tiptapDoc,
    variant: z.enum(BANNER_VARIANTS),
    dismissible: z.boolean(),
    enabled: z.boolean(),
    startsAt: z.date().nullable(),
    endsAt: z.date().nullable()
  })
  .refine(({ startsAt, endsAt }) => !startsAt || !endsAt || endsAt > startsAt, {
    message: "The end has to be after the start.",
    path: ["endsAt"]
  });

export type BannerData = z.infer<typeof bannerData>;

export const POST_FILTERS = ["all", "draft", "scheduled", "published"] as const;

/** Upload limits, in bytes. R2 enforces the signed size, so these are the real caps. */
export const UPLOAD_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024
} as const;

export const UPLOAD_TYPES: Record<string, { ext: string; kind: keyof typeof UPLOAD_LIMITS }> = {
  "image/png": { ext: "png", kind: "image" },
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" },
  "image/gif": { ext: "gif", kind: "image" },
  "image/avif": { ext: "avif", kind: "image" },
  "video/mp4": { ext: "mp4", kind: "video" },
  "video/webm": { ext: "webm", kind: "video" },
  "audio/mpeg": { ext: "mp3", kind: "audio" },
  "audio/ogg": { ext: "ogg", kind: "audio" },
  "audio/wav": { ext: "wav", kind: "audio" }
};
