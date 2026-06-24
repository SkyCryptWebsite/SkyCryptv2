import { setTheme } from "mode-watcher";
import { SHADCN_CSS_VAR_MAP } from "./css-vars";
import { DEFAULT_THEME } from "./defaults";
import { getPaletteColors } from "./presets";
import { themeV4Schema } from "./schema";
import type { PartialThemeV4, ShadcnThemeVarKey, SkyCryptThemeExtras, ThemeV4 } from "./schema";

export const RUNTIME_THEMES_STYLE_ID = "skycrypt-runtime-themes";
export const PREVIEW_THEME_ID = "__skycrypt-preview";

const FIRST_PARTY_IMAGE_HOSTS = new Set(["sky.shiiyu.moe", "cupcake.shiiyu.moe"]);
const LOCAL_FIRST_PARTY_IMAGE_PATHS = new Set(["/img/bg.avif", "/img/enchanted-glint.avif", "/img/enchanted-glint-legacy.avif"]);
const REMOVED_FIRST_PARTY_THEME_IMAGE_PREFIX = "/img/themes/";
const runtimeThemeRules = new Map<string, string>();
let previewThemeRule: string | null = null;

function mergeExtras(partial: PartialThemeV4["extras"]): SkyCryptThemeExtras {
  const defaultExtras = DEFAULT_THEME.extras;

  return {
    minecraft: {
      palette: partial?.minecraft?.palette ?? defaultExtras?.minecraft?.palette ?? "nice-light",
      overrides: partial?.minecraft?.overrides ?? defaultExtras?.minecraft?.overrides
    },
    pageBackground: partial?.pageBackground ?? defaultExtras?.pageBackground,
    enchantedGlint: partial?.enchantedGlint ?? defaultExtras?.enchantedGlint
  };
}

export function mergeThemeWithDefaults(partial: PartialThemeV4): ThemeV4 {
  return {
    schema: 4,
    mode: partial.mode ?? DEFAULT_THEME.mode,
    cssVars: partial.cssVars ?? {},
    extras: mergeExtras(partial.extras),
    metadata: {
      ...DEFAULT_THEME.metadata,
      ...partial.metadata
    }
  };
}

function themeImageUrl(url: string): string {
  const targetUrl = new URL(url);

  if (FIRST_PARTY_IMAGE_HOSTS.has(targetUrl.hostname)) {
    const path = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;

    if (LOCAL_FIRST_PARTY_IMAGE_PATHS.has(targetUrl.pathname)) {
      return `url(${path})`;
    }

    if (targetUrl.pathname.startsWith(REMOVED_FIRST_PARTY_THEME_IMAGE_PREFIX)) {
      return "url(/img/bg.avif)";
    }

    return `url(${targetUrl.href})`;
  }

  return `url(/api/image-proxy?url=${encodeURIComponent(url)})`;
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

function getRuntimeStyleElement(): HTMLStyleElement | null {
  if (typeof document === "undefined") return null;

  const existing = document.getElementById(RUNTIME_THEMES_STYLE_ID);
  if (existing instanceof HTMLStyleElement) return existing;

  const style = document.createElement("style");
  style.id = RUNTIME_THEMES_STYLE_ID;
  document.head.append(style);
  return style;
}

function updateRuntimeStyleElement(): void {
  const style = getRuntimeStyleElement();
  if (!style) return;

  const rules = [...runtimeThemeRules.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, rule]) => rule);

  if (previewThemeRule) {
    rules.push(previewThemeRule);
  }

  style.textContent = rules.join("\n\n");
}

function addDeclaration(declarations: string[], cssVar: string, value: string | undefined): void {
  if (value) {
    declarations.push(`  ${cssVar}: ${value};`);
  }
}

export class ThemeEngine {
  static syncRuntimeThemes(themes: ThemeV4[]): void {
    if (typeof document === "undefined") return;

    runtimeThemeRules.clear();
    for (const theme of themes) {
      if (theme.metadata.id === DEFAULT_THEME.metadata.id) continue;
      runtimeThemeRules.set(theme.metadata.id, ThemeEngine.themeToCssRule(theme));
    }

    updateRuntimeStyleElement();
  }

  static upsertRuntimeTheme(theme: ThemeV4): void {
    if (typeof document === "undefined") return;
    if (theme.metadata.id === DEFAULT_THEME.metadata.id) return;

    runtimeThemeRules.set(theme.metadata.id, ThemeEngine.themeToCssRule(theme));
    updateRuntimeStyleElement();
  }

  static removeRuntimeTheme(id: string): void {
    if (typeof document === "undefined") return;

    runtimeThemeRules.delete(id);
    updateRuntimeStyleElement();
  }

  static setActiveTheme(id: string): void {
    setTheme(id);
  }

  static previewTheme(theme: ThemeV4): void {
    if (typeof document === "undefined") return;

    previewThemeRule = ThemeEngine.themeToCssRule(theme, PREVIEW_THEME_ID);
    updateRuntimeStyleElement();
  }

  static activatePreviewTheme(): void {
    if (typeof document === "undefined") return;

    setTheme(PREVIEW_THEME_ID);
  }

  static clearPreview(): void {
    if (typeof document === "undefined") return;

    previewThemeRule = null;
    updateRuntimeStyleElement();
  }

  static themeToCssRule(theme: ThemeV4, idOverride?: string): string {
    const result = themeV4Schema.safeParse(theme);
    if (!result.success) {
      throw new Error(`Cannot generate CSS for invalid theme: ${result.error.issues[0]?.message ?? "invalid theme"}`);
    }

    const resolvedTheme = mergeThemeWithDefaults(result.data);
    const id = idOverride ?? resolvedTheme.metadata.id;
    const declarations: string[] = [];

    for (const [key, cssVar] of Object.entries(SHADCN_CSS_VAR_MAP)) {
      addDeclaration(declarations, cssVar, resolvedTheme.cssVars[key as ShadcnThemeVarKey]);
    }

    const minecraft = resolvedTheme.extras?.minecraft;
    if (minecraft) {
      const colors = getPaletteColors(minecraft.palette, minecraft.overrides);
      for (const [code, color] of Object.entries(colors)) {
        declarations.push(`  --${code}: ${color};`);
      }
    }

    if (resolvedTheme.extras?.pageBackground?.url) {
      declarations.push(`  --bg-url: ${themeImageUrl(resolvedTheme.extras.pageBackground.url)};`);
    }

    if (resolvedTheme.extras?.enchantedGlint) {
      declarations.push(`  --enchanted-glint: ${themeImageUrl(resolvedTheme.extras.enchantedGlint)};`);
    }

    return [`:root[data-theme="${cssEscape(id)}"] {`, ...declarations, "}"].join("\n");
  }
}
