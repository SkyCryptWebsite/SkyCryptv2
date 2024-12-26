export type PlayerResponse = {
  success: boolean;
  cause?: string;
  player: Player;
};

export type Player = {
  displayname: string;
  achievements: Achievements;
  newPackageRank?: string;
  monthlyRankColor?: string;
  monthlyPackageRank?: string;
  prefix: string;
  rank: string;
  socialMedia?: SocialMedia;
  rankPlusColor?: string;
  packageRank?: string;
};

export type Achievements = {
  [key?: string]: number;
};

export type SocialMedia = {
  links?: {
    [key: string]: string;
  };
};
