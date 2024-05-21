export * from '$types/processed/profile/skills';

export type Stats = {
	skills: Skills;
};

export type Skills = {
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
