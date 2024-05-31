export const DOJO = {
	sword_swap: {
		name: 'Discipline',
		texture: '/api/itemDIAMOND_SWORD'
	},
	fireball: {
		name: 'Tenacity',
		texture: '/api/itemFIRE_CHARGE'
	},
	archer: {
		name: 'Mastery',
		texture: '/api/itemBOW'
	},
	lock_head: {
		name: 'Control',
		texture: '/api/itemENDER_EYE'
	},
	snake: {
		name: 'Swiftness',
		texture: '/api/itemLEAD'
	},
	wall_jump: {
		name: 'Stamina',
		texture: '/api/itemRABBIT_FOOT'
	},
	mob_kb: {
		name: 'Force',
		texture: '/api/itemSTICK'
	}
} as Record<string, { name: string; texture: string }>;

export const KUUDRA_TIERS = {
	none: {
		name: 'Basic',
		head: '/head/bfd3e71838c0e76f890213120b4ce7449577736604338a8d28b4c86db2547e71'
	},
	hot: {
		name: 'Hot',
		head: '/head/c0259e8964c3deb95b1233bb2dc82c986177e63ae36c11265cb385180bb91cc0'
	},
	burning: {
		name: 'Burning',
		head: '/head/330f6f6e63b245f839e3ccdce5a5f22056201d0274411dfe5d94bbe449c4ece'
	},
	fiery: {
		name: 'Fiery',
		head: '/head/bd854393bbf9444542502582d4b5a23cc73896506e2fc739d545bc35bc7b1c06'
	},
	infernal: {
		name: 'Infernal',
		head: '/head/82ee25414aa7efb4a2b4901c6e33e5eaa705a6ab212ebebfd6a4de984125c7a0'
	}
} as Record<string, { name: string; head: string }>;
