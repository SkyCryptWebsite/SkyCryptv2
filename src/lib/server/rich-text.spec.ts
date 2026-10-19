import { describe, expect, it } from "vitest";
import { assertValidContent, isSafeHref, renderContent } from "./rich-text";

const doc = (...content: object[]) => ({ type: "doc", content });
const text = (value: string, marks?: object[]) => ({ type: "text", text: value, marks });
const link = (href: string) =>
  doc({ type: "paragraph", content: [text("click", [{ type: "link", attrs: { href } }])] });

describe("renderContent", () => {
  it("renders the editor's nodes as HTML", () => {
    const html = renderContent(
      doc(
        { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
        { type: "paragraph", content: [text("Bold", [{ type: "bold" }])] },
        { type: "image", attrs: { src: "https://media.example/a.png", alt: 'A "quote"', title: "Caption" } },
        { type: "callout", attrs: { emoji: "🔥" }, content: [{ type: "paragraph", content: [text("Note")] }] }
      )
    );
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain('<img src="https://media.example/a.png" alt="A &quot;quote&quot;"');
    expect(html).toContain("<figcaption>Caption</figcaption>");
    expect(html).toMatch(/<aside class="callout">.*🔥.*Note/);
  });

  it("drops unsafe links and media", () => {
    expect(renderContent(link("javascript:alert(1)"))).not.toContain("href");
    expect(renderContent(link("/newsroom/post"))).toContain('<a href="/newsroom/post">');
    expect(renderContent(link("https://example.com"))).toContain('rel="noopener noreferrer nofollow"');
    expect(renderContent(doc({ type: "iframe", attrs: { src: "https://evil.example/" } }))).not.toContain("iframe");
    expect(renderContent(doc({ type: "image", attrs: { src: "javascript:alert(1)" } }))).not.toContain("img");
  });

  it("escapes text", () => {
    expect(renderContent(doc({ type: "paragraph", content: [text("<script>")] }))).toContain("&lt;script&gt;");
  });
});

describe("assertValidContent", () => {
  it("accepts valid posts and rejects bad ones", () => {
    expect(() => assertValidContent(link("https://example.com"))).not.toThrow();
    expect(() => assertValidContent(link("javascript:alert(1)"))).toThrow();
    expect(() => assertValidContent(doc({ type: "nope" }))).toThrow();
    expect(() => assertValidContent(doc({ type: "mediaPlaceholder" }))).toThrow();
  });

  it("only allows text and links in banners", () => {
    expect(() => assertValidContent(link("/newsroom"), "banner")).not.toThrow();
    expect(() => assertValidContent(doc({ type: "heading", attrs: { level: 1 } }), "banner")).toThrow();
  });

  it("allows site paths and anchors but not protocol-relative links", () => {
    expect(isSafeHref("//evil.example")).toBe(false);
    expect(isSafeHref("#section")).toBe(true);
    expect(isSafeHref("mailto:team@example.com")).toBe(true);
  });
});
