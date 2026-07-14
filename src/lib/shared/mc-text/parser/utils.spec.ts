import { describe, it } from "vitest";
import { BASE_FORMATTING_CODE_REGEX, htmlStringFormatting, randomRange } from "./utils";

describe.concurrent("htmlStringFormatting() - HTML entity escaping", () => {
  it("escapes ampersand", ({ expect }) => {
    expect(htmlStringFormatting("Hello & World")).toBe("Hello\u00A0&amp;\u00A0World");
  });

  it("escapes less than", ({ expect }) => {
    expect(htmlStringFormatting("a < b")).toBe("a\u00A0&lt;\u00A0b");
  });

  it("escapes greater than", ({ expect }) => {
    expect(htmlStringFormatting("a > b")).toBe("a\u00A0&gt;\u00A0b");
  });

  it("escapes double quotes", ({ expect }) => {
    expect(htmlStringFormatting('Say "Hello"')).toBe("Say\u00A0&quot;Hello&quot;");
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

  it("handles spaces with HTML entities", ({ expect }) => {
    expect(htmlStringFormatting("Hello <world> & everyone")).toBe("Hello\u00A0&lt;world&gt;\u00A0&amp;\u00A0everyone");
  });

  it("handles empty string", ({ expect }) => {
    expect(htmlStringFormatting("")).toBe("");
  });

  it("handles string with only spaces", ({ expect }) => {
    expect(htmlStringFormatting("   ")).toBe("\u00A0\u00A0\u00A0");
  });

  it("handles string with only newlines", ({ expect }) => {
    expect(htmlStringFormatting("\n\n\n")).toBe("<br/><br/><br/>");
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

  it("handles numeric HTML entities", ({ expect }) => {
    expect(htmlStringFormatting("&#39;")).toBe("&#39;");
    expect(htmlStringFormatting("&#x27;")).toBe("&#x27;");
  });

  it("handles mixed encoded and unencoded content", ({ expect }) => {
    expect(htmlStringFormatting("&amp; & <")).toBe("&amp;\u00A0&amp;\u00A0&lt;");
  });

  it("handles multiple consecutive special characters", ({ expect }) => {
    expect(htmlStringFormatting("&&&")).toBe("&amp;&amp;&amp;");
    expect(htmlStringFormatting("<<<")).toBe("&lt;&lt;&lt;");
    expect(htmlStringFormatting(">>>")).toBe("&gt;&gt;&gt;");
  });

  it("handles complex real-world Minecraft text", ({ expect }) => {
    expect(htmlStringFormatting("§aGreen §lBold & <script>")).toBe(
      "§aGreen\u00A0§lBold\u00A0&amp;\u00A0&lt;script&gt;"
    );
  });

  it("handles strikethrough with spaces", ({ expect }) => {
    expect(htmlStringFormatting("Strike through")).toBe("Strike\u00A0through");
  });

  it("handles empty tags", ({ expect }) => {
    expect(htmlStringFormatting("<>")).toBe("&lt;&gt;");
  });

  it("handles mixed quotes", ({ expect }) => {
    expect(htmlStringFormatting(`"It's 'quoted'"`)).toBe("&quot;It&#39;s\u00A0&#39;quoted&#39;&quot;");
  });
});

describe.concurrent("randomRange() - Random number generation", () => {
  it("returns a number within range", ({ expect }) => {
    const result = randomRange(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
  });

  it("handles min equals max", ({ expect }) => {
    expect(randomRange(5, 5)).toBe(5);
  });

  it("returns integer values", ({ expect }) => {
    const result = randomRange(1, 10);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("handles negative range", ({ expect }) => {
    const result = randomRange(-10, -1);
    expect(result).toBeGreaterThanOrEqual(-10);
    expect(result).toBeLessThanOrEqual(-1);
  });

  it("handles range crossing zero", ({ expect }) => {
    const result = randomRange(-5, 5);
    expect(result).toBeGreaterThanOrEqual(-5);
    expect(result).toBeLessThanOrEqual(5);
  });

  it("handles range with zero as min", ({ expect }) => {
    const result = randomRange(0, 10);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(10);
  });

  it("handles range with zero as max", ({ expect }) => {
    const result = randomRange(-10, 0);
    expect(result).toBeGreaterThanOrEqual(-10);
    expect(result).toBeLessThanOrEqual(0);
  });

  it("statistical test - all values in range over multiple iterations", ({ expect }) => {
    const min = 1;
    const max = 10;
    const iterations = 100;
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = randomRange(min, max);
      results.push(result);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }

    const uniqueValues = new Set(results);
    expect(uniqueValues.size).toBeGreaterThan(1);
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

  it("handles large range", ({ expect }) => {
    const result = randomRange(1, 1000000);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(1000000);
  });

  it("handles single value range (0, 0)", ({ expect }) => {
    expect(randomRange(0, 0)).toBe(0);
  });
});

describe.concurrent("BASE_FORMATTING_CODE_REGEX - Minecraft formatting code matching", () => {
  it("matches color codes (0-9, a-f)", ({ expect }) => {
    const codes = ["§0", "§1", "§2", "§3", "§4", "§5", "§6", "§7", "§8", "§9", "§a", "§b", "§c", "§d", "§e", "§f"];
    codes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe(code);
    });
  });

  it("matches uppercase color codes (A-F)", ({ expect }) => {
    const codes = ["§A", "§B", "§C", "§D", "§E", "§F"];
    codes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe(code);
    });
  });

  it("matches formatting codes (k, l, m, n, o, r)", ({ expect }) => {
    const codes = ["§k", "§l", "§m", "§n", "§o", "§r"];
    codes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe(code);
    });
  });

  it("matches uppercase formatting codes (K, L, M, N, O, R)", ({ expect }) => {
    const codes = ["§K", "§L", "§M", "§N", "§O", "§R"];
    codes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe(code);
    });
  });

  it("matches multiple codes in a string", ({ expect }) => {
    const text = "§aGreen §lBold §9Blue";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(3);
    expect(matches).toEqual(["§a", "§l", "§9"]);
  });

  it("does not match invalid codes", ({ expect }) => {
    const invalidCodes = ["§g", "§h", "§i", "§j", "§p", "§q", "§s", "§t", "§u", "§v", "§w", "§x", "§y", "§z"];
    invalidCodes.forEach((code) => {
      const matches = code.match(BASE_FORMATTING_CODE_REGEX);
      expect(matches).toBeNull();
    });
  });

  it("does not match § without valid code", ({ expect }) => {
    const text = "§";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).toBeNull();
  });

  it("does not match § with space", ({ expect }) => {
    const text = "§ ";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).toBeNull();
  });

  it("does not match § with special character", ({ expect }) => {
    const text = "§!";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).toBeNull();
  });

  it("matches consecutive codes", ({ expect }) => {
    const text = "§a§l§n";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(3);
    expect(matches).toEqual(["§a", "§l", "§n"]);
  });

  it("matches codes with text in between", ({ expect }) => {
    const text = "§aGreen§bBlue§cRed";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(3);
    expect(matches).toEqual(["§a", "§b", "§c"]);
  });

  it("handles empty string", ({ expect }) => {
    const matches = "".match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).toBeNull();
  });

  it("handles string without any codes", ({ expect }) => {
    const matches = "Plain text without codes".match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).toBeNull();
  });

  it("matches all valid codes in comprehensive test", ({ expect }) => {
    const text = "§0§1§2§3§4§5§6§7§8§9§a§b§c§d§e§f§A§B§C§D§E§F§k§l§m§n§o§r§K§L§M§N§O§R";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(34);
  });

  it("handles mixed valid and invalid codes", ({ expect }) => {
    const text = "§aValid §gInvalid §lValid §zInvalid";
    const matches = text.match(BASE_FORMATTING_CODE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches).toHaveLength(2);
    expect(matches).toEqual(["§a", "§l"]);
  });
});
