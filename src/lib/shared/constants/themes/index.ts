import aprilFools2024Theme from "./april-fools-2024.json";
import burningCinnabarTheme from "./burning-cinnabar.json";
import candycaneTheme from "./candycane.json";
import defaultTheme from "./default.json";
import draconicTheme from "./draconic.json";
import lightTheme from "./light.json";
import nightblueTheme from "./nightblue.json";
import skyleaTheme from "./skylea.json";
import sunrise from "./sunrise.json";
import warpwing from "./warpwing.json";

export type Theme = {
  id: string;
  name: string;
  author: string;
  schema: number;
  light?: boolean;
  enchanted_glint?: string;
  images?: {
    [key: string]: string;
  };
  backgrounds?: {
    [key: string]:
      | {
          type: "color";
          color: string;
        }
      | {
          type: "stripes";
          angle: string;
          colors: string[];
          width: number;
        };
  };
  colors?: { [key: string]: string };
};

const themes: Theme[] = [defaultTheme as Theme, aprilFools2024Theme as Theme, burningCinnabarTheme as Theme, candycaneTheme as Theme, draconicTheme as Theme, lightTheme as Theme, nightblueTheme as Theme, skyleaTheme as Theme, sunrise as Theme, warpwing as Theme];
export default themes;
