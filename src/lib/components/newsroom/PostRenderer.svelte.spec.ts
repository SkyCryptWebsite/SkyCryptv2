import "$routes/layout.css";
import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import PostRenderer from "./PostRenderer.svelte";

// Matches what renderContent produces for the editor's nodes.
const html =
  '<h2>Heading</h2><p>Paragraph with <code>inline code</code>.</p><ul class="list-disc"><li><p>List item</p></li></ul><pre><code>const value = 1;</code></pre><table><tbody><tr><th>Column</th></tr><tr><td>Value</td></tr></tbody></table><figure><img src="/newsroom.png" alt="Newsroom image" /><figcaption>Image caption</figcaption></figure>';

describe.concurrent("PostRenderer", () => {
  it("applies Typeset to rendered newsroom content", async ({ expect }) => {
    const { container } = await render(PostRenderer, { html });

    const heading = container.querySelector(".typeset.typeset-article h2");
    const list = container.querySelector("ul");
    const table = container.querySelector("table");
    const inlineCode = container.querySelector("p code");

    expect(heading).toBeTruthy();
    expect(Number.parseFloat(getComputedStyle(heading as Element).fontSize)).toBeGreaterThan(16);
    expect(getComputedStyle(list as Element).listStyleType).toBe("disc");
    expect(getComputedStyle(table as Element).borderBottomStyle).toBe("solid");
    expect(getComputedStyle(inlineCode as Element).fontFamily).toContain("Geist Mono Variable");
    expect(container.querySelector("figcaption")?.textContent).toBe("Image caption");
  });
});
