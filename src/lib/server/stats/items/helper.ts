export function addLevelableEnchantmentsToLore(
  amount: number,
  constant: {
    name: string;
    ladder: number[];
  },
  itemLore: string[]
) {
  itemLore.push("", `§7${constant.name}: §c${amount.toLocaleString()}`);
  if (amount >= (constant.ladder.at(-1) ?? 100)) {
    itemLore.push(`§8MAXED OUT!`);
  } else {
    let toNextLevel = 0;
    for (const e of constant.ladder) {
      if (amount < e) {
        toNextLevel = e - amount;
        break;
      }
    }
    itemLore.push(`§8${toNextLevel.toLocaleString()} to tier up!`);
  }
}
