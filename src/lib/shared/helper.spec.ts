import { RARITY_COLORS } from "$lib/shared/constants/rarities";
import {
  calculatePercentage,
  formatNumber,
  getRarityClass,
  removeFormatting,
  titleCase,
  uniqBy,
  validateURL
} from "$lib/shared/helper";
import { describe, it, vi } from "vitest";

describe.concurrent("formatNumber", () => {
  it("formats thousands with K suffix", ({ expect }) => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(1234, 2)).toBe("1.23K");
    expect(formatNumber(9999, 1)).toBe("10K");
  });

  it("formats millions with M suffix", ({ expect }) => {
    expect(formatNumber(1000000)).toBe("1M");
    expect(formatNumber(1234567, 2)).toBe("1.23M");
    expect(formatNumber(9876543, 1)).toBe("9.9M");
  });

  it("formats billions with B suffix", ({ expect }) => {
    expect(formatNumber(1000000000)).toBe("1B");
    expect(formatNumber(1234567890, 2)).toBe("1.23B");
  });

  it("removes trailing zeros from decimals", ({ expect }) => {
    expect(formatNumber(1000, 2)).toBe("1K");
    expect(formatNumber(1100, 2)).toBe("1.10K");
    expect(formatNumber(1001, 2)).toBe("1K");
  });

  it("respects decimal precision parameter", ({ expect }) => {
    expect(formatNumber(1234, 0)).toBe("1K");
    expect(formatNumber(1234, 1)).toBe("1.2K");
    expect(formatNumber(1234, 3)).toBe("1.234K");
  });

  it("handles zero correctly", ({ expect }) => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(0, 5)).toBe("0");
  });

  it("handles negative numbers", ({ expect }) => {
    expect(formatNumber(-1000)).toBe("-1K");
    expect(formatNumber(-1234567, 2)).toBe("-1.23M");
  });

  it("handles small numbers without suffix", ({ expect }) => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(42)).toBe("42");
  });

  it("handles large numbers with T suffix", ({ expect }) => {
    expect(formatNumber(1000000000000)).toBe("1T");
    expect(formatNumber(1234567890123, 2)).toBe("1.23T");
  });
});

describe.concurrent("titleCase", () => {
  it("converts underscore-separated words to title case", ({ expect }) => {
    expect(titleCase("hello_world")).toBe("Hello World");
    expect(titleCase("the_quick_brown_fox")).toBe("The Quick Brown Fox");
  });

  it("converts space-separated words to title case", ({ expect }) => {
    expect(titleCase("hello world")).toBe("Hello World");
    expect(titleCase("the quick brown fox")).toBe("The Quick Brown Fox");
  });

  it("handles mixed case input", ({ expect }) => {
    expect(titleCase("HeLLo_WoRLd")).toBe("Hello World");
    expect(titleCase("SCREAMING_CASE")).toBe("Screaming Case");
  });

  it("handles single word", ({ expect }) => {
    expect(titleCase("hello")).toBe("Hello");
    expect(titleCase("WORLD")).toBe("World");
  });

  it("handles empty string", ({ expect }) => {
    expect(titleCase("")).toBe("");
  });

  it("handles mixed spaces and underscores", ({ expect }) => {
    expect(titleCase("hello world_test")).toBe("Hello World Test");
  });

  it("handles multiple consecutive spaces/underscores", ({ expect }) => {
    expect(titleCase("hello__world")).toBe("Hello  World");
    expect(titleCase("hello  world")).toBe("Hello  World");
  });
});

