import fs from 'node:fs';

type Data = {
	name: string;
	icon: {
		item: string;
		texture: string;
	};
	mobs: { name: string; cap: number; texture: string; mobs: number; bracket: string; item?: string }[];
};

function getTexture(texture: string) {
	const textureData = JSON.parse(Buffer.from(texture, 'base64').toString('utf-8'));

	return '/head/' + textureData.textures.SKIN.url.split('/').at(-1);
}

function formatMobs(mobs: Data['mobs']) {
	const output = [] as Data['mobs'];

	for (const mob of mobs) {
		output.push({
			name: mob.name.replace(/§[0-9a-fk-or]/g, ''),
			cap: mob.cap,
			texture: mob.texture ? getTexture(mob.texture) : `/api/item/${mob.item?.toUpperCase()}`,
			mobs: mob.mobs,
			bracket: mob.bracket
		});
	}

	return output;
}

function formatCategory(data: Data, mobs: Data['mobs']) {
	return {
		name: data.name,
		texture: data.icon.item ? `/api/item/${data.icon.item}` : getTexture(data.icon.texture),
		mobs: formatMobs(mobs)
	};
}

async function main() {
	const bestiary = await fetch(
		'https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/prerelease/constants/bestiary.json'
	).then((res) => res.json());

	const output = {};
	for (const key in bestiary) {
		if (key === 'brackets') {
			continue;
		}

		const islandData = bestiary[key] as Record<string, Data>;
		if (islandData.hasSubcategories) {
			for (const [category, data] of Object.entries(islandData)) {
				if (data.mobs === undefined) {
					continue;
				}

				output[category] = formatCategory(data, data.mobs);
			}
			continue;
		}

		output[key] = formatCategory(islandData as unknown as Data, bestiary[key].mobs);
	}

	fs.writeFileSync('tools/bestiary.json', JSON.stringify(output, null, 2));
}

main();
