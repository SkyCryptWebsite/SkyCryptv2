export type ResourcePack = {
  base_path: string;
  config: {
    id: string;
    name: string;
    version: string;
    author: string;
    url: string;
    priority: number;
    default: boolean;
    hash: string;
  };
  files?: string[];
  textures: ItemTexture[];
};

export type ItemTexture = {
  weight: number;
  animated: boolean;
  file: string;
  match: {
    value: string;
    regex: string;
  }[];
  leather: {
    base: string;
    overlay: string;
  };
  path: string;
  id: number;
  damage: number;
  skyblock_id: string;
};

export type OutputResourcePack = {
  base_path: string;
  id: string;
  name: string;
  version: string;
  author: string;
  url: string;
  priority: number;
  hash: string;
};

export type TextureModel = {
  parent: string;
  textures: { [key: string]: string };
  display: {
    [string]: { rotation: []; translation: []; scale: [] };
  };
};

export type TextureAnimation = {
  frames?: AnimationFrame[];
  frametime: number;
  interpolate?: boolean;
};

export type AnimationFrame = {
  index: number;
  time: number;
  totalTime?: number;
};

export type OutputTexture = {
  pack: {
    base_path: string;
    config: {
      id: string;
      name: string;
      version: string;
      author: string;
      url: string;
      priority: number;
      hash: string;
    };
  };
  weight: number;
  animated?: boolean;
  file: string;
  path: string;
  debug: CustomResourcesDebugStats;
  skyblock_id: string;
};
