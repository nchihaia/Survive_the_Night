/*
 * Lobby listeners
 */

socket.on('server sends lobby state', function(data) {
  logger('receiving lobby state from server', 1);
  mainPlayerId = data.mainPlayerId;
  game.currentState = data.currentState;
  lobby = data.lobby;
});

socket.on('a new player joins the lobby', function(data) {
  logger(data.name + ' joins the lobby', 1);
  addToLobby(data.id, data.name); 
});

socket.on('a client changes their class', function(data) {
  if (lobby.players[data.id]) {
    logger(lobby.players[data.id].name + ' changes their class', 4);
    lobby.players[data.id].charclass = data.charclass;
  }
});

socket.on('a client is ready to play', function(id) {
  logger(lobby.players[id].name + ' is ready to play', 1);
  lobby.players[id].isReady = true;
});

socket.on('server tells all clients to start game', function() {
  logger('Game is ready to start', 1);
  lobby.allReady = true;
});

/*
 * Game listeners
 */

socket.on('server sending game state', function(serverGame) {
  logger('Server sends game state', 1);
  for (key in serverGame.players) {
    var player = serverGame.players[key];
    addPlayer(key, player.name, player.charclass);
  } 
});

socket.on('server sends updates', function(gameUpdates) {
  logger('Server sends update packet', 4);
  if (inCurrentGame()) {
    for (key in gameUpdates.playerUpdates) {
      updatePlayer(key, gameUpdates.playerUpdates[key]);
    }
  }
});

socket.on('a new player joins the game', function(player) {
  logger(player.name + ' joins the game', 1);
  // This message is only relevant to players already in the game
  if (game.currentState == 1 && lobby.players[mainPlayerId].isReady) {
    addPlayer(player.id, player.name, player.charclass); 
  }
});

socket.on('a client exits the current game to lobby', function(id) {
  if (game.players[id]) {
    logger(game.players[id].name + ' exits the current game to lobby', 1);
    me.game.remove(game.players[id]);
    delete game.players[id];
  }
  if (lobby.players[id]) {
    lobby.players[id].isReady = false;
  }
});

socket.on('server broadcasts that game is back to lobby state', function() {
  logger('All players are now in the lobby', 1);
  game = initGame();
  lobby.allReady = false;
  me.state.change(me.state.LOBBY);
});

/*
 * Misc. listeners
 */

socket.on('a player left the game', function(id) {
  var playerName = undefined;
  if (game.players[id]) {
    playerName = game.players[id].name;
    me.game.remove(game.players[id]);
    delete game.players[id];
  }
  if (lobby.players[id]) {
    playerName = lobby.players[id].name;
    delete lobby.players[id];
  }
  if (playerName) {
    logger(playerName + ' left the game', 1);
  }
});

/* 
 * Helper functions
 */

/* 
 * Lobby helpers
 */

function addToLobby(id, name) {
  lobby.players[id] = { 
    id: id,
    name: name,
    charclass: 0,
    isReady: false
  };
}

/* 
 * Game helpers
 */

function addPlayer(id, name, charclass) {
  // Create a new instance of the entity representing the teammate
  var player = new OtherSurvivorEntity(100, 100, {
    image: CHARCLASSES[charclass].sprite,
    spritewidth: 32,
    spriteheight: 48
  });
  
  player.serverId = id;
  player.name = name;
  player.updates = { positions: [] };

  // Class-based attributes
  player.charclass = charclass;
  player.maxHp = CHARCLASSES[charclass].baseHp;
  player.currHp = player.maxHp;

  // Decide the max number of update items to keep and the margin (cutoff point)
  // that maxUpdatesToKeep has to go over before we trim the number of updates 
  // down to equal maxUpdatesToKeep.
  // Higher values => less stuttering, more delay
  // Lower values => less delay, possibly more stuttering
  player.updatesMargin = 1;
  player.maxUpdatesToKeep = parseInt(player.updatesMargin / 6);

  game.players[id] = player;
  
  // Add the player into the game world
  if (id != mainPlayerId) {
    me.game.add(player, 2);
    me.game.sort();
  }
}

function inCurrentGame() {
  return mainPlayerId && lobby.players[mainPlayerId].isReady && game.currentState == 1;
}

// Handle the updates that the server sends this client about
// a player controlled by another client
function updatePlayer(id, updates) {
  var player = game.players[id];
  if (id != mainPlayerId && player) {
    positions = player.updates.positions; 
    player.updates.positions = positions.concat(updates.positions);

    // Decide if we need to skip some frames if there are too much
    // update items queued up
    if (positions.length > player.maxUpdatesToKeep) {
      sliceStart = positions.length - player.maxUpdatesToKeep;
      if (sliceStart > player.updatesMargin) {
        sliceEnd = positions.length - 1;
        player.updates.positions = positions.slice(sliceStart, sliceEnd);
        logger(player.name + ': skipped ' + sliceStart + ' frames', 3);
        // Increase margin if client keeps on skipping update items
        player.updatesMargin++;
        player.maxUpdatesToKeep = parseInt(player.updatesMargin / 6);
        logger(player.name + ': margin is ' + player.updatesMargin + ', max frames is ' + player.maxUpdatesToKeep, 3);
      }
    }
  }
}
