export type PackConfig = {
  id: string;
  name: string;
  version?: string;
  author: string;
  folder: string;
}[];

export const packConfigs: PackConfig = [
  {
    id: "FURFSKY_REBORN",
    name: "FurfSky Reborn",
    version: "v1.7.3",
    author: "The Reborn Team",
    folder: "FurfSky_Reborn"
  },
  {
    id: "HYPIXELPLUS",
    name: "Hypixel Plus",
    version: "v0.20.7",
    author: "ic22487",
    folder: "Hypixel_Plus"
  },
  {
    id: "SKYBLOCK_PACK",
    name: "Hypixel Skyblock Pack 16x",
    version: "v14",
    author: "Packs HQ",
    folder: "PacksHQ_16x_14"
  },
  {
    id: "RNBW_PLUS",
    name: "RNBW+",
    version: "v0.7",
    author: "rainbowcraft2",
    folder: "RNBW+_0_7"
  },
  {
    id: "VANILLA_PLUS",
    name: "Vanilla+",
    version: "v1.441",
    author: "TBlazeWarriorT",
    folder: "Vanilla+_1_441"
  },
  {
    id: "WORLDS_AND_BEYOND",
    name: "Worlds and Beyond",
    version: "v1.4.1",
    author: "Skeletony_",
    folder: "Worlds_and_Beyond_1_4_1"
  }
];
