var CHARCLASS = {
  ASSAULT: 0,
  HEAVY: 1,
  SUPPORT: 2,
  DIRECTOR: 3
};

var CHARCLASSES = [ 
  {
    name: 'ASSAULT', 
    descript: 'Speedy combatant',
    pros: ['fast-moving', 
           'high crit chance during daytime'],
    cons: ['low health',
           'takes more damage during nighttime'],
    sprite: 'assaultMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 100,
    baseDmgMultiplier: 3,
    actionCooldownTime: 200,
    startingAmmoAmount: 100
  },

  {
    name: 'HEAVY', 
    descript: 'Durable tank',
    pros: ['lots of damage', 
           'lots of health'],
    cons: ['slow-moving', 
           'slow attack speed'],
    sprite: 'heavyMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 300,
    baseDmgMultiplier: 6, 
    actionCooldownTime: 500,
    startingAmmoAmount: 200
  },

  {
    name: 'SUPPORT', 
    descript: 'Versatile healer',
    pros: ['heals self and nearby allies', 
           'gets more/better loot'],
    cons: ['low damage'],
    sprite: 'supportMock',
    entType: 0,
    baseLevel: 1,
    baseHp: 200,
    baseDmgMultiplier: 2,
    actionCooldownTime: 300,
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
    actionCooldownTime: 2000,
    startingAmmoAmount: 100
  }
];
