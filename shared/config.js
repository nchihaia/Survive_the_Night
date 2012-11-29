var GAMECFG = {

  fps: 30,

  // How many in-game minutes goes by for each real life second
  gameMinutesPerSecond: 10,
  
  // How many times per second for the client to send an update packet to the server
  clientUpdatesPerSecond: 10,

  // How many times per second for the server to an update packet to all in-game clients
  serverUpdatesPerSecond: 20,
  
  logLevel: 2,

  // How many seconds to wait start the game after the first client gives the ready signal.
  // This is to prevent an idle client from keeping a game from starting
  timeBeforeGameStart: 10,

  // The x and y coordinates of where a survivor entity spawns
  survivorStartingXPos: 1130,
  survivorStartingYPos: 160,
  
  // The mininum of max opacity for the color layer representing day and night
  minLightOpacity: 0,
  maxLightOpacity: 0.75,

  // Whether or not to have only 1 director
  directorClassRestrict: true,

  // Time to start the game (in minutes after midnight on the first day)
  // 600 => 10:00 AM Day 1
  startingTime: 600,

  // Number of seconds to count down before a game begins
  countdownTime: 1,

  // The margin of error before adjusting the position of a player controlled
  // by a another client
  posMargin: 5,

  // How much is added or subtracted from a player's velocity when attempting to
  // match its adjust its position
  velAdjust: 5,

  // How many seconds to wait before declaring a player to be stuck
  timeForStuck: 2,

  // Enable/disable trimming a player's list of updates when there are too many updates queued up
  trimUpdates: true, 
  
  // The ratio of the updates margin to the maximum of updates to keep
  marginMaxUpdatesRatio: 6,

  // On the server side, how often (in seconds) to periodically print the current game/lobby objects
  periodicPrint: 5,
  
  // How often (in minutes) to send out a sync packet to all clients.  Shouldn't be too
  // low of a number
  serverSyncInterval: 1,

  // How many minutes after the game has started to send out the first sync packet
  minutesBeforeFirstSync: 1,

  // Player fields shared between the server and client
  playerFields: ['id', 'name', 'charclass', 'level', 'currHp', 'maxHp'],

  // Player update attributes like hp and animation that can be automatically set
  playerUpdateFields: ['vel.x', 'vel.y', 'pos.x', 'pos.y', 'animation', 'direction'],

  // Custom player update fields (actions players perform) shared between clients.
  // These usually have to be parse through and set one by one
  playerUpdateActions: ['shotWeapon', 'summonedMinions', 'attackHits', 'wasAttacked', 'hpIncreases'],

  minionFields: ['id', 'minionType', 'producerId', 'posX', 'posY', 'currHp', 'maxHp']
};
