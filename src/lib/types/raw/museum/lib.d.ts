import type { ProcessedItem } from "$types/global";

export type MuseumRawResponse = {
  [key: string]: MuseumRaw;
};

export type MuseumRaw = {
  value: number;
  appraised: boolean;
  items: Record<
    string,
    {
      donated_time: number;
      featured_slot: string;
      borrowing: boolean;
      items: {
        type: number;
        data: string;
      };
    }
  >;
  special: {
    donated_time: number;
    items: {
      type: number;
      data: string;
    };
  }[];
};

type MuseumItem = ProcessedItem & {
  position: number;
  containsItems: ProcessedItem[];
};
