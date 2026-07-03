import type { ThemeV5 } from "../schema";

export const defaultTheme = {
  schema: 5,
  modes: {
    dark: {
      cssVars: {}
    },
    light: {
      cssVars: {}
    }
  },
  metadata: {
    id: "default",
    name: "Default Theme",
    author: "SkyCrypt Team",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1
  }
} satisfies ThemeV5;
