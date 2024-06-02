interface ItemMap {
	[key: string]: string[];
}

function getSeparateChains(itemMap: ItemMap): { chains: string[][]; aliases: string[][] } {
	const visited = new Set<string>();
	const inStack = new Set<string>();
	const chains: string[][] = [];
	const aliases: string[][] = [];

	const reverseMap: { [key: string]: string[] } = {};
	for (const key in itemMap) {
		itemMap[key].forEach((value) => {
			if (!reverseMap[value]) {
				reverseMap[value] = [];
			}
			reverseMap[value].push(key);
		});
	}

	const roots = Object.keys(itemMap).filter((key) => !reverseMap[key]);

	function dfs(item: string, chain: string[], isAliasCheck: boolean) {
		if (visited.has(item)) {
			if (inStack.has(item)) {
				const cycle = chain.slice(chain.indexOf(item));
				aliases.push(cycle);
			}
			return;
		}

		visited.add(item);
		inStack.add(item);
		chain.push(item);

		if (itemMap[item]) {
			for (const subItem of itemMap[item]) {
				dfs(subItem, chain, isAliasCheck);
			}
		}

		inStack.delete(item);
	}

	roots.forEach((root) => {
		if (!visited.has(root)) {
			const chain: string[] = [];
			dfs(root, chain, false);
			chains.push(chain);
		}
	});

	Object.keys(itemMap).forEach((key) => {
		if (!visited.has(key)) {
			const chain: string[] = [];
			dfs(key, chain, true);
		}
	});

	return { chains, aliases };
}

async function getAccessories() {
	const response = await fetch(
		'https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/constants/misc.json'
	).then((res) => res.json());

	const input = response.talisman_upgrades as ItemMap;

	const output = getSeparateChains(input);
	console.log('Chains:', output.chains);
	console.log('Aliases:', output.aliases);
}

getAccessories();
