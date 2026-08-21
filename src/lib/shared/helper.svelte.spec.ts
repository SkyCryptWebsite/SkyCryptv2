import { renderLore } from "$lib/shared/helper";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

describe.concurrent("renderLore Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders basic lore text with color codes", ({ expect }) => {
    const result = renderLore("§aGreen Text", false);
    expect(result).toContain('style="color: var(--§a);"');
    expect(result).toContain("Green");
  });

  it("renders lore text with multiple color codes", ({ expect }) => {
    const result = renderLore("§cRed §9Blue §eYellow", false);
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(result, "text/html");
    const spans = doc.querySelectorAll("span");
    expect(spans.length).toBeGreaterThanOrEqual(3);
    expect(spans[0].style.color).toBe("var(--§c)");
    expect(spans[1].style.color).toBe("var(--§9)");
    expect(spans[2].style.color).toBe("var(--§e)");
  });

  it("renders lore text with formatting codes", ({ expect }) => {
    const result = renderLore("§l§nBold and Underlined", false);
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(result, "text/html");
    const span = doc.querySelector("span");
    expect(span?.classList.contains("font-bold")).toBe(true);
    expect(span?.classList.contains("underline")).toBe(true);
  });

  it("handles empty string input", ({ expect }) => {
    const result = renderLore("", false);
    expect(result).toBe("<br>");
  });

  it("handles lore without color codes", ({ expect }) => {
    const result = renderLore("Plain text", false);
    // Plain text should still be rendered (mcTextToHTML handles this)
    expect(result).toBeTruthy();
  });

  it("keeps regular spaces so tooltip text can wrap", ({ expect }) => {
    const result = renderLore("Caught within 7-16 minutes after", false);

    expect(result).not.toContain("&nbsp;");
    expect(result).not.toContain("\u00A0");
  });

  it("keeps numeric ranges on one line with non-breaking hyphen", ({ expect }) => {
    const result = renderLore("Caught within 7-16 minutes", false);

    expect(result).toMatch(/7(?:&#8209;|\u2011)16/);
    expect(result).not.toMatch(/7-16/);
  });

  it("supports opting out of breaking spaces and dashes", ({ expect }) => {
    const result = renderLore("Caught within 7-16 minutes after", false, undefined, {
      breakSpaces: false,
      breakDashes: false
    });

    expect(result).toMatch(/&nbsp;|\u00A0/);
    expect(result).toContain("7-16");
  });

  it("formats timestamp when formatTime is true", ({ expect }) => {
    vi.setSystemTime(new Date("2026-02-14T18:30:00Z"));

    const loreWithTimestamp = "§7Created: {TIMESTAMP:1771092600000}";
    const result = renderLore(loreWithTimestamp, true);

    expect(result).not.toContain("{TIMESTAMP:");
    expect(result).toContain("Feb 14, 2026");
  });

  it("does not format timestamp when formatTime is false", ({ expect }) => {
    const loreWithTimestamp = "§7Created: {TIMESTAMP:1739556600000}";
    const result = renderLore(loreWithTimestamp, false);

    // The placeholder should remain in the output
    expect(result).toContain("{TIMESTAMP:1739556600000}");
  });

  it("handles multiple timestamps in lore", ({ expect }) => {
    vi.setSystemTime(new Date("2026-02-14T18:30:00Z"));

    const loreWithTimestamps = "§7Start: {TIMESTAMP:1771092600000} End: {TIMESTAMP:1771096200000}";
    const result = renderLore(loreWithTimestamps, true);

    expect(result).not.toContain("{TIMESTAMP:");
    expect(result).toContain("Feb 14, 2026");
  });

  it("handles invalid timestamp gracefully", ({ expect }) => {
    const loreWithInvalidTimestamp = "§7Created: {TIMESTAMP:invalid}";
    const result = renderLore(loreWithInvalidTimestamp, true);

    // Invalid timestamp should remain unchanged
    expect(result).toContain("{TIMESTAMP:invalid}");
  });

  it("handles timestamp with non-numeric value", ({ expect }) => {
    const loreWithNonNumeric = "§7Created: {TIMESTAMP:abc123}";
    const result = renderLore(loreWithNonNumeric, true);

    // Non-numeric timestamp should remain unchanged
    expect(result).toContain("{TIMESTAMP:abc123}");
  });

  it("passes index parameter to mcTextToHTML", ({ expect }) => {
    // Test that index parameter is passed through correctly
    const result1 = renderLore("§aTest", false, 0);
    const result2 = renderLore("§aTest", false, 1);

    // Both should contain the styled text
    expect(result1).toContain('style="color: var(--§a);"');
    expect(result2).toContain('style="color: var(--§a);"');
  });

  it("handles lore with special characters", ({ expect }) => {
    const result = renderLore("§a<script>alert('xss')</script>", false);
    // Should escape HTML
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("handles combination of timestamp and color codes", ({ expect }) => {
    vi.setSystemTime(new Date("2026-02-14T18:30:00Z"));

    const loreComplex = "§7Created: §a{TIMESTAMP:1771092600000}";
    const result = renderLore(loreComplex, true);

    expect(result).not.toContain("{TIMESTAMP:");
    expect(result).toContain("Feb 14, 2026");
    expect(result).toContain('style="color: var(--§7);"');
  });

  it("handles timestamp at different positions", ({ expect }) => {
    vi.setSystemTime(new Date("2026-02-14T18:30:00Z"));

    const loreStart = "{TIMESTAMP:1771092600000} §7at start";
    const loreMiddle = "§7In §amiddle {TIMESTAMP:1771092600000} here";
    const loreEnd = "§7At end {TIMESTAMP:1771092600000}";

    const resultStart = renderLore(loreStart, true);
    const resultMiddle = renderLore(loreMiddle, true);
    const resultEnd = renderLore(loreEnd, true);

    expect(resultStart).not.toContain("{TIMESTAMP:");
    expect(resultMiddle).not.toContain("{TIMESTAMP:");
    expect(resultEnd).not.toContain("{TIMESTAMP:");

    expect(resultStart).toContain("Feb 14, 2026");
    expect(resultMiddle).toContain("Feb 14, 2026");
    expect(resultEnd).toContain("Feb 14, 2026");
  });
});
