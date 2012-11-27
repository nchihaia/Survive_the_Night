var GAMECFG = {

  fps: 30,

  // How many in-game minutes goes by for each real life second
  gameMinutesPerSecond: 10,
  
  // How many times per second for the client to send an update packet to the server
  clientUpdatesPerSecond: 10,

  // How many times per second for the server to an update packet to all in-game clients
  serverUpdatesPerSecond: 20,
  
  logLevel: 2,

  // The x and y coordinates of where a survivor entity spawns
  survivorStartingXPos: 100,
  survivorStartingYPos: 100,
  
  // The mininum of max opacity for the color layer representing day and night
  minLightOpacity: 0,
  maxLightOpacity: 0.75,

  // Time to start the game (in minutes after midnight on the first day)
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
  periodicPrint: 10,

  // Player fields shared between the server and client
  playerFields: ['id', 'name', 'charclass', 'level'],

  // Player update attributes like hp and animation that can be automatically set
  playerUpdateFields: ['vel.x', 'vel.y', 'pos.x', 'pos.y', 'animation', 'direction'],

  // Custom player update fields (actions players perform) shared between clients.
  // These usually have to be parse through and set one by one
  playerUpdateActions: ['shotWeapon', 'summonedMinions', 'attackHits', 'wasAttacked'],

  minionFields: ['id', 'minionType', 'producerId', 'posX', 'posY']
};
