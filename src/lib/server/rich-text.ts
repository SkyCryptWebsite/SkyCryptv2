import { error } from "@sveltejs/kit";
import { getSchema, type JSONContent } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { log } from "evlog";
import { getContentExtensions } from "#lib/components/edra/extensions";

const extensions = getContentExtensions();
const schema = getSchema(extensions);

/** Hosts whose players may be embedded in posts. Keep `frame-src` in vite.config.ts in sync. */
const EMBED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "streamable.com",
  "open.spotify.com"
]);

/** Banners are one or two lines, so they only get inline formatting and links. */
const BANNER_NODES = new Set(["doc", "paragraph", "text", "hardBreak"]);
const BANNER_MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

const parse = (url: unknown) => {
  if (typeof url !== "string") return null;
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/** Site-relative paths, anchors, and http(s) or mailto links. */
export const isSafeHref = (href: unknown) =>
  typeof href === "string" &&
  (/^\/(?!\/)/.test(href) ||
    href.startsWith("#") ||
    ["http:", "https:", "mailto:"].includes(parse(href)?.protocol ?? ""));

const isSafeSrc = (type: string, src: unknown) => {
  const url = parse(src);
  if (url?.protocol !== "https:") return false;
  return type !== "iframe" || EMBED_HOSTS.has(url.hostname);
};

const MEDIA_NODES = new Set(["image", "video", "audio", "iframe"]);

/** The first problem with a node tree, if any. */
function findProblem(node: JSONContent, kind: "post" | "banner"): string | null {
  const type = node.type ?? "";
  if (kind === "banner" && !BANNER_NODES.has(type)) return "Banners can only contain text and links.";
  if (MEDIA_NODES.has(type) && !isSafeSrc(type, node.attrs?.src)) {
    return type === "iframe"
      ? `Embeds must be https links from ${[...EMBED_HOSTS].join(", ")}.`
      : "Media must be an https link.";
  }
  for (const mark of node.marks ?? []) {
    if (kind === "banner" && !BANNER_MARKS.has(mark.type)) return "Banners can only use simple text formatting.";
    if (mark.type === "link" && !isSafeHref(mark.attrs?.href)) return "Links must be http(s), mailto or a site path.";
  }
  for (const child of node.content ?? []) {
    const problem = findProblem(child, kind);
    if (problem) return problem;
  }
  return null;
}

/** Rejects documents the schema or the URL rules don't allow. Run before every save. */
export function assertValidContent(doc: unknown, kind: "post" | "banner" = "post") {
  try {
    Node.fromJSON(schema, doc).check();
  } catch {
    error(400, "The content doesn’t match the editor format. Reload the editor and try again.");
  }
  const problem = findProblem(doc as JSONContent, kind);
  if (problem) error(400, problem);
}

/** Drops unsafe links and media, in case stored content predates a rule. */
function sanitize(node: JSONContent): JSONContent | null {
  if (MEDIA_NODES.has(node.type ?? "") && !isSafeSrc(node.type ?? "", node.attrs?.src)) return null;
  return {
    ...node,
    marks: node.marks?.filter((mark) => mark.type !== "link" || isSafeHref(mark.attrs?.href)),
    content: node.content?.map(sanitize).filter((child): child is JSONContent => child !== null)
  };
}

const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char
  );

const join = (children: string | string[] | undefined) =>
  Array.isArray(children) ? children.join("") : (children ?? "");

/** Server-side HTML for stored editor content; public pages never load the editor. */
export function renderContent(doc: JSONContent) {
  const content = sanitize(doc);
  if (!content) return "";
  try {
    return renderToHTMLString({
      extensions,
      content,
      options: {
        nodeMapping: {
          image: ({ node }) =>
            `<figure><img src="${escape(node.attrs.src)}" alt="${escape(node.attrs.alt)}" loading="lazy" />${
              node.attrs.title ? `<figcaption>${escape(node.attrs.title)}</figcaption>` : ""
            }</figure>`,
          video: ({ node }) => `<video src="${escape(node.attrs.src)}" controls preload="metadata"></video>`,
          audio: ({ node }) => `<audio src="${escape(node.attrs.src)}" controls preload="metadata"></audio>`,
          iframe: ({ node }) =>
            `<div class="embed"><iframe src="${escape(node.attrs.src)}" title="${escape(node.attrs.title || "Embedded content")}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe></div>`,
          callout: ({ node, children }) =>
            `<aside class="callout"><span class="callout-emoji" aria-hidden="true">${escape(node.attrs.emoji)}</span><div>${join(children)}</div></aside>`
        },
        markMapping: {
          link: ({ mark, children }) => {
            const href = String(mark.attrs.href);
            const external = !href.startsWith("/") && !href.startsWith("#");
            return `<a href="${escape(href)}"${external ? ' target="_blank" rel="noopener noreferrer nofollow"' : ""}>${join(children)}</a>`;
          }
        }
      }
    });
  } catch (cause) {
    log.error({ action: "content.render_failed", error: cause });
    return "";
  }
}
