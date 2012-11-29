/*
 * Lobby listeners
 */

socket.on('server sends lobby state', function(data) {
  logger('Receiving lobby state from server', 1);
  mainPlayerId = data.mainPlayerId;
  game.currentState = data.currentState;
  lobby = data.lobby;
});

socket.on('a new player joins the lobby', function(data) {
  logger(data.name + ' joins the lobby', 1);
  addToLobby(data.id, data.name); 
});

socket.on('a client changes their class', function(data) {
  var player = lobby.players[data.id];
  if (typeof player !== 'undefined') {
    logger(player.name + ' changes their class', 4);
    player.charclass = data.charclass;
  }
});

socket.on('a client is ready to play', function(id) {
  var player = lobby.players[id];
  if (typeof player !== 'undefined') {
    logger(player.name + ' is ready to play', 1);
    player.isReady = true;
  }
});

socket.on('server tells all clients to start game', function() {
  logger('Game is ready to start', 1);
  lobby.allReady = true;
});

socket.on('a new game will be starting soon', function() {
  logger('Game starting soon', 1);
  lobby.nobodyReady = false;
  setTimeout(function() {
    lobby.allReady = true;
  }, GAMECFG.timeBeforeGameStart * 1000);
});


socket.on('the charclass chosen is valid', function(data) {
  if (game.currentState === 0) {
    socket.emit('this client is ready to play');
  } else if (game.currentState == 1) {
    // A game is already in progress so switch straight to the play screen
    me.state.change(me.state.PLAY);
  }
  lobby.players[mainPlayerId].isReady = true;
});

socket.on('the charclass chosen is invalid', function(data) {
  alert('Invalid class');
});

socket.on('a game is happening', function() {
   me.state.change(me.state.PLAY);
});

/*
 * Game listeners
 */

// This could happen either when this client first enters the game,
// or is receiving a server resync
socket.on('server sending game state', function(serverGame) {
  logger('Server sends game state', 1);
  // Only matters if current player is in the game
  if (lobby.players[mainPlayerId].isReady) {
    // Add players
    for (var playerId in serverGame.players) {
      var serverPlayer = serverGame.players[playerId];
      var player = game.players[playerId];
      if (playerId != mainPlayerId && typeof player === 'undefined') {
        // This client doesn't yet know about this player
        addPlayer(serverPlayer);
      } else if (typeof game.players[playerId] !== 'undefined') {
        // Player already exists so sync with stats on the server side
        syncPlayer(player, serverPlayer);
      }
    }
    // Add Minions
    for (var minionId in serverGame.minions) {
      // This client doesn't yet know about this minion
      var serverMinion = serverGame.minions[minionId];
      var minion = game.minions[minionId];
      if (typeof minion === 'undefined') {
        addMinion(serverGame.minions[minionId]);
      } else {
        syncMinion(minion, serverMinion);
      }
    }
    // Set scores
    game.score.survivors = serverGame.score.survivors;
    game.score.director = serverGame.score.director;
    // Set time
    game.time.rawVal = serverGame.time;
  }
});

socket.on('server sends updates', function(update) {
  logger('Server sends update packet', 4);
  if (inCurrentGame()) {
    for (var playerId in update.gameUpdates.playerUpdates) {
      updatePlayer(playerId, update.gameUpdates.playerUpdates[playerId]);
    }
    // Check for any lost update packets
    if (typeof game.updateNum !== 'undefined') {
      if (game.updateNum + 1 !== update.updateNum) {
        var numPacketsLost = update.updateNum - game.updateNum + 1; 
        logger('Lost ' + numPacketsLost + ' update packets', 3);
        game.numPacketsLost += numPacketsLost;
        // TODO: Re-request game state if number of lost update packets is over
        // a certain threshold
      }
      game.updateNum = update.updateNum;
    }
  }
});

socket.on('a new player joins the game', function(player) {
  logger(player.name + ' joins the game', 1);
  // This message is only relevant to players already in the game
  if (game.currentState == 1 && lobby.players[mainPlayerId].isReady) {
    addPlayer(player); 
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
  lobby.allReady = false;
  lobby.nobodyReady = true;
  me.state.change(me.state.LOBBY);
  game = initGame();
});

socket.on('a player leveled up', function(data) {
  var player = game.players[data.id];
  if (typeof player !== 'undefined') {
    player.level = data.level;
    logger(player.name + ' is now level ' + data.level, 2); 
    // Merge attributes
    customMerge(player, data.attrs, GAMECFG.playerFields);
    if (data.id == mainPlayerId) {
      me.game.HUD.updateItemValue('charItem');
    }
  }
});

/*
 * Misc. listeners
 */

socket.on('a player left the game', function(id) {
  var playerName;
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

function addPlayer(serverPlayer) {
  var attrs = {};
  customMerge(attrs, serverPlayer, GAMECFG.playerFields);

  // Create a new instance of the entity representing the player
  var player;
  var xPos = GAMECFG.survivorStartingXPos;
  var yPos = GAMECFG.survivorStartingYPos;
  if (attrs.charclass == CHARCLASS.DIRECTOR) {
    player = new OtherDirectorEntity(xPos, yPos, {}, attrs);
  } else {
    player = new OtherSurvivorEntity(xPos, yPos, {}, attrs);
  }
  game.players[attrs.id] = player;
  
  // Add the player into the game world
  me.game.add(player, 2);
  me.game.sort();
}

function addMinion(serverMinion) {
  var attrs = {};
  customMerge(attrs, serverMinion, GAMECFG.minionFields);
  var producer = game.players[serverMinion.producerId];
  var minion = new MinionEntity(producer, attrs);
  game.minions[minion.id] = minion;

  // Add minion to game
  me.game.add(minion, 2);
  me.game.sort();
}

function syncPlayer(player, serverPlayer) {
  customMerge(player, serverPlayer, GAMECFG.playerFields);
}

function syncMinion(minion, serverMinion) {
  minion.currHp = serverMinion.currHp;
}

function inCurrentGame() {
  return mainPlayerId && lobby.players[mainPlayerId].isReady && game.currentState == 1;
}

// Handle the updates that the server sends this client about
// a player controlled by another client
function updatePlayer(id, updates) {
  var player = game.players[id];
  // Don't need to update main player
  if (id != mainPlayerId && typeof player !== 'undefined') {
    player.updates = player.updates.concat(updates);
    // Decide if we need to skip some frames if there are too much
    // update items queued up
    if (player.updates.length > player.maxUpdatesToKeep) {
      var sliceStart = player.updates.length - player.maxUpdatesToKeep;
      // If size of updates list exceeds the margin
      if (GAMECFG.trimUpdates && sliceStart > player.updatesMargin) {
        // Slice updates into two
        var beforeSlice = player.updates.slice(0, sliceStart);
        var afterSlice = player.updates.slice(sliceStart);

        // Of the update frames to skip, figure out if there are
        // any critical updates that need to be handled (like player health),
        // as opposed to a noncritical update (player position)
        for (var index in beforeSlice) {
          player.critUpdate(beforeSlice[index]);
        }

        player.updates = afterSlice;
        logger(player.name + ': skipped ' + sliceStart + ' frames', 3);

        // Increase margin if client keeps on skipping update items
        player.updatesMargin++;
        player.maxUpdatesToKeep = parseInt(player.updatesMargin / GAMECFG.marginMaxUpdatesRatio, 10);
        logger(player.name + ': margin is ' + player.updatesMargin + ', max frames is ' + player.maxUpdatesToKeep, 3);
      }
    }
  }
}
