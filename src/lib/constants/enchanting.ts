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
  },
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
  ]
} as Record<string, Record<string, { name: string }> | { name: string; texture: string }[]>;
