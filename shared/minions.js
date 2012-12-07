var MINIONTYPE = {
  BASIC: 0,
  SUPER: 1
};

var MINIONTYPES = [
  {
    name: 'Basic Minion',
    sprite: 'enemyMock',
    spriteWidth: 39,
    spriteHeight: 48,
    entType: 1,
    baseHp: 10,
    actionCooldownTime: 1000,
    damage: 5,
    // How many points do the survivors get when this minion is slain
    points: 10,
    speed: 3,
    maxSpeed: 4
  },

  {
    name: 'Super Minion',
    sprite: 'assaultMock',
    spriteWidth: 32,
    spriteHeight: 48,
    entType: 1,
    baseHp: 30,
    actionCooldownTime: 1500,
    damage: 5,
    // How many points do the survivors get when this minion is slain
    points: 200,
    speed: 3,
    maxSpeed: 4
  }
];
