import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { renderLore } from "#lib/shared/helper";

vi.mock("$ctx", () => ({
  getEnchantmentsContext: () => ({ current: [] })
}));

describe.concurrent("renderLore Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handles empty string input", ({ expect }) => {
    const result = renderLore("", false);
    expect(result).toBe("<br>");
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

  it("handles invalid timestamp gracefully", ({ expect }) => {
    const loreWithInvalidTimestamp = "§7Created: {TIMESTAMP:invalid}";
    const result = renderLore(loreWithInvalidTimestamp, true);

    // Invalid timestamp should remain unchanged
    expect(result).toContain("{TIMESTAMP:invalid}");
  });

  it("handles combination of timestamp and color codes", ({ expect }) => {
    vi.setSystemTime(new Date("2026-02-14T18:30:00Z"));

    const loreComplex = "§7Created: §a{TIMESTAMP:1771092600000}";
    const result = renderLore(loreComplex, true);

    expect(result).not.toContain("{TIMESTAMP:");
    expect(result).toContain("Feb 14, 2026");
    expect(result).toContain('style="color: var(--§7);"');
  });
});