describe.concurrent("getRarityClass", () => {
  it("returns correct text class for common rarity", ({ expect }) => {
    expect(getRarityClass("common", "text")).toBe("text-minecraft-f");
  });

  it("returns correct bg class for legendary rarity", ({ expect }) => {
    expect(getRarityClass("legendary", "bg")).toBe("bg-minecraft-6");
  });

  it("returns correct class for all valid rarities", ({ expect }) => {
    Object.entries(RARITY_COLORS).forEach(([rarity, color]) => {
      expect(getRarityClass(rarity, "text")).toBe(`text-minecraft-${color}`);
      expect(getRarityClass(rarity, "bg")).toBe(`bg-minecraft-${color}`);
    });
  });

  it("handles case-insensitive rarity names", ({ expect }) => {
    expect(getRarityClass("LEGENDARY", "text")).toBe("text-minecraft-6");
    expect(getRarityClass("MyThIc", "text")).toBe("text-minecraft-d");
  });

  it("returns empty string for invalid rarity", ({ expect }) => {
    expect(getRarityClass("invalid_rarity", "text")).toBe("");
    expect(getRarityClass("not_a_rarity", "bg")).toBe("");
  });

  it("verifies mapping matches RARITY_COLORS constant", ({ expect }) => {
    expect(getRarityClass("mythic", "text")).toBe(`text-minecraft-${RARITY_COLORS["mythic"]}`);
    expect(getRarityClass("epic", "bg")).toBe(`bg-minecraft-${RARITY_COLORS["epic"]}`);
  });
});

describe.concurrent("removeFormatting", () => {
  it("removes single formatting code", ({ expect }) => {
    expect(removeFormatting("§aHello")).toBe("Hello");
    expect(removeFormatting("§bWorld")).toBe("World");
  });

  it("removes multiple formatting codes", ({ expect }) => {
    expect(removeFormatting("§aHello §bWorld")).toBe("Hello World");
    expect(removeFormatting("§cRed §6Gold §9Blue")).toBe("Red Gold Blue");
  });

  it("removes consecutive formatting codes", ({ expect }) => {
    expect(removeFormatting("§a§l§nFormatted")).toBe("Formatted");
    expect(removeFormatting("§5§k§mMultiple")).toBe("Multiple");
  });

  it("handles string with no formatting codes", ({ expect }) => {
    expect(removeFormatting("Plain text")).toBe("Plain text");
    expect(removeFormatting("No codes here")).toBe("No codes here");
  });

  it("handles empty string", ({ expect }) => {
    expect(removeFormatting("")).toBe("");
  });

  it("removes all valid Minecraft color codes (0-9, a-f)", ({ expect }) => {
    const allCodes = "§0§1§2§3§4§5§6§7§8§9§a§b§c§d§e§fText";
    expect(removeFormatting(allCodes)).toBe("Text");
  });

  it("removes all valid Minecraft format codes (k-o, r)", ({ expect }) => {
    const formatCodes = "§k§l§m§n§o§rText";
    expect(removeFormatting(formatCodes)).toBe("Text");
  });

  it("removes all §[0-9a-z] sequences", ({ expect }) => {
    expect(removeFormatting("§ATest")).toBe("§ATest");
    expect(removeFormatting("§xInvalid")).toBe("Invalid");
  });
});

describe.concurrent("uniqBy", () => {
  it("removes duplicates by specified key", ({ expect }) => {
    const arr = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Charlie" }
    ];
    const result = uniqBy(arr, "id");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 1, name: "Alice" });
    expect(result[1]).toEqual({ id: 2, name: "Bob" });
  });

  it("preserves first occurrence on duplicate", ({ expect }) => {
    const arr = [
      { id: 1, value: "first" },
      { id: 1, value: "second" },
      { id: 1, value: "third" }
    ];
    const result = uniqBy(arr, "id");
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("first");
  });

  it("handles empty array", ({ expect }) => {
    const result = uniqBy([], "id");
    expect(result).toEqual([]);
  });

  it("handles single element array", ({ expect }) => {
    const arr = [{ id: 1, name: "Only" }];
    const result = uniqBy(arr, "id");
    expect(result).toEqual(arr);
  });

  it("handles array with no duplicates", ({ expect }) => {
    const arr = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" }
    ];
    const result = uniqBy(arr, "id");
    expect(result).toEqual(arr);
  });

  it("works with string keys", ({ expect }) => {
    const arr = [
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
      { name: "Alice", age: 35 }
    ];
    const result = uniqBy(arr, "name");
    expect(result).toHaveLength(2);
    expect(result[0].age).toBe(25);
  });

  it("works with numeric keys", ({ expect }) => {
    const arr = [
      { value: 1, data: "first" },
      { value: 2, data: "second" },
      { value: 1, data: "duplicate" }
    ];
    const result = uniqBy(arr, "value");
    expect(result).toHaveLength(2);
    expect(result[0].data).toBe("first");
  });
});

