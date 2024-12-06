import type { Member, Skill } from "$types/global";
import { getLevelByXp } from "./leveling/leveling";

export function getSkyblockLevel(userProfile: Member): Skill {
  const skyblockExperience = userProfile.leveling?.experience ?? 0;

  return getLevelByXp(skyblockExperience, { type: "skyblock_level" });
}
