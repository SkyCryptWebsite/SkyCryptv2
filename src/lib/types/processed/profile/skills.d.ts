export type Extra = {
  type: string;
  cap?: number;
  texture?: string;
};

export type Skill = {
  xp: number;
  level: number;
  maxLevel: number;
  xpCurrent: number;
  xpForNext: number;
  progress: number;
  levelCap: number;
  uncappedLevel: number;
  levelWithProgress: number;
  unlockableLevelWithProgress: number;
  rank?: number;
  texture: string;
  maxed: boolean;
};

export type Skills = {
  skills: SkillsData;
  disabled?: boolean;
  totalSkillXp: number;
  averageSkillLevel: number;
  averageSkillLevelWithProgress: number;
};

export type SkillsData = {
  fishing: Skill;
  alchemy: Skill;
  runecrafting: Skill;
  mining: Skill;
  farming: Skill;
  enchanting: Skill;
  taming: Skill;
  foraging: Skill;
  social: Skill;
  carpentry: Skill;
  combat: Skill;
};
