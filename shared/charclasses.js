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
    pros: ['special: fires multiple bullets at once',
           'fast-moving', 
           'high crit chance'],
    cons: ['low health',
           'low starting ammo'],
    sprite: 'assault',
    entType: 0,
    baseLevel: 1,
    baseHp: 500,
    baseDmgMultiplier: 2,
    critChance: 0.4,
    actionCooldownTime: 300,
    startingAmmoAmount: 750,
    speed: 7,
    maxSpeed: 8,
    ability2: 10
  },

  {
    name: 'HEAVY', 
    descript: 'Durable tank',
    pros: ['special: fire a massive bullet',
           'lots of damage', 
           'lots of health',
           'lots of ammo'],
    cons: ['slow-moving', 
           'slow attack speed'],
    sprite: 'heavy',
    entType: 0,
    baseLevel: 1,
    baseHp: 1500,
    baseDmgMultiplier: 7, 
    critChance: 0.2,
    actionCooldownTime: 500,
    startingAmmoAmount: 2000,
    speed: 3,
    maxSpeed: 4
  },

  {
    name: 'SUPPORT', 
    descript: 'Versatile healer',
    pros: ['special: heals self and nearby allies', 
           'double ammo boxes and medkits'],
    cons: ['low damage'],
    sprite: 'support',
    entType: 0,
    baseLevel: 1,
    baseHp: 750,
    baseDmgMultiplier: 2,
    critChance: 0.2,
    actionCooldownTime: 300,
    startingAmmoAmount: 1000,
    speed: 5,
    maxSpeed: 6
  },

  {
    name: 'DIRECTOR', 
    descript: 'Really evil',
    pros: ['special: summon a powerful minion'],
    cons: ['terrible manners'],
    sprite: 'director',
    entType: 1,
    baseLevel: 99,
    baseHp: 99999,
    actionCooldownTime: 3000,
    startingAmmoAmount: 100,
    speed: 3,
    maxSpeed: 5,
    expOnHit: 1
  }
];
