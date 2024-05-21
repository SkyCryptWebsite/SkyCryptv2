import type { Member, Profile, Skills } from '$types/global';
import { getLevelByXp, getSkillLevelCaps, getSocialSkillExperience } from './skills/leveling';

export function getSkills(userProfile: Member, profile: Profile): Skills {
	const output = {};

	const skillLevelCaps = getSkillLevelCaps(userProfile, {});
	if (userProfile.player_data?.experience) {
		const skills = userProfile.player_data.experience;

		const socialExperience = getSocialSkillExperience(profile);

		Object.assign(output, {
			taming: getLevelByXp(skills.SKILL_TAMING || 0, { type: 'taming', cap: skillLevelCaps.taming }),
			farming: getLevelByXp(skills.SKILL_FARMING || 0, { type: 'farming', cap: skillLevelCaps.farming }),
			mining: getLevelByXp(skills.SKILL_MINING || 0, { type: 'mining' }),
			combat: getLevelByXp(skills.SKILL_COMBAT || 0, { type: 'combat' }),
			foraging: getLevelByXp(skills.SKILL_FORAGING || 0, { type: 'foraging' }),
			fishing: getLevelByXp(skills.SKILL_FISHING || 0, { type: 'fishing' }),
			enchanting: getLevelByXp(skills.SKILL_ENCHANTING || 0, { type: 'enchanting' }),
			alchemy: getLevelByXp(skills.SKILL_ALCHEMY || 0, { type: 'alchemy' }),
			carpentry: getLevelByXp(skills.SKILL_CARPENTRY || 0, { type: 'carpentry' }),
			runecrafting: getLevelByXp(skills.SKILL_RUNECRAFTING || 0, {
				type: 'runecrafting',
				cap: skillLevelCaps.runecrafting
			}),
			social: getLevelByXp(socialExperience, { type: 'social' })
		});
	}

	return output;
}
