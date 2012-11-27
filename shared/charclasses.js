var CHARCLASS = {
  ASSAULT: 0,
  HEAVY: 1,
  SUPPORT: 2,
  DIRECTOR: 3
};

var CHARCLASSES = [ 
  {
    name: 'ASSAULT', 
    descript: 'High damage combatant',
    pros: ['high damage', 'fast'],
    cons: ['low health'],
    sprite: 'assaultMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 100,
    actionCooldownTime: 200,
    startingAmmoAmount: 100
  },

  {
    name: 'HEAVY', 
    descript: 'Durable tank',
    pros: ['lots of health'],
    cons: ['slow'],
    sprite: 'heavyMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 300,
    actionCooldownTime: 300,
    startingAmmoAmount: 200
  },

  {
    name: 'SUPPORT', 
    descript: 'Versatile healer',
    pros: ['heals nearby allies'],
    cons: ['low health'],
    sprite: 'supportMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 200,
    actionCooldownTime: 250,
    startingAmmoAmount: 150
  },

  {
    name: 'DIRECTOR', 
    descript: 'Really evil',
    pros: ['nothing'],
    cons: ['everything'],
    sprite: 'directorMock',
    entType: 1,
    baseLevel: 99,
    baseHp: 1000000,
    actionCooldownTime: 1500,
    startingAmmoAmount: 20
  }
];