describe.concurrent("validateURL", () => {
  it("validates simple username", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("Player123")).toBe(true);
    expect(validateURL("test_user")).toBe(true);
    expect(validateURL("a")).toBe(true);
    spy.mockRestore();
  });

  it("validates UUID without dashes", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("12345678901234567890123456789012")).toBe(true);
    expect(validateURL("abcdef1234567890abcdef1234567890")).toBe(true);
    spy.mockRestore();
  });

  it("validates UUID with dashes", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("12345678-1234-1234-1234-123456789012")).toBe(true);
    expect(validateURL("abcdef12-3456-7890-abcd-ef1234567890")).toBe(true);
    spy.mockRestore();
  });

  it("validates username with profile name", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("Player123/Cucumber")).toBe(true);
    expect(validateURL("test/tomato")).toBe(true);
    spy.mockRestore();
  });

  it("validates username with profile UUID", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("Player123/12345678901234567890123456789012")).toBe(true);
    spy.mockRestore();
  });

  it("rejects empty string", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("")).toBe(false);
    expect(validateURL("   ")).toBe(false);
    spy.mockRestore();
  });

  it("rejects too many segments", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("player/profile/extra")).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('too many "/"'));
    spy.mockRestore();
  });

  it("rejects invalid username characters", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("player@123")).toBe(false);
    expect(validateURL("player#test")).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not a valid username or UUID"));
    spy.mockRestore();
  });

  it("rejects invalid profile name", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("player/123abc")).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not a valid profile name or UUID"));
    spy.mockRestore();
  });

  it("rejects empty profile segment", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("player/")).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Please enter valid profile name or UUID after "/"'));
    spy.mockRestore();
  });

  it("calls console.error on validation failures", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    validateURL("");
    expect(spy).not.toHaveBeenCalled(); // Empty string short-circuits before console.error
    validateURL("player/profile/extra");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("handles username with spaces (converts to underscore)", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("Player Name")).toBe(true);
    spy.mockRestore();
  });

  it("validates max length username (16 characters)", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("1234567890123456")).toBe(true);
    spy.mockRestore();
  });

  it("rejects username longer than 16 characters", ({ expect }) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(validateURL("12345678901234567")).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not a valid username or UUID"));
    spy.mockRestore();
  });
});

describe.concurrent("calculatePercentage", () => {
  it("calculates basic percentage", ({ expect }) => {
    expect(calculatePercentage(50, 100)).toBe("50");
    expect(calculatePercentage(25, 100)).toBe("25");
    expect(calculatePercentage(75, 100)).toBe("75");
  });

  it("respects decimal precision parameter", ({ expect }) => {
    expect(calculatePercentage(1, 3, 0)).toBe("33");
    expect(calculatePercentage(1, 3, 1)).toBe("33");
    expect(calculatePercentage(1, 3, 2)).toBe("33");
  });

  it("removes trailing zeros from result", ({ expect }) => {
    expect(calculatePercentage(100, 100, 2)).toBe("100");
    expect(calculatePercentage(50, 100, 3)).toBe("50");
  });

  it("handles zero value", ({ expect }) => {
    expect(calculatePercentage(0, 100)).toBe("0");
    expect(calculatePercentage(0, 50, 5)).toBe("0");
  });

  it("handles zero total", ({ expect }) => {
    expect(calculatePercentage(50, 0)).toBe("0");
    expect(calculatePercentage(100, 0, 3)).toBe("0");
  });

  it("handles both value and total as zero", ({ expect }) => {
    expect(calculatePercentage(0, 0)).toBe("0");
  });

  it("calculates percentage less than 1", ({ expect }) => {
    expect(calculatePercentage(1, 1000, 2)).toBe("0");
    expect(calculatePercentage(5, 1000, 2)).toBe("0");
  });

  it("uses floor for calculation", ({ expect }) => {
    // 66.66% floors to 66%
    expect(calculatePercentage(2, 3, 0)).toBe("66");
    // 33.33% floors to 33%
    expect(calculatePercentage(1, 3, 0)).toBe("33");
  });

  it("handles large numbers", ({ expect }) => {
    expect(calculatePercentage(1000000, 2000000)).toBe("50");
    expect(calculatePercentage(999999, 1000000, 2)).toBe("99");
  });
});
