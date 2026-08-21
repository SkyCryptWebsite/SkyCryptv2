import "$routes/layout.css";
import type { Block } from "$types";
import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import PostRenderer from "./PostRenderer.svelte";

const richTextBlock = {
  blockType: "richText",
  content: {
    root: {
      type: "root",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1
    }
  },
  html: "<h2>Heading</h2><p>Paragraph with <code>inline code</code>.</p><ul><li>List item</li></ul><pre><code>const value = 1;</code></pre><table><thead><tr><th>Column</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>"
} satisfies Block & { html: string };

const imageBlock = {
  blockType: "image",
  media: {
    id: "image-1",
    alt: "Newsroom image",
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    url: "/newsroom.png",
    width: 800,
    height: 450
  },
  caption: "Image caption"
} satisfies Block;

describe.concurrent("PostRenderer", () => {
  it("applies Typeset to classless newsroom rich content", async ({ expect }) => {
    const { container } = await render(PostRenderer, { body: [richTextBlock, imageBlock] });

    const typeset = container.querySelector(".typeset.typeset-article.max-w-\\[37em\\]");
    const heading = container.querySelector("h2");
    const list = container.querySelector("ul");
    const table = container.querySelector("table");
    const inlineCode = container.querySelector("p code");
    const image = container.querySelector("img");
    const caption = container.querySelector("figcaption");

    expect(typeset).toBeTruthy();
    expect(heading?.getAttribute("class")).toBeNull();
    expect(list?.getAttribute("class")).toBeNull();
    expect(table?.getAttribute("class")).toBeNull();
    expect(inlineCode?.getAttribute("class")).toBeNull();
    expect(Number.parseFloat(getComputedStyle(heading as Element).fontSize)).toBeGreaterThan(16);
    expect(getComputedStyle(list as Element).listStyleType).toBe("disc");
    expect(getComputedStyle(table as Element).borderBottomStyle).toBe("solid");
    expect(getComputedStyle(inlineCode as Element).fontFamily).toContain("Geist Mono Variable");
    expect(image?.classList.contains("border")).toBe(true);
    expect(caption?.classList.contains("italic")).toBe(true);
  });
});
