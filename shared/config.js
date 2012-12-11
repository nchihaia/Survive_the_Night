var GAMECFG = {

  /*
  * Gameplay
  */
  // The amount of ammo cost to perform an ability
  basicAttackAmmoCost: 1,
  specialAttackAmmoCost: 20, 

  // Minions do 10 times more damage at night
  minionDmgNighttime: 10,
  // Survivors do 2 times more damage in the daytime
  survivorsDmgDaytime: 2,

  // Critical hits grant 3 times more damage
  critDmgMultiplier: 3,

  // the range of the 'heal close' ability
  healCloseRange: 300,

  // 'heal close' will heal for 10 times the player level
  healCloseMultiplier: 10,

  // How many bullets does shootLots spawn
  numberBulletsShootLots: 10,

  // A 'big shot' does 5 times more damage
  bigShotMultiplier: 5,

  // How many points does a team need to win the game
  pointsToWin: 1000,

  /*
   * General
   */
  // Game fps (reasonably low for maximum compatiblity across all clients)
  fps: 30,
  
  // Game server url
  server: 'http:\/\/localhost:5000',

  // How many in-game minutes goes by for each real life second
  gameMinutesPerSecond: 10,

  // How many times per second for the client to send an update packet to the server
  clientUpdatesPerSecond: 10,

  // How many times per second for the server to an update packet to all 
  // in-game clients
  serverUpdatesPerSecond: 20,

  // 0: log ouput disabled
  // 1: important info
  // 2: game actions info
  // 3: general client/server info
  // 4: packet receive/send info
  logLevel: 2,

  // How many seconds to wait start the game after the first client gives 
  // the ready signal. This is to prevent an idle client from keeping a game 
  // from starting.
  timeBeforeGameStart: 1,

  // Number of seconds to count down before a game begins
  countdownTime: 1,

  // The x and y coordinates of where a survivor entity spawns
  survivorStartingXPos: 1130,
  survivorStartingYPos: 160,

  // The x and y coordinates of where a director entity spawns
  directorStartingXPos: 100,
  directorStartingYPos: 800,

  // The mininum of max opacity for the color layer representing day and night
  minLightOpacity: 0,
  maxLightOpacity: 0.75,

  // Whether or not to have only 1 director
  directorClassRestrict: true,

  // Time to start the game (in minutes after midnight on the first day)
  // 600 => 10:00 AM Day 1
  startingTime: 400,

  // How many seconds (after declaring a winner), before switch back to the lobby state
  timeAfterWinToSwitch: 10,

  // The margin of error before adjusting the position of a player controlled
  // by a another client
  posMargin: 5,

  // How much is added or subtracted from a player's velocity when attempting to
  // match its position
  velAdjust: 5,

  // How many seconds to wait before declaring a player to be stuck
  timeForStuck: 2,

  // Enable/disable trimming a player's list of updates when there are too many 
  // updates queued up
  trimUpdates: true, 

  // The ratio of the updates margin to the maximum of updates to keep
  marginMaxUpdatesRatio: 6,

  // The maximum number of updates to buffer (this is the highest marginMaxUpdatesRatio
  // can be)
  maxUpdateBufferSize: 60,

  // On the server side, how often (in seconds) to periodically print the current 
  // game or lobby objects (for debugging)
  periodicPrint: 10,

  // How often (in minutes) to send out a sync packet to all clients.  Shouldn't be too
  // low of a number
  serverSyncInterval: 1,

  // How many minutes after the game has started to send out the first sync packet
  minutesBeforeFirstSync: 1,
  
  // How long (in seconds) to display big messages (like level up)
  bigMessageDisplayTime: 4,

  // Maps server can randomly choose from when starting a new game
  maps: ['map_01'],

  /* 
   * Sync fields
   */
  // Player fields shared between the server and client
  playerFields: ['id', 'name', 'charclass', 'level', 'currHp', 'maxHp', 'dmgMultiplier'],

  // Player update attributes like hp and animation that can be automatically set
  playerUpdateFields: ['vel.x', 'vel.y', 'pos.x', 'pos.y', 'animation', 'direction'],

  // Custom player update fields (actions players perform) shared between clients.
  // These usually have to be parse through and set one by one
  playerUpdateActions: ['shotWeapon', 'summonedMinions', 'attackHits', 'wasAttacked', 
  'hpIncreases', 'minionTargets', 'shootLots', 'bigShot'],

  minionFields: ['id', 'minionType', 'spriteIndex', 'producerId', 'posX', 'posY', 'currHp', 'maxHp']
};
