type FormattingCodes = "§k" | "§l" | "§m" | "§n" | "§o" | "§r";
type ColorCodes =
  | "§0"
  | "§1"
  | "§2"
  | "§3"
  | "§4"
  | "§5"
  | "§6"
  | "§7"
  | "§8"
  | "§9"
  | "§a"
  | "§b"
  | "§c"
  | "§d"
  | "§e"
  | "§f";
type AllFormattingCodes = FormattingCodes | ColorCodes;

/**
 * Mapping of Minecraft formatting style codes to (Tailwind) CSS classes.
 * This mapper provides a mapping of Minecraft formatting style codes to CSS classes
 */
const extras: Record<FormattingCodes, string[]> = {
  "§k": ["obfuscated", "font-mono"],
  "§l": ["font-bold"],
  "§m": ["line-through"],
  "§n": ["underline"],
  "§o": ["font-italic"],
  "§r": ["text-inherit", "![text-decoration:none]", "!font-normal", "!not-italic"]
} as const;

/**
 * Mapping of Minecraft formatting color codes to (Tailwind) CSS variables.
 * This mapper provides a mapping of Minecraft formatting color codes to CSS variables.
 */
const colorCodes: { [K in ColorCodes]: `var(--${K})` } = {
  "§0": "var(--§0)",
  "§1": "var(--§1)",
  "§2": "var(--§2)",
  "§3": "var(--§3)",
  "§4": "var(--§4)",
  "§5": "var(--§5)",
  "§6": "var(--§6)",
  "§7": "var(--§7)",
  "§8": "var(--§8)",
  "§9": "var(--§9)",
  "§a": "var(--§a)",
  "§b": "var(--§b)",
  "§c": "var(--§c)",
  "§d": "var(--§d)",
  "§e": "var(--§e)",
  "§f": "var(--§f)"
} as const;

export { colorCodes, extras, type AllFormattingCodes, type ColorCodes, type FormattingCodes };
