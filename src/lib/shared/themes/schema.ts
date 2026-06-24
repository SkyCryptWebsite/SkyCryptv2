import { z } from "zod";
import { paletteNames } from "./presets";

const cssColorSchema = z.string().refine((value) => {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return /^(oklch|hsl|rgb|color|lab|lch)\(/.test(value) || /^#[\da-f]{3,8}$/i.test(value) || /^[a-z]+$/i.test(value);
  }

  return CSS.supports("color", value);
}, "Must be a valid CSS color");

const cssLengthSchema = z.string().refine((value) => {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return /^-?[\d.]+(px|rem|em|ch|vw|vh|vmin|vmax|%)$/.test(value) || value === "0";
  }

  return CSS.supports("border-radius", value);
}, "Must be a valid CSS length");

const httpsUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "URL must use HTTPS protocol"
  });

const minecraftOverrideKeySchema = z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]);
const minecraftOverridesSchema = z.record(z.string(), cssColorSchema).refine((data) => Object.keys(data).every((key) => minecraftOverrideKeySchema.safeParse(key).success), {
  message: "Override keys must be single hex characters (0-9, a-f)"
});
const themeIdSchema = z
  .string()
  .min(1, "Theme ID is required")
  .max(64, "Theme ID must be 64 characters or fewer")
  .regex(/^[a-z0-9][a-z0-9_-]*$/, "Theme ID must start with a lowercase letter or number and contain only lowercase letters, numbers, underscores, and dashes");

export const shadcnThemeVarsSchema = z.object({
  radius: cssLengthSchema.optional(),
  background: cssColorSchema.optional(),
  foreground: cssColorSchema.optional(),
  card: cssColorSchema.optional(),
  cardForeground: cssColorSchema.optional(),
  popover: cssColorSchema.optional(),
  popoverForeground: cssColorSchema.optional(),
  primary: cssColorSchema.optional(),
  primaryForeground: cssColorSchema.optional(),
  secondary: cssColorSchema.optional(),
  secondaryForeground: cssColorSchema.optional(),
  muted: cssColorSchema.optional(),
  mutedForeground: cssColorSchema.optional(),
  accent: cssColorSchema.optional(),
  accentForeground: cssColorSchema.optional(),
  accent2: cssColorSchema.optional(),
  accent3: cssColorSchema.optional(),
  accent4: cssColorSchema.optional(),
  destructive: cssColorSchema.optional(),
  border: cssColorSchema.optional(),
  input: cssColorSchema.optional(),
  ring: cssColorSchema.optional(),
  chart1: cssColorSchema.optional(),
  chart2: cssColorSchema.optional(),
  chart3: cssColorSchema.optional(),
  chart4: cssColorSchema.optional(),
  chart5: cssColorSchema.optional(),
  sidebar: cssColorSchema.optional(),
  sidebarForeground: cssColorSchema.optional(),
  sidebarPrimary: cssColorSchema.optional(),
  sidebarPrimaryForeground: cssColorSchema.optional(),
  sidebarAccent: cssColorSchema.optional(),
  sidebarAccentForeground: cssColorSchema.optional(),
  sidebarBorder: cssColorSchema.optional(),
  sidebarRing: cssColorSchema.optional()
});

export const skyCryptThemeExtrasSchema = z.object({
  minecraft: z
    .object({
      palette: z.enum(paletteNames),
      overrides: minecraftOverridesSchema.optional()
    })
    .optional(),
  pageBackground: z
    .object({
      url: httpsUrlSchema
    })
    .optional(),
  enchantedGlint: httpsUrlSchema.optional()
});

const metadataSchema = z.object({
  id: themeIdSchema,
  name: z.string().min(1, "Theme name is required"),
  author: z.string().min(1, "Author is required"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  version: z.number().int().positive().default(1)
});

export const themeV4Schema = z.object({
  schema: z.literal(4),
  mode: z.enum(["light", "dark"]),
  cssVars: shadcnThemeVarsSchema.default({}),
  extras: skyCryptThemeExtrasSchema.optional(),
  metadata: metadataSchema
});

export const partialThemeV4Schema = z
  .object({
    schema: z.literal(4).optional(),
    mode: z.enum(["light", "dark"]).optional(),
    cssVars: shadcnThemeVarsSchema.optional(),
    extras: skyCryptThemeExtrasSchema.optional(),
    metadata: metadataSchema.partial().optional()
  })
  .strict();

export type ThemeV4 = z.infer<typeof themeV4Schema>;
export type PartialThemeV4 = z.infer<typeof partialThemeV4Schema>;
export type ShadcnThemeVars = z.infer<typeof shadcnThemeVarsSchema>;
export type ShadcnThemeVarKey = keyof ShadcnThemeVars;
export type SkyCryptThemeExtras = z.infer<typeof skyCryptThemeExtrasSchema>;
