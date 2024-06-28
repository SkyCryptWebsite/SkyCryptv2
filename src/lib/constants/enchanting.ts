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
      icon: "/api/item/INK_SACK:12"
    },
    {
      name: "High",
      icon: "/api/item/INK_SACK:10"
    },
    {
      name: "Grand",
      icon: "/api/item/INK_SACK:11"
    },
    {
      name: "Supreme",
      icon: "/api/item/INK_SACK:14"
    },
    {
      name: "Transcendent",
      icon: "/api/item/INK_SACK:1"
    },
    {
      name: "Metaphysical",
      icon: "/api/item/INK_SACK:13"
    }
  ]
} as Record<string, Record<string, { name: string }> | { name: string; icon: string }[]>;
