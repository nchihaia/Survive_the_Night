var MINIONTYPE = {
  BASIC: 0,
  SUPER: 1
};

var MINIONTYPES = [
  {
    name: 'Basic Minion',
    sprite: [
      {
        image: 'basic_minion_A',
        width: 39,
        height: 48
      },
      {
        image: 'basic_minion_B',
        width: 32,
        height: 48
      },
      {
        image: 'basic_minion_C',
        width: 32,
        height: 48
      },
      {
        image: 'basic_minion_D',
        width: 32,
        height: 48
      },
      {
        image: 'basic_minion_E',
        width: 48,
        height: 53 
      },
      {
        image: 'basic_minion_F',
        width: 35,
        height: 45 
      }
    ],
    entType: 1,
    baseHp: 100,
    actionCooldownTime: 3000,
    damage: 1,
    critChance: 0.05,
    // How many points do the survivors get when this minion is slain
    points: 5,
    speed: 1,
    maxSpeed: 1,
    // How many xp a player gains when the player lands a hit on the minion
    expOnHit: 5
  },

  {
    name: 'Super Minion',
    sprite: [
      {
        image: 'super_minion_A',
        width: 96,
        height: 96 
      },
      {
        image: 'super_minion_B',
        width: 96,
        height: 96
      },
      {
        image: 'super_minion_C',
        width: 96,
        height: 96
      }
    ],
    entType: 1,
    baseHp: 500,
    actionCooldownTime: 4000,
    damage: 10,
    critChance: 0.2,
    points: 20,
    speed: 2,
    maxSpeed: 2,
    expOnHit: 20
  }
];
