import { getItemNetworth } from 'skyhelper-networth';
import * as constants from '$constants';
import * as helper from '$lib/helper';
import _ from 'lodash';
import type { Member, MissingPet, Pet, PetDataAbility, Pets, ProcessedItem, Profile, petData } from '$types/global';

function getPetLevel(petExp: number, offsetRarity: string, maxLevel: number) {
	const rarityOffset = constants.PET_RARITY_OFFSET[offsetRarity];
	const levels = constants.PET_LEVELS.slice(rarityOffset, rarityOffset + maxLevel - 1);

	const xpMaxLevel = levels.reduce((a, b) => a + b, 0);
	let xpTotal = 0;
	let level = 1;

	let xpForNext = Infinity;

	for (let i = 0; i < maxLevel; i++) {
		xpTotal += levels[i];

		if (xpTotal > petExp) {
			xpTotal -= levels[i];
			break;
		} else {
			level++;
		}
	}

	let xpCurrent = Math.floor(petExp - xpTotal);
	let progress;

	if (level < maxLevel) {
		xpForNext = Math.ceil(levels[level - 1]);
		progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));
	} else {
		level = maxLevel;
		xpCurrent = petExp - levels[maxLevel - 1];
		xpForNext = 0;
		progress = 1;
	}

	return {
		level,
		xpCurrent,
		xpForNext,
		progress,
		xpMaxLevel
	};
}

function getPetRarity(pet: Pet, petData: petData) {
	if (!(pet.heldItem == 'PET_ITEM_TIER_BOOST' && !pet.ignoresTierBoost)) {
		return pet.rarity;
	}

	return constants.RARITIES[
		Math.min(constants.RARITIES.indexOf(petData.maxTier), constants.RARITIES.indexOf(pet.rarity) + 1)
	];
}

function getPetName(pet: Pet, petData: petData) {
	if (pet.level && petData.hatching?.level && petData.hatching?.level > pet.level.level) {
		// Golden Dragon Pet hatching name
		return petData.hatching.name;
	} else if (petData.name) {
		// Normal pet name
		return petData.name.default;
	} else {
		// Unknown pet name
		return helper.titleCase(pet.type.replaceAll('_', ' '));
	}
}

