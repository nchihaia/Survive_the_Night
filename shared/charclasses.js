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
           'high crit chance'],
    cons: ['low health'],
    sprite: 'assault',
    entType: 0,
    baseLevel: 1,
    baseHp: 200,
    baseDmgMultiplier: 2,
    critChance: 0.4,
    actionCooldownTime: 300,
    startingAmmoAmount: 200,
    speed: 7,
    maxSpeed: 8
  },

  {
    name: 'HEAVY', 
    descript: 'Durable tank',
    pros: ['lots of damage', 
           'lots of health',
           'lots of ammo'],
    cons: ['slow-moving', 
           'slow attack speed'],
    sprite: 'heavy',
    entType: 0,
    baseLevel: 1,
    baseHp: 1200,
    baseDmgMultiplier: 9, 
    critChance: 0.2,
    actionCooldownTime: 500,
    startingAmmoAmount: 500,
    speed: 3,
    maxSpeed: 4
  },

  {
    name: 'SUPPORT', 
    descript: 'Versatile healer',
    pros: ['heals self and nearby allies', 
           'double ammo boxes and medkits'],
    cons: ['low damage'],
    sprite: 'support',
    entType: 0,
    baseLevel: 1,
    baseHp: 400,
    baseDmgMultiplier: 2,
    critChance: 0.2,
    actionCooldownTime: 300,
    startingAmmoAmount: 200,
    speed: 5,
    maxSpeed: 6
  },

  {
    name: 'DIRECTOR', 
    descript: 'Really evil',
    pros: ['nothing'],
    cons: ['everything'],
    sprite: 'director',
    entType: 1,
    baseLevel: 99,
    baseHp: 1000000,
    actionCooldownTime: 2000,
    startingAmmoAmount: 100,
    speed: 3,
    maxSpeed: 3
  }
];
