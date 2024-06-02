const input = {
	1: {
		otherNums: [1, 0.1, 1],
		statNums: {
			STRENGTH: 0.75,
			CRIT_CHANCE: 0.05,
			FEROCITY: 0.25
		}
	},
	100: {
		otherNums: [100, 10, 100],
		statNums: {
			STRENGTH: 75,
			CRIT_CHANCE: 5,
			FEROCITY: 25
		}
	}
};

const level = 93;

const minLevel = 1;
const maxLevel = 100;
const lvl1 = input['1'];
const lvl100 = input['100'];

const progress = (level - minLevel) / (maxLevel - minLevel);

const output = { ...lvl1.statNums, ...lvl1.otherNums };
for (const key in output) {
	const lowStat = lvl1.statNums[key] || lvl1.otherNums[key];
	const highStat = lvl100.statNums[key] || lvl100.otherNums[key];

	output[key] = lowStat + (highStat - lowStat) * progress;
}

console.log(output);
