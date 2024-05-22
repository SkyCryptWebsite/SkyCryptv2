import minecraftData from 'minecraft-data';
const mcData = minecraftData('1.20.5');
import fs from 'node:fs';

const files = fs.readdirSync('static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/');
for (const texture of files) {
	if (texture.endsWith('.properties')) {
		continue;
	}

	const item = texture.split('.').at(0) as string;
	if (mcData.blocksByName[item]) {
		const data = mcData.blocksByName[item];
		const properties = ['type=item', `items=minecraft:${data.name}`, `texture=${texture}`];

		fs.writeFileSync(
			`static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/${item}.properties`,
			properties.join('\n')
		);
	} else if (mcData.itemsByName[item]) {
		const data = mcData.itemsByName[item];
		const properties = ['type=item', `items=minecraft:${data.name}`, `texture=${texture}`];

		fs.writeFileSync(
			`static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/${item}.properties`,
			properties.join('\n')
		);
	} else {
		const properties = ['type=block', `items=minecraft:${item}`, `texture=${texture}`];
		fs.writeFileSync(
			`static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/${item}.properties`,
			properties.join('\n')
		);
	}
}
