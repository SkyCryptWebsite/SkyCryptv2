import { describe, it } from "vitest";
import { BASE_FORMATTING_CODE_REGEX, htmlStringFormatting, randomRange } from "./utils";

describe.concurrent("htmlStringFormatting() - HTML entity escaping", () => {
  it("escapes ampersand", ({ expect }) => {
    expect(htmlStringFormatting("Hello & World")).toBe("Hello\u00A0&amp;\u00A0World");
  });

  it("escapes single quotes", ({ expect }) => {
    expect(htmlStringFormatting("It's working")).toBe("It&#39;s\u00A0working");
  });

  it("converts newlines to br tags", ({ expect }) => {
    expect(htmlStringFormatting("Line 1\nLine 2")).toBe("Line\u00A01<br/>Line\u00A02");
  });

  it("replaces spaces with non-breaking spaces", ({ expect }) => {
    expect(htmlStringFormatting("Hello World")).toBe("Hello\u00A0World");
  });

  it("handles combined HTML entities", ({ expect }) => {
    expect(htmlStringFormatting("&<>\"'test")).toBe("&amp;&lt;&gt;&quot;&#39;test");
  });

  it("handles combined entities and special characters", ({ expect }) => {
    expect(htmlStringFormatting('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("handles newlines with HTML entities", ({ expect }) => {
    expect(htmlStringFormatting("<div>\nContent\n</div>")).toBe("&lt;div&gt;<br/>Content<br/>&lt;/div&gt;");
  });

  it("handles empty string", ({ expect }) => {
    expect(htmlStringFormatting("")).toBe("");
  });

  it("handles null-ish values", ({ expect }) => {
    // @ts-expect-error Testing runtime behavior
    expect(htmlStringFormatting(null)).toBe("");
    // @ts-expect-error Testing runtime behavior
    expect(htmlStringFormatting(undefined)).toBe("");
  });

  it("handles non-string values", ({ expect }) => {
    // @ts-expect-error Testing runtime behavior
    expect(htmlStringFormatting(123)).toBe("");
    // @ts-expect-error Testing runtime behavior
    expect(htmlStringFormatting({})).toBe("");
  });

  it("preserves already encoded entities (does not double-encode)", ({ expect }) => {
    expect(htmlStringFormatting("&amp;")).toBe("&amp;");
    expect(htmlStringFormatting("&lt;")).toBe("&lt;");
    expect(htmlStringFormatting("&gt;")).toBe("&gt;");
    expect(htmlStringFormatting("&quot;")).toBe("&quot;");
    expect(htmlStringFormatting("&#39;")).toBe("&#39;");
  });

  it("handles mixed encoded and unencoded content", ({ expect }) => {
    expect(htmlStringFormatting("&amp; & <")).toBe("&amp;\u00A0&amp;\u00A0&lt;");
  });

  it("handles complex real-world Minecraft text", ({ expect }) => {
    expect(htmlStringFormatting("§aGreen §lBold & <script>")).toBe(
      "§aGreen\u00A0§lBold\u00A0&amp;\u00A0&lt;script&gt;"
    );
  });

  it("handles mixed quotes", ({ expect }) => {
    expect(htmlStringFormatting(`"It's 'quoted'"`)).toBe("&quot;It&#39;s\u00A0&#39;quoted&#39;&quot;");
  });
});

describe.concurrent("randomRange() - Random number generation", () => {
  it("handles min equals max", ({ expect }) => {
    expect(randomRange(5, 5)).toBe(5);
  });

  it("statistical test - includes boundary values", ({ expect }) => {
    const min = 1;
    const max = 3;
    const iterations = 100;
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      results.push(randomRange(min, max));
    }

    const uniqueValues = new Set(results);
    expect(uniqueValues.has(min)).toBe(true);
    expect(uniqueValues.has(max)).toBe(true);
  });
});

describe.concurrent("BASE_FORMATTING_CODE_REGEX - Minecraft formatting code matching", () => {
  it("matches uppercase color codes (A-F)", ({ expect }) => {
    const codes = ["§A", "§B", "§C", "§D", "§E", "§F"];
    codes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe(code);
    });
  });

  it("does not match invalid codes", ({ expect }) => {
    const invalidCodes = ["§g", "§h", "§i", "§j", "§p", "§q", "§s", "§t", "§u", "§v", "§w", "§x", "§y", "§z"];
    invalidCodes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).toBeNull();
    });
  });

  it("handles mixed valid and invalid codes", ({ expect }) => {
    const text = "§aValid §gInvalid §lValid §zInvalid";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(2);
    expect(matches).toEqual(["§a", "§l"]);
  });
});
