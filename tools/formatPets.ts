const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
const petData = {
  uuid: "549130f4-2595-4dc3-9608-a5864627b62a",
  uniqueId: "ad8b0927-145f-4bcd-9e71-1f9f63ded009",
  type: "MAMMOTH",
  exp: 710.597694494,
  active: false,
  tier: "LEGENDARY",
  heldItem: null,
  candyUsed: 0,
  skin: "PARROT_GOLD_MACAW"
};

const petItemId = `${petData.type};${RARITIES.indexOf(petData.tier)}`;

function replaceVariables(template, variables) {
  return template.replace(/\{(\w+)\}/g, (match, name) => variables[name] ?? match);
}

function round(n: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

async function getData() {
  const itemData = await fetch(`https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/items/${petItemId}.json`).then((res) => res.json());

  const petNumsResponse = await fetch("https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/constants/petnums.json").then((res) => res.json());

  const level = 2;

  const minLevel = 1;
  const maxLevel = 100;

  const petDataLevel1 = petNumsResponse[petData.type][petData.tier]["1"];
  const petDataLevel100 = petNumsResponse[petData.type][petData.tier]["100"];

  const statPerLevel = (level - minLevel) / (maxLevel - minLevel);

  const output = { ...petDataLevel1.statNums, ...petDataLevel1.otherNums };
  for (const key in output) {
    const lowStat = petDataLevel1.statNums[key] || petDataLevel1.otherNums[key];
    const highStat = petDataLevel100.statNums[key] || petDataLevel100.otherNums[key];

    output[key] = round(lowStat + (highStat - lowStat) * statPerLevel, 2);
  }

  Object.assign(output, { LVL: level });
  console.log(replaceVariables(itemData.displayname, output));
  for (const line of itemData.lore) {
    console.log(replaceVariables(line, output));
  }
}

getData();
