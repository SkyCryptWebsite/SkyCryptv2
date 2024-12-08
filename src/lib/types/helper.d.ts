type ColorCode = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";
type FormatCode = "k" | "l" | "m" | "n" | "o";

type MuseumConstants = {
  armor_to_id: Record<string, string>;
  armor_sets: Record<string, string[]>;
  children: Record<string, string>;
  weapons: string[];
  armor: string[];
  rarities: string[];
  getAllItems: () => string[];
};
