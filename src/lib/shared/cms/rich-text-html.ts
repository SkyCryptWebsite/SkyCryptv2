import type { BlockRichText, Media } from "$types";
import { convertLexicalToHTML, type HTMLConvertersFunction } from "@payloadcms/richtext-lexical/html";
import type { DefaultNodeTypes } from "@payloadcms/richtext-lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";

type JsonRecord = Record<string, unknown>;
type RichTextContent = BlockRichText["content"];
type NewsroomNodeTypes = DefaultNodeTypes | NewsroomLinkNode | NewsroomRelationshipNode | NewsroomUploadNode;

type NewsroomLinkNode = {
  type: "autolink" | "link";
  children?: SerializedLexicalNode[];
  fields?: {
    newTab?: boolean | null;
    url?: string | null;
  } | null;
  url?: string | null;
};

type NewsroomRelationshipNode = {
  type: "relationship";
  relationTo?: string;
  value?: unknown;
};

type NewsroomUploadNode = {
  type: "upload";
  fields?: {
    alt?: string | null;
  } | null;
  value?: unknown;
};

type UserRelationship = {
  displayName?: string | null;
  mcUuid?: string | null;
  name?: string | null;
};

const linkClass = "text-primary underline underline-offset-2 transition-colors hover:text-hover";
const userRelationshipClass = "font-semibold text-primary underline underline-offset-2 transition-colors hover:text-hover";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value);
}

function sanitizeHref(value: unknown, fallback = "#"): string {
  const href = typeof value === "string" ? value.trim() : "";
  if (!href) return fallback;
  if (href.startsWith("#") || href.startsWith("?") || href.startsWith("./") || href.startsWith("../")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? href : fallback;
  } catch {
    return fallback;
  }
}

function getLinkUrl(node: NewsroomLinkNode): string {
  return sanitizeHref(node.fields?.url ?? node.url ?? "#");
}

function getLinkNewTab(node: NewsroomLinkNode): boolean {
  return node.fields?.newTab !== false;
}

function getMedia(node: NewsroomUploadNode): Media | undefined {
  return isRecord(node.value) ? (node.value as unknown as Media) : undefined;
}

function getUser(node: NewsroomRelationshipNode): UserRelationship | null {
  return node.relationTo === "users" && isRecord(node.value) ? (node.value as UserRelationship) : null;
}

function richTextConverters(): HTMLConvertersFunction<NewsroomNodeTypes> {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    autolink: ({ node, nodesToHTML, providedStyleTag }) => {
      const newsroomNode = node as NewsroomLinkNode;
      const children = nodesToHTML({ nodes: newsroomNode.children ?? [] }).join("");
      const href = escapeAttribute(getLinkUrl(newsroomNode));
      const newTab = getLinkNewTab(newsroomNode);
      return `<a${providedStyleTag} href="${href}" class="${linkClass}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
    },
    link: ({ node, nodesToHTML, providedStyleTag }) => {
      const newsroomNode = node as NewsroomLinkNode;
      const children = nodesToHTML({ nodes: newsroomNode.children ?? [] }).join("");
      const href = escapeAttribute(getLinkUrl(newsroomNode));
      const newTab = getLinkNewTab(newsroomNode);
      return `<a${providedStyleTag} href="${href}" class="${linkClass}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
    },
    list: ({ node, nodesToHTML }) => {
      const ordered = node.listType === "number";
      const check = node.listType === "check";
      const tag = ordered ? "ol" : "ul";
      const className = check ? "my-3 ml-1 list-none space-y-1" : ordered ? "my-3 ml-6 list-decimal space-y-1" : "my-3 ml-6 list-disc space-y-1";
      const children = nodesToHTML({ nodes: node.children }).join("");
      return `<${tag} class="${className}">${children}</${tag}>`;
    },
    listitem: ({ node, nodesToHTML, parent }) => {
      const children = nodesToHTML({ nodes: node.children }).join("");
      if (isRecord(parent as unknown) && (parent as unknown as JsonRecord).listType === "check") {
        const checked = node.checked === true;
        return `<li class="flex items-start gap-2 leading-7"><input type="checkbox"${checked ? " checked" : ""} disabled class="mt-1.5 size-3.5 shrink-0 accent-primary" /><span class="${checked ? "text-text/60 line-through" : ""}">${children}</span></li>`;
      }
      return `<li class="leading-7">${children}</li>`;
    },
    relationship: ({ node, providedStyleTag }) => {
      const user = getUser(node as NewsroomRelationshipNode);
      const name = user?.displayName?.trim() || user?.name || "";
      if (!user || !name) return "";
      const label = escapeHtml(name);
      if (!user.mcUuid) return `<span${providedStyleTag} class="font-semibold text-text">${label}</span>`;
      const href = escapeAttribute(`/stats/${encodeURIComponent(user.mcUuid)}`);
      return `<a${providedStyleTag} href="${href}" data-sveltekit-preload-data="hover" class="${userRelationshipClass}">${label}</a>`;
    },
    upload: ({ node, providedStyleTag }) => {
      const newsroomNode = node as NewsroomUploadNode;
      const media = getMedia(newsroomNode);
      const src = media?.sizes?.card?.url ?? media?.url ?? "";
      if (!src) return "";

      const width = media?.sizes?.card?.width ?? media?.width ?? undefined;
      const height = media?.sizes?.card?.height ?? media?.height ?? undefined;
      const alt = newsroomNode.fields?.alt ?? media?.alt ?? "";
      const widthAttribute = width ? ` width="${escapeAttribute(width)}"` : "";
      const heightAttribute = height ? ` height="${escapeAttribute(height)}"` : "";

      return `<figure${providedStyleTag} class="my-6 flex flex-col items-center gap-2"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${widthAttribute}${heightAttribute} loading="lazy" class="h-auto max-w-full rounded-lg bg-background-grey" /></figure>`;
    }
  });
}

export function richTextToHtml(content: RichTextContent | null | undefined): string {
  if (!content?.root?.children?.length) return "";

  try {
    return convertLexicalToHTML({
      converters: richTextConverters(),
      data: content as SerializedEditorState,
      disableContainer: true
    });
  } catch {
    return "";
  }
}
