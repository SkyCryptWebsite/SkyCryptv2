import { SHADCN_CSS_VAR_MAP } from "./css-vars";
import type { ShadcnThemeVars } from "./schema";

export function readComputedThemeCssVars(): ShadcnThemeVars {
  if (typeof document === "undefined") return {};

  const style = getComputedStyle(document.documentElement);
  const cssVars: ShadcnThemeVars = {};

  for (const [key, cssVar] of Object.entries(SHADCN_CSS_VAR_MAP)) {
    const value = style.getPropertyValue(cssVar).trim();
    if (value) {
      cssVars[key as keyof ShadcnThemeVars] = value;
    }
  }

  return cssVars;
}
