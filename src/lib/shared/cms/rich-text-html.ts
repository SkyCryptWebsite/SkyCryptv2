import type { BlockRichText, Media } from "$types";
import type { DefaultNodeTypes } from "@payloadcms/richtext-lexical";
import { convertLexicalToHTML, type HTMLConvertersFunction } from "@payloadcms/richtext-lexical/html";
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

const userRelationshipClass = "font-semibold text-primary transition-colors hover:text-accent";

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
      return `<a${providedStyleTag} href="${href}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
    },
    link: ({ node, nodesToHTML, providedStyleTag }) => {
      const newsroomNode = node as NewsroomLinkNode;
      const children = nodesToHTML({ nodes: newsroomNode.children ?? [] }).join("");
      const href = escapeAttribute(getLinkUrl(newsroomNode));
      const newTab = getLinkNewTab(newsroomNode);
      return `<a${providedStyleTag} href="${href}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
    },
    list: ({ node, nodesToHTML }) => {
      const ordered = node.listType === "number";
      const check = node.listType === "check";
      const tag = ordered ? "ol" : "ul";
      const children = nodesToHTML({ nodes: node.children }).join("");
      return `<${tag}${check ? ' class="contains-task-list"' : ""}>${children}</${tag}>`;
    },
    listitem: ({ node, nodesToHTML, parent }) => {
      const children = nodesToHTML({ nodes: node.children }).join("");
      if (isRecord(parent as unknown) && (parent as unknown as JsonRecord).listType === "check") {
        const checked = node.checked === true;
        return `<li class="task-list-item"><input type="checkbox"${checked ? " checked" : ""} disabled /><span${checked ? ' class="text-foreground/60 line-through"' : ""}>${children}</span></li>`;
      }
      return `<li>${children}</li>`;
    },
    relationship: ({ node, providedStyleTag }) => {
      const user = getUser(node as NewsroomRelationshipNode);
      const name = user?.displayName?.trim() || user?.name || "";
      if (!user || !name) return "";
      const label = escapeHtml(name);
      if (!user.mcUuid) return `<span${providedStyleTag} class="font-semibold">${label}</span>`;
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

      return `<figure${providedStyleTag} class="flex flex-col items-center"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${widthAttribute}${heightAttribute} loading="lazy" class="bg-muted" /></figure>`;
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
