import { describe, it, vi } from "vitest";
import { mcTextToHTML } from "#lib/shared/mc-text";
import { colorCodes, extras } from "#lib/shared/mc-text/parser/styleLibrary";

vi.mock("$ctx", () => ({
  getEnchantmentsContext: () => ({ current: ["Aqua Affinity I"] })
}));

function sortedClasses(element: Element): string[] {
  return Array.from(element.classList).sort();
}

describe.concurrent("Minecraft Text Parser Tests", () => {
  it("check the color codes", ({ expect }) => {
    Object.entries(colorCodes).forEach(([code, cssVar]) => {
      const result = mcTextToHTML({ mcString: `${code}Test`, breakLine: false });
      expect(result).toContain(`style="color: ${cssVar};"`);
    });
  });

  describe.concurrent("check the formatting codes", () => {
    Object.entries(extras).forEach(([code, classes]) => {
      it(`Testing code ${code} with classes ${classes.join(", ")}`, ({ expect, annotate }) => {
        const result = mcTextToHTML({ mcString: `${code}Test`, breakLine: false });
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(result, "text/html");
        const span = doc.querySelector("span");
        annotate(`Testing code ${code} with classes ${classes.join(", ")}, got result: ${result}`);
        expect(span ? sortedClasses(span) : []).toEqual([...classes].sort());
      });
    });
  });

  describe.concurrent("check combined color and formatting codes", () => {
    const domParser = new DOMParser();
    it("check color codes reset format codes", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§5§kObfuscated§5 Not-Obfuscated §kObfuscated", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(3);
      expect(sortedClasses(spans[0])).toEqual([...extras["§k"]].sort());
      expect(spans[0].textContent).toBe("Obfuscated");
      expect(spans[1].classList.length).toBe(0);
      expect(spans[1].textContent).toBe("\u00A0Not-Obfuscated\u00A0");
      expect(sortedClasses(spans[2])).toEqual([...extras["§k"]].sort());
      expect(spans[2].textContent).toBe("Obfuscated");
    });

    it("check multiple formatting codes combined", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§a§l§nBold and Underlined", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const span = doc.querySelector("span");
      expect(span).toBeTruthy();
      // Should have both bold and underline classes
      expect(span?.classList.contains("font-bold")).toBe(true);
      expect(span?.classList.contains("underline")).toBe(true);
      expect(span?.style.color).toBe(colorCodes["§a"]);
      expect(span?.textContent).toBe("Bold and Underlined".replace(/ /g, "\u00A0"));
    });

    it("check color reset with §f", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§a§lGreen Bold§f White Normal", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(2);
      // First span should be green and bold
      expect(spans[0].style.color).toBe(colorCodes["§a"]);
      expect(spans[0].classList.contains("font-bold")).toBe(true);
      // Second span should be white with no formatting (§f resets formatting)
      expect(spans[1].style.color).toBe(colorCodes["§f"]);
      expect(spans[1].classList.contains("font-bold")).toBe(false);
    });

    it("check full reset with §r", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§c§l§nRed Bold Underlined§rPlain Text", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(2);
      // First span should have color and formatting
      expect(spans[0].style.color).toBe(colorCodes["§c"]);
      expect(spans[0].classList.contains("font-bold")).toBe(true);
      expect(spans[0].classList.contains("underline")).toBe(true);
      // Second span should have no color or formatting (§r resets everything)
      expect(spans[1].style.color).toBe("");
      expect(sortedClasses(spans[1])).toEqual([...extras["§r"]].sort());
    });

    it("check strikethrough formatting", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§e§mStrikethrough Text", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const span = doc.querySelector("span");
      expect(span?.classList.contains("line-through")).toBe(true);
      expect(span?.style.color).toBe(colorCodes["§e"]);
    });

    it("check italic formatting", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§d§oItalic Text", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const span = doc.querySelector("span");
      expect(span ? sortedClasses(span) : []).toEqual([...extras["§o"]].sort());
      expect(span?.style.color).toBe(colorCodes["§d"]);
    });

    it("check mixed colors and formatting", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§4Red §a§lGreen Bold §9§o§nBlue Italic Underline", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(3);
      // First span: Red with no formatting
      expect(spans[0].style.color).toBe(colorCodes["§4"]);
      expect(spans[0].classList.length).toBe(0);
      // Second span: Green and bold (color resets formatting)
      expect(spans[1].style.color).toBe(colorCodes["§a"]);
      expect(sortedClasses(spans[1])).toEqual([...extras["§l"]].sort());
      // Third span: Blue with italic and underline (color resets previous formatting)
      expect(spans[2].style.color).toBe(colorCodes["§9"]);
      expect(sortedClasses(spans[2])).toEqual([...extras["§o"], ...extras["§n"]].sort());
    });

    it("check obfuscated with multiple colors", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§a§kSecret§c§kCode§f§kText", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(3);
      // All should be obfuscated but with different colors
      expect(spans[0].classList.contains("obfuscated")).toBe(true);
      expect(spans[0].style.color).toBe(colorCodes["§a"]);
      expect(spans[1].classList.contains("obfuscated")).toBe(true);
      expect(spans[1].style.color).toBe(colorCodes["§c"]);
      expect(spans[2].classList.contains("obfuscated")).toBe(true);
      expect(spans[2].style.color).toBe(colorCodes["§f"]);
    });

    it("keeps previous color for obfuscation after reset marker in lore transfer text", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§5§kX§5 Rift-Transferable §r§kX", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");

      expect(spans.length).toBe(3);
      expect(spans[0].style.color).toBe(colorCodes["§5"]);
      expect(spans[0].classList.contains("obfuscated")).toBe(true);

      expect(spans[1].style.color).toBe(colorCodes["§5"]);
      expect(spans[1].textContent).toBe("\u00A0Rift-Transferable\u00A0");

      expect(spans[2].style.color).toBe(colorCodes["§5"]);
      expect(spans[2].classList.contains("obfuscated")).toBe(true);
      expect(sortedClasses(spans[2])).toEqual(sortedClasses(spans[0]));
    });

    it("check empty string handling", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "", breakLine: false });
      expect(result).toBe("");
    });

    it("check string with only formatting codes", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§a§l§n", breakLine: false });
      expect(result).toBe("");
    });

    it("check consecutive color changes", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§aA§bB§cC§dD§eE", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const spans = doc.querySelectorAll("span");
      expect(spans.length).toBe(5);
      expect(spans[0].style.color).toBe(colorCodes["§a"]);
      expect(spans[0].textContent).toBe("A");
      expect(spans[1].style.color).toBe(colorCodes["§b"]);
      expect(spans[1].textContent).toBe("B");
      expect(spans[2].style.color).toBe(colorCodes["§c"]);
      expect(spans[2].textContent).toBe("C");
      expect(spans[3].style.color).toBe(colorCodes["§d"]);
      expect(spans[3].textContent).toBe("D");
      expect(spans[4].style.color).toBe(colorCodes["§e"]);
      expect(spans[4].textContent).toBe("E");
    });

    it("check line break handling", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§aTest", breakLine: true });
      expect(result).toContain("<br>");
      expect(result).toMatch(/Test<\/span><br>$/);
    });

    it("check HTML escaping", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§a<script>alert('xss')</script>", breakLine: false });
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("check max enchant detection with trailing comma", ({ expect }) => {
      const result = mcTextToHTML({ mcString: "§9Aqua Affinity I,", breakLine: false });
      const doc = domParser.parseFromString(result, "text/html");
      const span = doc.querySelector("span");
      expect(span?.classList.contains("lore-enchantment")).toBe(true);
    });
  });
});