function getProfilePets(pets: Pet[], userProfile: Member) {
	let output = [] as Pet[];
	if (pets === undefined) {
		return output;
	}

	// debug pets
	// pets = helper.generateDebugPets("GLACITE_GOLEM");

	for (const pet of pets) {
		if ('tier' in pet === false) {
			continue;
		}

		const petData = constants.PET_DATA[pet.type] ?? {
			head: '/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40',
			type: '???',
			maxTier: 'legendary',
			maxLevel: 100,
			emoji: '❓'
		};

		petData.typeGroup = petData.typeGroup ?? pet.type;

		pet.rarity = pet.tier.toLowerCase();
		pet.ignoresTierBoost = petData.ignoresTierBoost;
		/** @type {string[]} */
		const lore = [];

		pet.rarity = getPetRarity(pet, petData);

		pet.level = getPetLevel(pet.exp, petData.customLevelExpRarityOffset ?? pet.rarity, petData.maxLevel);

		// Get texture
		if (typeof petData.head === 'object') {
			pet.texture_path = petData.head[pet.rarity] ?? petData.head.default;
		} else {
			pet.texture_path = petData.head;
		}

		// Golden Dragon Pet hatching texture
		if (petData.hatching && petData.hatching?.level > pet.level.level) {
			pet.texture_path = petData.hatching.head;
		}

		if (petData.upgrades && pet.rarity in petData.upgrades) {
			pet.texture_path = petData.upgrades[pet.rarity]?.head || pet.texture_path;
		}

		let petSkin = null;
		if (pet.skin && constants.PET_SKINS[`PET_SKIN_${pet.skin}`] !== undefined) {
			pet.texture_path = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].texture;
			petSkin = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].name;
		}

		// Get first row of lore
		const loreFirstRow = ['§8'];
		if (petData.type === 'all') {
			loreFirstRow.push('All Skills');
		} else {
			loreFirstRow.push(helper.titleCase(petData.type), ' ', petData.category ?? 'Pet');

			if (petData.obtainsExp === 'feed') {
				loreFirstRow.push(', feed to gain XP');
			}

			if (petSkin) {
				loreFirstRow.push(`, ${petSkin} Skin`);
			}
		}

		lore.push(loreFirstRow.join(''), '');

		// Get name
		const petName = getPetName(pet, petData);

		const rarity = constants.RARITIES.indexOf(pet.rarity);

		const searchName = (pet.type in constants.PET_STATS ? pet.type : '???') as string;

		const petInstance = new constants.PET_STATS[searchName](rarity, pet.level.level, pet.extra, userProfile);

		pet.stats = Object.assign({}, petInstance.stats);
		// pet.ref = petInstance;

		if (pet.heldItem) {
			const { heldItem } = pet;

			if (heldItem in constants.PET_ITEMS) {
				const petItem = constants.PET_ITEMS[heldItem] ?? constants.PET_ITEMS['???'];

				for (const stat in petItem.stats) {
					pet.stats[stat] = (pet.stats[stat] ?? 0) + petItem.stats[stat];
				}

				for (const stat in petItem?.statsPerLevel) {
					pet.stats[stat] = (pet.stats[stat] ?? 0) + petItem.statsPerLevel[stat] * pet.level.level;
				}

				for (const stat in petItem?.multStats) {
					pet.stats[stat] = (pet.stats[stat] ?? 1) * petItem.multStats[stat];
				}

				if (petItem.multAllStats !== undefined) {
					for (const stat in pet.stats) {
						pet.stats[stat] = (pet.stats[stat] ?? 1) * petItem.multAllStats;
					}
				}
			}

			// push specific pet lore before stats added (mostly cosmetic)
			if (constants.PET_DATA[pet.type]?.subLore !== undefined) {
				lore.push(constants.PET_DATA[pet.type].subLore, ' ');
			}

			// push pet lore after held item stats added
			const stats = petInstance.lore(pet.stats);
			for (const line of stats) {
				lore.push(line);
			}

			// then the ability lore
			const abilities = (petInstance as unknown as PetDataAbility).abilities;
			for (const ability of abilities) {
				lore.push(' ', ability.name);

				for (const description of ability.desc) {
					lore.push(description);
				}
			}

			// now we push the lore of the held items
			const heldItemObj = constants.PET_ITEMS[heldItem] ?? constants.PET_ITEMS['???'];
			if (heldItem in constants.PET_ITEMS) {
				lore.push('', `§6Held Item: §${constants.RARITY_COLORS[heldItemObj.tier.toLowerCase()]}${heldItemObj.name}`);
				lore.push(constants.PET_ITEMS[heldItem].description);
			} else {
				lore.push('', `§6Held Item: §c${helper.titleCase(heldItem.replaceAll('_', ' '))}`);
				lore.push('§cThis item is not in our database yet. Please report it on our Discord server.');
			}

			// extra line
			lore.push(' ');
		} else {
			// no held items so push the new stats
			const stats = petInstance.lore();
			for (const line of stats) {
				lore.push(line);
			}

			const abilities = (petInstance as unknown as PetDataAbility).abilities;
			for (const ability of abilities) {
				lore.push(' ', ability.name);

				for (const description of ability.desc) {
					lore.push(description);
				}
			}

			// extra line
			lore.push(' ');
		}

		// passive perks text
		if (petData.passivePerks) {
			lore.push("§8This pet's perks are active even when the pet is not summoned!", '');
		}

		// always gains exp text
		if (petData.alwaysGainsExp) {
			lore.push('§8This pet gains XP even when not summoned!', '');

			if (typeof petData.alwaysGainsExp === 'string') {
				lore.push(`§8This pet only gains XP on the ${petData.alwaysGainsExp}§8!`, '');
			}
		}

		if (pet.level.level < petData.maxLevel) {
			lore.push(`§7Progress to Level ${pet.level.level + 1}: §e${(pet.level.progress * 100).toFixed(1)}%`);

			const progress = Math.ceil(pet.level.progress * 20);
			const numerator = pet.level.xpCurrent.toLocaleString();
			const denominator = helper.formatNumber(pet.level.xpForNext);

			lore.push(`§2${'-'.repeat(progress)}§f${'-'.repeat(20 - progress)} §e${numerator} §6/ §e${denominator}`);
		} else {
			lore.push('§bMAX LEVEL');
		}

		let progress = Math.floor((pet.exp / pet.level.xpMaxLevel) * 100);
		if (isNaN(progress)) {
			progress = 0;
		}

		lore.push(
			'',
			`§7Total XP: §e${helper.formatNumber(pet.exp)} §6/ §e${helper.formatNumber(pet.level.xpMaxLevel)} §6(${progress.toLocaleString()}%)`
		);

		if (petData.obtainsExp !== 'feed') {
			lore.push(`§7Candy Used: §e${pet.candyUsed || 0} §6/ §e10`);
		}

		if (pet.price && pet.price > 0) {
			lore.push(
				'',
				`§7Item Value: §6${Math.round(pet.price).toLocaleString()} Coins §7(§6${helper.formatNumber(pet.price)}§7)`
			);
		}

		for (const line of lore) {
			helper.addToItemLore(pet as unknown as ProcessedItem, line as string);
		}

		pet.display_name = `${petName}${petSkin ? ' ✦' : ''}`;
		pet.emoji = petData.emoji;

		output.push(pet);
	}

	// I have no idea what's going on here so I'm just going to leave it as is
	output = output.sort((a, b) => {
		if (a.active === b.active) {
			if (a.rarity == b.rarity) {
				if (a.type == b.type) {
					return a.level.level > b.level.level ? -1 : 1;
				} else {
					const maxPetA = output
						.filter((x) => x.type == a.type && x.rarity == a.rarity)
						.sort((x, y) => y.level.level - x.level.level) as Pet[];

					const maxPetALevel = maxPetA.length > 0 ? maxPetA[0].level.level : 0;

					const maxPetB = output
						.filter((x) => x.type == b.type && x.rarity == b.rarity)
						.sort((x, y) => y.level.level - x.level.level);

					const maxPetBLevel = maxPetB.length > 0 ? maxPetB[0].level.level : 0;

					if (maxPetALevel && maxPetBLevel && maxPetALevel == maxPetBLevel) {
						return a.type < b.type ? -1 : 1;
					} else {
						return maxPetALevel > maxPetBLevel ? -1 : 1;
					}
				}
			} else {
				return constants.RARITIES.indexOf(a.rarity) < constants.RARITIES.indexOf(b.rarity) ? 1 : -1;
			}
		}

		return a.active ? -1 : 1;
	});

	return output;
}

