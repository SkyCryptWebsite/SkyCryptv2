import { describe, it } from "vitest";
import { richTextToHtml } from "./rich-text-html";

type TestNode = {
  type: string;
  version: number;
  [key: string]: unknown;
};

const root = (children: TestNode[]) => ({
  root: {
    type: "root",
    children,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1
  }
});

const text = (value: string, format = 0) => ({
  type: "text",
  text: value,
  detail: 0,
  format,
  mode: "normal",
  style: "",
  version: 1
});

const paragraph = (children: TestNode[]): TestNode => ({
  type: "paragraph",
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  version: 1
});

describe.concurrent("richTextToHtml()", () => {
  it("escapes script tags in paragraph text", ({ expect }) => {
    const result = richTextToHtml(root([paragraph([text("<script>alert('xss')</script>")])]));

    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
  });

  it("renders bold and italic formatting", ({ expect }) => {
    const result = richTextToHtml(root([paragraph([text("Styled", 1 | 2)])]));

    expect(result).toContain("<em><strong>Styled</strong></em>");
  });

  it("renders headings", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "heading",
          tag: "h2",
          children: [text("Heading")],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1
        }
      ])
    );

    expect(result).toContain("<h2>Heading</h2>");
  });

  it("renders classless ordered and unordered lists for Typeset", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "list",
          children: [
            { type: "listitem", children: [text("One")], direction: "ltr", format: "", indent: 0, value: 1, version: 1 }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          listType: "number",
          start: 1,
          tag: "ol",
          version: 1
        },
        {
          type: "list",
          children: [
            { type: "listitem", children: [text("Two")], direction: "ltr", format: "", indent: 0, value: 1, version: 1 }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          listType: "bullet",
          start: 1,
          tag: "ul",
          version: 1
        }
      ])
    );

    expect(result).toContain("<ol><li>One</li></ol>");
    expect(result).toContain("<ul><li>Two</li></ul>");
  });

  it("renders checked and unchecked checklist items", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "list",
          children: [
            {
              type: "listitem",
              checked: true,
              children: [text("Done")],
              direction: "ltr",
              format: "",
              indent: 0,
              value: 1,
              version: 1
            },
            {
              type: "listitem",
              checked: false,
              children: [text("Todo")],
              direction: "ltr",
              format: "",
              indent: 0,
              value: 2,
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          listType: "check",
          start: 1,
          tag: "ul",
          version: 1
        }
      ])
    );

    expect(result).toContain('type="checkbox" checked disabled');
    expect(result).toContain('<ul class="contains-task-list">');
    expect(result).toContain('<li class="task-list-item">');
    expect(result).toContain('class="text-muted-foreground line-through"');
    expect(result).toContain('type="checkbox" disabled');
  });

  it("renders new-tab links by default", ({ expect }) => {
    const result = richTextToHtml(
      root([
        paragraph([
          {
            type: "link",
            fields: { url: "https://example.com" },
            children: [text("Example")],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1
          }
        ])
      ])
    );

    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank" rel="noopener noreferrer"');
    expect(result).not.toContain("class=");
  });

  it("renders same-tab links when newTab is false", ({ expect }) => {
    const result = richTextToHtml(
      root([
        paragraph([
          {
            type: "link",
            fields: { newTab: false, url: "/newsroom" },
            children: [text("Newsroom")],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1
          }
        ])
      ])
    );

    expect(result).toContain('href="/newsroom"');
    expect(result).not.toContain('target="_blank"');
  });

  it("neutralizes dangerous link protocols", ({ expect }) => {
    const result = richTextToHtml(
      root([
        paragraph([
          {
            type: "link",
            fields: { url: "javascript:alert(1)" },
            children: [text("Bad")],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1
          }
        ])
      ])
    );

    expect(result).toContain('href="#"');
    expect(result).not.toContain("javascript:alert");
  });

  it("renders upload nodes using card size first", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "upload",
          fields: {},
          relationTo: "media",
          value: {
            id: "media-1",
            alt: "Card image",
            url: "/full.png",
            width: 1600,
            height: 900,
            sizes: { card: { url: "/card.png", width: 800, height: 450 } }
          },
          version: 1
        }
      ])
    );

    expect(result).toContain('src="/card.png"');
    expect(result).toContain('width="800"');
    expect(result).toContain('height="450"');
    expect(result).toContain('class="flex flex-col items-center"');
    expect(result).toContain('class="bg-muted"');
  });

  it("renders upload nodes using media url fallback", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "upload",
          fields: {},
          relationTo: "media",
          value: { id: "media-1", alt: "Full image", url: "/full.png", width: 1600, height: 900 },
          version: 1
        }
      ])
    );

    expect(result).toContain('src="/full.png"');
    expect(result).toContain('alt="Full image"');
  });

  it("renders user relationships with mcUuid as stats links", ({ expect }) => {
    const result = richTextToHtml(
      root([
        {
          type: "relationship",
          relationTo: "users",
          value: { displayName: "Gigi", mcUuid: "uuid-1", name: "gigi" },
          version: 1
        }
      ])
    );

    expect(result).toContain('href="/stats/uuid-1"');
    expect(result).toContain('data-sveltekit-preload-data="hover"');
    expect(result).toContain('class="font-semibold text-primary transition-colors hover:text-accent"');
    expect(result).toContain(">Gigi</a>");
  });

  it("renders user relationships without mcUuid as text", ({ expect }) => {
    const result = richTextToHtml(
      root([{ type: "relationship", relationTo: "users", value: { displayName: "Gigi", name: "gigi" }, version: 1 }])
    );

    expect(result).toContain('<span class="font-semibold">Gigi</span>');
  });

  it("skips unsupported relationships", ({ expect }) => {
    const result = richTextToHtml(
      root([{ type: "relationship", relationTo: "posts", value: { title: "Post" }, version: 1 }])
    );

    expect(result).toBe("");
  });
});
