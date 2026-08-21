// Hex ↔ OKLCH color conversion using culori
// Outputs absolute L format (0-1 range) for backward compatibility with saved themes

import { converter, formatHex, parse } from "culori";

const toOklch = converter("oklch");

function round(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/**
 * Parse an oklch(...) string into { L, C, H, alpha? } components. Accepts both absolute L (0-1) and percentage L
 * (0%-100%).
 */
export function parseOklch(oklch: string): { L: number; C: number; H: number; alpha?: number } | null {
  const color = parse(oklch);
  if (!color || color.mode !== "oklch") return null;

  return {
    L: color.l,
    C: color.c,
    H: color.h ?? 0,
    alpha: color.alpha
  };
}

/** Convert hex color (#rrggbb or #rgb) to oklch(L C H) string. Uses absolute L format (0-1 range), NOT percentage. */
export function hexToOklch(hex: string): string {
  const color = toOklch(hex);
  if (!color) return "oklch(0 0 0)";

  const l = round(color.l, 4);
  const c = round(color.c, 4);
  const h = round(color.h ?? 0, 2);

  // For achromatic colors (C ≈ 0), hue is meaningless — use 0
  if (c < 0.0001) {
    return `oklch(${l} 0 0)`;
  }

  return `oklch(${l} ${c} ${h})`;
}

/** Convert oklch(L C H) string to hex color (#rrggbb). */
export function oklchToHex(oklch: string): string {
  const color = parse(oklch);
  if (!color) return "#000000";

  return formatHex(color) ?? "#000000";
}
