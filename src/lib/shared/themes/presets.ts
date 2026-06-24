/**
 * Minecraft color palettes extracted from layout.css utilities
 * Each palette maps §0–§f color codes to OKLCH color values
 */

export const MC_PALETTES = {
  "nice-dark": {
    "§0": "oklch(0 0 0)",
    "§1": "oklch(0.32 0.14 264.6)",
    "§2": "oklch(0.64 0.22 142.5)",
    "§3": "oklch(0.58 0.1 194.78)",
    "§4": "oklch(0.42 0.17 28.49)",
    "§5": "oklch(0.5 0.23 328.34)",
    "§6": "oklch(0.71 0.15 72.75)",
    "§7": "oklch(0.5 0 0)",
    "§8": "oklch(0.31 0 0)",
    "§9": "oklch(0.51 0.25 273.16)",
    "§a": "oklch(0.7 0.2 143.13)",
    "§b": "oklch(0.69 0.11 211.66)",
    "§c": "oklch(0.56 0.17 24.75)",
    "§d": "oklch(0.7 0.19 338.3)",
    "§e": "oklch(0.84 0.17 93.53)",
    "§f": "oklch(0.66 0 0)"
  },
  "nice-light": {
    "§0": "oklch(0.54 0 0)",
    "§1": "oklch(0.5 0.28 269.85)",
    "§2": "oklch(0.66 0.23 142.5)",
    "§3": "oklch(0.71 0.12 185.91)",
    "§4": "oklch(0.5 0.19 27.28)",
    "§5": "oklch(0.66 0.3 328.31)",
    "§6": "oklch(0.8 0.17 73.27)",
    "§7": "oklch(0.78 0 0)",
    "§8": "oklch(0.68 0 0)",
    "§9": "oklch(0.66 0.16 273.97)",
    "§a": "oklch(0.79 0.2 143.36)",
    "§b": "oklch(0.81 0.11 211.69)",
    "§c": "oklch(0.68 0.2 24.09)",
    "§d": "oklch(0.74 0.23 336.42)",
    "§e": "oklch(0.94 0.16 109.12)",
    "§f": "oklch(1 0 0)"
  },
  "true-colors": {
    "§0": "oklch(0 0 0)",
    "§1": "oklch(0.33 0.23 264.05)",
    "§2": "oklch(0.64 0.22 142.5)",
    "§3": "oklch(0.67 0.11 194.77)",
    "§4": "oklch(0.46 0.19 29.23)",
    "§5": "oklch(0.52 0.24 328.36)",
    "§6": "oklch(0.8 0.17 73.27)",
    "§7": "oklch(0.74 0 0)",
    "§8": "oklch(0.45 0 0)",
    "§9": "oklch(0.56 0.24 275.12)",
    "§a": "oklch(0.88 0.25 143.06)",
    "§b": "oklch(0.91 0.14 195.03)",
    "§c": "oklch(0.68 0.21 24.43)",
    "§d": "oklch(0.74 0.27 327.9)",
    "§e": "oklch(0.97 0.18 109.38)",
    "§f": "oklch(1 0 0)"
  },
  "april-fools-2024": {
    "§0": "oklch(0.65 0.26 356.94)",
    "§1": "oklch(0.66 0.23 35.4)",
    "§2": "oklch(0.66 0.28 347.13)",
    "§3": "oklch(0.66 0.24 4.74)",
    "§4": "oklch(0.28 0.1 10.33)",
    "§5": "oklch(0.72 0.14 356.27)",
    "§6": "oklch(0.65 0.16 357.22)",
    "§7": "oklch(0.67 0.24 357.79)",
    "§8": "oklch(0.62 0.18 334.19)",
    "§9": "oklch(0.83 0.09 357.41)",
    "§a": "oklch(0.91 0.04 355.91)",
    "§b": "oklch(0.44 0.15 4.7)",
    "§c": "oklch(0.28 0.1 10.33)",
    "§d": "oklch(0.55 0.16 0.51)",
    "§e": "oklch(0.73 0.2 351.99)",
    "§f": "oklch(0.97 0.01 350.09)"
  }
} as const;

/** Palette names as a tuple for Zod schema validation */
export const paletteNames = ["nice-dark", "nice-light", "true-colors", "april-fools-2024"] as const;

/**
 * Get palette colors with optional overrides
 * @param palette - The palette name
 * @param overrides - Optional record of color code overrides
 * @returns Record of 16 MC color codes to OKLCH values
 */
export function getPaletteColors(palette: string, overrides?: Record<string, string>): Record<string, string> {
  const paletteColors = MC_PALETTES[palette as keyof typeof MC_PALETTES];
  if (!paletteColors) {
    throw new Error(`Unknown palette: ${palette}`);
  }

  const normalizedOverrides = Object.fromEntries(Object.entries(overrides ?? {}).map(([code, color]) => [code.startsWith("§") ? code : `§${code}`, color]));
  return { ...paletteColors, ...normalizedOverrides };
}
