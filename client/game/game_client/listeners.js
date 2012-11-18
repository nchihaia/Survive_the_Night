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

socket.on('a client changes their character', function(data) {
  if (lobby.players[data.id]) {
    logger(lobby.players[data.id].name + ' changes their character', 3);
    lobby.players[data.id].character = data.character;
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
    addPlayer(key, player.name, player.character);
  } 
});

socket.on('server sends updates', function(gameUpdates) {
  logger('Server sends update packet', 3);
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
    addPlayer(player.id, player.name, player.character); 
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

socket.on('a player left the game', function(playerId) {
  if (game.players[playerId]) {
    logger(game.players[playerId].name + ' left the game');
    me.game.remove(game.players[playerId]);
    delete game.players[playerId];
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
    character: 0,
    isReady: false
  };
}

/* 
 * Game helpers
 */

function addPlayer(id, name, character) {
  // Create a new instance of the entity representing the teammate
  var player = new OtherSurvivorEntity(100, 100, {});
  player.serverId = id;
  player.name = name;
  player.character = character;
  player.updates = { positions: [] };
  game.players[id] = player;
  
  // Tell melonJS about the player
  if (id != mainPlayerId) {
    me.game.add(player, 2);
    me.game.sort();
  }
  // logger(name + ' joined', 1);
}

function inCurrentGame() {
  return mainPlayerId && lobby.players[mainPlayerId].isReady && game.currentState == 1;
}


function updatePlayer(id, updates) {
  var player = game.players[id];
  if (id != mainPlayerId && player) {
    positions = player.updates.positions; 
    player.updates.positions = positions.concat(updates.positions);

    // Decide if we need to skip some frames if there are too much
    // update items queued up
    if (positions.length > MAX_FRAMES_TO_KEEP) {
      sliceStart = positions.length - MAX_FRAMES_TO_KEEP;
      if (sliceStart > MARGIN) {
        sliceEnd = positions.length - 1;
        player.updates.positions = positions.slice(sliceStart, sliceEnd);
        console.log(id + ': skipped ' + sliceStart + ' frames');
      }
    }
  }
}
