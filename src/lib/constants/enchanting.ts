export const EXPERIMENTS = {
  games: {
    simon: {
      name: "Chronomatron"
    },
    numbers: {
      name: "Ultrasequencer"
    },
    pairings: {
      name: "Superpairs"
    }
  } as Record<string, { name: string }>,
  tiers: [
    {
      name: "Beginner",
      texture: "/api/item/INK_SACK:12"
    },
    {
      name: "High",
      texture: "/api/item/INK_SACK:10"
    },
    {
      name: "Grand",
      texture: "/api/item/INK_SACK:11"
    },
    {
      name: "Supreme",
      texture: "/api/item/INK_SACK:14"
    },
    {
      name: "Transcendent",
      texture: "/api/item/INK_SACK:1"
    },
    {
      name: "Metaphysical",
      texture: "/api/item/INK_SACK:13"
    }
  ] as Record<number, { name: string; texture: string }>
};
