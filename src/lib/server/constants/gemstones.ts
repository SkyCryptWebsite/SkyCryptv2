export const GEMSTONES = {
  JADE: {
    name: "Jade",
    color: "a",
    stats: {
      ROUGH: {
        mining_fortune: [2, 4, 6, 8, 10, 12, 14]
      },
      FLAWED: {
        mining_fortune: [3, 5, 7, 10, 14, 18, 22]
      },
      FINE: {
        mining_fortune: [5, 7, 10, 15, 20, 25, 30]
      },
      FLAWLESS: {
        mining_fortune: [7, 10, 15, 20, 27, 35, 44]
      },
      PERFECT: {
        mining_fortune: [10, 14, 20, 30, 40, 50, 60]
      }
    }
  },
  AMBER: {
    name: "Amber",
    color: "6",
    stats: {
      ROUGH: {
        mining_speed: [4, 8, 12, 16, 20, 24, 28]
      },
      FLAWED: {
        mining_speed: [6, 10, 14, 18, 24, 30, 36]
      },
      FINE: {
        mining_speed: [10, 14, 20, 28, 36, 45, 54]
      },
      FLAWLESS: {
        mining_speed: [14, 20, 30, 44, 58, 75, 92]
      },
      PERFECT: {
        mining_speed: [20, 28, 40, 60, 80, 100, 120]
      }
    }
  },
  TOPAZ: {
    name: "Topaz",
    color: "e",
    stats: {
      ROUGH: {
        pristine: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5]
      },
      FLAWED: {
        pristine: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9]
      },
      FINE: {
        pristine: [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.3]
      },
      FLAWLESS: {
        pristine: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.8]
      },
      PERFECT: {
        pristine: [2, 2, 2, 2, 2, 2, 2.2]
      }
    }
  },
  SAPPHIRE: {
    name: "Sapphire",
    color: "b",
    stats: {
      ROUGH: {
        intelligence: [2, 3, 4, 5, 6, 7, null]
      },
      FLAWED: {
        intelligence: [5, 5, 6, 7, 8, 10, null]
      },
      FINE: {
        intelligence: [7, 8, 9, 10, 11, 12, null]
      },
      FLAWLESS: {
        intelligence: [10, 11, 12, 14, 17, 20, null]
      },
      PERFECT: {
        intelligence: [12, 14, 17, 20, 24, 30, null]
      }
    }
  },
  AMETHYST: {
    name: "Amethyst",
    color: "5",
    stats: {
      ROUGH: {
        defense: [1, 2, 3, 4, 5, 7, null]
      },
      FLAWED: {
        defense: [3, 4, 5, 6, 8, 10, null]
      },
      FINE: {
        defense: [4, 5, 6, 8, 10, 14, null]
      },
      FLAWLESS: {
        defense: [5, 7, 10, 14, 18, 22, null]
      },
      PERFECT: {
        defense: [6, 9, 13, 18, 24, 30, null]
      }
    }
  },
  JASPER: {
    name: "Jasper",
    color: "d",
    stats: {
      ROUGH: {
        strength: [1, 1, 1, 2, 3, 4, null]
      },
      FLAWED: {
        strength: [2, 2, 3, 4, 4, 5, null]
      },
      FINE: {
        strength: [3, 3, 4, 5, 6, 7, null]
      },
      FLAWLESS: {
        strength: [5, 6, 7, 8, 10, 12, null]
      },
      PERFECT: {
        strength: [6, 7, 9, 11, 13, 16, null]
      }
    }
  },
  RUBY: {
    name: "Ruby",
    color: "c",
    stats: {
      ROUGH: {
        health: [1, 2, 3, 4, 5, 7, null]
      },
      FLAWED: {
        health: [3, 4, 5, 6, 8, 10, null]
      },
      FINE: {
        health: [4, 5, 6, 8, 10, 14, null]
      },
      FLAWLESS: {
        health: [5, 7, 10, 14, 18, 22, null]
      },
      PERFECT: {
        health: [6, 9, 13, 18, 24, 30, null]
      }
    }
  },
  OPAL: {
    name: "Opal",
    color: "f",
    stats: {
      ROUGH: {
        true_defense: [1, 1, 1, 2, 2, 3, null]
      },
      FLAWED: {
        true_defense: [2, 2, 2, 3, 3, 4, null]
      },
      FINE: {
        true_defense: [3, 3, 3, 4, 4, 5, null]
      },
      FLAWLESS: {
        true_defense: [4, 4, 5, 6, 8, 9, null]
      },
      PERFECT: {
        true_defense: [5, 6, 7, 9, 11, 13, null]
      }
    }
  },
  AQUAMARINE: {
    name: "Aquamarine",
    color: "3",
    stats: {
      ROUGH: {
        sea_creature_chance: [0.1, 0.1, 0.2, 0.2, 0.3, 0.4, null]
      },
      FLAWED: {
        sea_creature_chance: [0.2, 0.2, 0.3, 0.4, 0.6, 0.8, null]
      },
      FINE: {
        sea_creature_chance: [0.5, 0.6, 0.7, 0.8, 1, 1.2, null]
      },
      FLAWLESS: {
        sea_creature_chance: [0.9, 1, 1.1, 1.2, 1.4, 1.6, null]
      },
      PERFECT: {
        sea_creature_chance: [1.3, 1.4, 1.5, 1.6, 1.8, 2, null]
      }
    }
  },
  CITRINE: {
    name: "Citrine",
    color: "4",
    stats: {
      ROUGH: {
        foraging_fortune: [0.5, 1, 1.5, 2, 2.5, 3, null]
      },
      FLAWED: {
        foraging_fortune: [1, 1.5, 2, 2.5, 3, 4, null]
      },
      FINE: {
        foraging_fortune: [1.5, 2, 3, 4, 5, 6, null]
      },
      FLAWLESS: {
        foraging_fortune: [2, 3, 4, 5, 6, 8, null]
      },
      PERFECT: {
        foraging_fortune: [3, 4, 5, 6, 8, 10, null]
      }
    }
  },
  ONYX: {
    name: "Onyx",
    color: "8",
    stats: {
      ROUGH: {
        critical_damage: [1, 1, 2, 2, 3, 4, null]
      },
      FLAWED: {
        critical_damage: [2, 2, 3, 3, 4, 6, null]
      },
      FINE: {
        critical_damage: [3, 3, 4, 5, 6, 8, null]
      },
      FLAWLESS: {
        critical_damage: [4, 5, 6, 7, 8, 10, null]
      },
      PERFECT: {
        critical_damage: [5, 6, 7, 8, 10, 12, null]
      }
    }
  },
  PERIDOT: {
    name: "Peridot",
    color: "2",
    stats: {
      ROUGH: {
        farming_fortune: [0.5, 1, 1.5, 2, 2.5, 3, null]
      },
      FLAWED: {
        farming_fortune: [1, 1.5, 2, 2.5, 3, 4, null]
      },
      FINE: {
        farming_fortune: [1.5, 2, 3, 4, 5, 6, null]
      },
      FLAWLESS: {
        farming_fortune: [2, 3, 4, 5, 6, 8, null]
      },
      PERFECT: {
        farming_fortune: [3, 4, 5, 6, 8, 10, null]
      }
    }
  }
};