function getMissingPets(pets: Pet[], gameMode: string, userProfile: Member) {
	const profilePets = [] as Pet[];

	const missingPets = {} as Record<string, MissingPet[]>;
	const ownedPetTypes = pets.map((pet) => constants.PET_DATA[pet.type]?.typeGroup || pet.type);
	for (const [petType, petData] of Object.entries(constants.PET_DATA)) {
		if (
			ownedPetTypes.includes(petData.typeGroup ?? petType) ||
			(petData.bingoExclusive === true && gameMode !== 'bingo')
		) {
			continue;
		}

		const key = petData.typeGroup ?? petType;

		missingPets[key] ??= [];
		missingPets[key].push({
			type: petType,
			active: false,
			exp: constants.getPetExp(constants.PET_DATA[petType].maxTier, constants.PET_DATA[petType].maxLevel),
			tier: constants.PET_DATA[petType].maxTier,
			candyUsed: 0,
			heldItem: null,
			skin: null,
			uuid: helper.generateUUID()
		});
	}

	for (const pets of Object.values(missingPets)) {
		if (pets.length > 1) {
			// using exp to find the highest tier
			profilePets.push(pets.sort((a, b) => b.exp - a.exp)[0] as Pet);
			continue;
		}

		profilePets.push(pets[0] as Pet);
	}

	return getProfilePets(profilePets, userProfile);
}

function getPetScore(pets: Pet[]) {
	const highestRarity = {} as Record<string, number>;
	const highestLevel = {} as Record<string, number>;

	for (const pet of pets) {
		if (constants.PET_DATA[pet.type]?.ignoredInPetScoreCalculation === true) {
			continue;
		}

		if (!(pet.type in highestRarity) || constants.PET_VALUE[pet.rarity] > highestRarity[pet.type]) {
			highestRarity[pet.type] = constants.PET_VALUE[pet.rarity];
		}

		if (!(pet.type in highestLevel) || pet.level.level > highestLevel[pet.type]) {
			if (constants.PET_DATA[pet.type] && pet.level.level < constants.PET_DATA[pet.type].maxLevel) {
				continue;
			}

			highestLevel[pet.type] = 1;
		}
	}

	const total =
		Object.values(highestRarity).reduce((a, b) => a + b, 0) + Object.values(highestLevel).reduce((a, b) => a + b, 0);

	let bonus = {} as Record<string, number>;
	for (const score of Object.keys(constants.PET_REWARDS).reverse()) {
		if (parseInt(score) > total) {
			continue;
		}

		bonus = Object.assign({}, constants.PET_REWARDS[score as unknown as number]);

		break;
	}

	return {
		total: total,
		amount: (bonus as Record<string, number>).magic_find,
		bonus: bonus
	};
}

export async function getPets(userProfile: Member, items: ProcessedItem[], profile: Profile) {
	const output = {} as Pets;

	// Get pets from profile
	const pets = _.clone(userProfile.pets_data?.pets ?? []);

	// Adds pets from inventories
	if (items !== undefined) {
		pets.push(...(items as unknown as Pet[]));
	}

	// Add Montezume pet from the Rift
	if (userProfile.rift?.dead_cats?.montezuma !== undefined) {
		const montezumaPet = userProfile.rift.dead_cats.montezuma;
		montezumaPet.active = false;

		pets.push(montezumaPet);
	}

	if (pets.length === 0) {
		return;
	}

	for (const pet of pets) {
		await getItemNetworth(pet, { cache: true, returnItemData: false });
	}

	output.pets = getProfilePets(pets, userProfile);
	output.missing = getMissingPets(output.pets, profile.game_mode, userProfile);

	output.amount = _.uniqBy(output.pets, 'type').length;
	const totalPets =
		profile.game_mode === 'bingo'
			? Object.keys(constants.PET_DATA)
			: Object.keys(constants.PET_DATA).filter((pet) => !constants.PET_DATA[pet].bingoExclusive);
	output.total = new Set(totalPets.map((pet) => constants.PET_DATA[pet].typeGroup ?? pet)).size;

	output.amount_skins = _.uniqBy(output.pets, 'skin').length;
	output.total_skins = Object.keys(constants.PET_SKINS).length;

	output.pet_score = getPetScore(output.pets);
	output.total_pet_xp = output.pets.reduce((a, b) => a + b.exp, 0);
	output.total_candy_used = output.pets.reduce((a, b) => a + b.candyUsed, 0);

	return output;
}
