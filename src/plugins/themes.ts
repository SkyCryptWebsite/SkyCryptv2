import plugin from "tailwindcss/plugin";
import themes from "../lib/shared/constants/themes";
import defaultTheme from "../lib/shared/constants/themes/default.json";

// Define the possible background types
type StripeBackground = {
  type: "stripes";
  angle: string;
  colors: string[];
  width: number;
};

type ColorBackground = {
  type: "color";
  color: string;
};

// Ensure Theme backgrounds has required properties
type ThemeBackgrounds = {
  skillbar?: StripeBackground | ColorBackground;
  maxedbar?: StripeBackground | ColorBackground;
};

// Update Theme type to include proper background typing
type Background = Extract<NonNullable<ThemeBackgrounds["skillbar" | "maxedbar"]>, StripeBackground>;

const generateStripeBackground = (bg: Background | undefined) => {
  if (!bg || bg.type !== "stripes") {
    return "none";
  }

  return `repeating-linear-gradient(
    ${bg.angle},
    hsl(${bg.colors[0]}) 0px,
    hsl(${bg.colors[0]}) ${bg.width}px,
    hsl(${bg.colors[1]}) ${bg.width}px,
    hsl(${bg.colors[1]}) ${bg.width * 2}px
  )`;
};

type ThemeStyles = {
  [key: string]: string;
};

// For each theme, add the theme's colors to a new class in the base styles
const scThemePlugin = plugin(function ({ addBase }) {
  // Generate theme classes
  themes.forEach((theme) => {
    const styles: ThemeStyles = {
      "--icon": theme.colors?.icon ?? defaultTheme.colors.icon,
      "--link": theme.colors?.link ?? defaultTheme.colors.link,
      "--hover": theme.colors?.hover ?? defaultTheme.colors.hover,
      "--maxed": theme.colors?.maxed ?? defaultTheme.colors.maxed,
      "--gold": theme.colors?.gold ?? defaultTheme.colors.gold
    };

    // Add background image if specified
    if (theme.images?.bg) {
      styles["--bg-url"] = `url(${theme.images.bg})`;
    }

    // Add custom backgrounds
    if (theme.backgrounds?.skillbar && theme.backgrounds.skillbar.type === "stripes") {
      styles["--skillbar"] = generateStripeBackground(theme.backgrounds.skillbar);
    } else if (theme.backgrounds?.skillbar && theme.backgrounds.skillbar.type === "color") {
      styles["--skillbar"] = `hsl(${theme.backgrounds.skillbar.color} / 1)`;
    } else {
      styles["--skillbar"] = `hsl(${defaultTheme.backgrounds.skillbar.color} / 1)`;
    }

    if (theme.backgrounds?.maxedbar && theme.backgrounds.maxedbar.type === "stripes") {
      styles["--maxedbar"] = generateStripeBackground(theme.backgrounds.maxedbar);
    } else if (theme.backgrounds?.maxedbar && theme.backgrounds.maxedbar.type === "color") {
      styles["--maxedbar"] = `hsl(${theme.backgrounds.maxedbar.color} / 1)`;
    } else {
      styles["--maxedbar"] = `hsl(${defaultTheme.backgrounds.maxedbar.color} / 1)`;
    }

    addBase({
      [`:root[data-theme="${theme.id}"]`]: { ...styles }
    });
  });
});

export default scThemePlugin;
