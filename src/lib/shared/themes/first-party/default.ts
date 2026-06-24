import type { ThemeV4 } from "../schema";

export const defaultTheme = {
  schema: 4,
  mode: "dark",
  cssVars: {},
  extras: {
    minecraft: {
      palette: "nice-light"
    },
    pageBackground: {
      url: "https://sky.shiiyu.moe/img/bg.avif"
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
} satisfies ThemeV4;
