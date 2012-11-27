// Use the Express framework to serve our client files
var express = require('express');
var app = express.createServer(express.logger());

// Set the root directory of where to serve files to clients
app.configure(function() {
  app.use(express.static(__dirname + '/client'));
  app.use(express.static(__dirname + '/shared'));
});

// Our server listens on 5000 if the system doesn't specify a port
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});
var io = require('socket.io').listen(app);

io.set('log level', 2);
var gameLogLevel = 2;

// Heroku requires us to use long-polling instead of websockets
io.configure(function() { 
  io.set('transports', ['xhr-polling']); 
  io.set('polling duration', 10); 
});

// Make shared fileds available 
// (using eval for now so we don't need to create node modules)
var fs = require('fs');
eval(fs.readFileSync('./shared/config.js') + '');
eval(fs.readFileSync('./shared/helpers.js') + '');
eval(fs.readFileSync('./shared/charclasses.js') + '');
eval(fs.readFileSync('./shared/charlevels.js') + '');
eval(fs.readFileSync('./shared/minions.js') + '');

// Filter for these fields when receiving update packets from clients
var updateFields = GAMECFG.playerUpdateFields.concat(GAMECFG.playerUpdateActions);

var game = initGame();

var lobby = {
  players: {}
};

// Listen for custom events sent by clients
io.sockets.on('connection', function(socket) {

  /*
  * Lobby listeners
  */

  socket.on('this client first joins the lobby', function(name) {
    if (typeof name !== 'undefined') {
      name = String(name);
      logger(name + ' joins the lobby', 1);  
      addToLobby(socket.id, name);
      socket.broadcast.emit('a new player joins the lobby', {
        id: socket.id,
        name: name
      });
      // Send new client the lobby state
      sendLobbyState(socket);
    }
  });

  socket.on('this client is re-requesting the lobby state', function() {
    logger(socket.id + ' re-requesting lobby state', 1);
    sendLobbyState(socket);
  });

  socket.on('this client changes their class', function(charclass) {
    if (typeof charclass !== 'undefined') {
      charclass = parseInt(charclass, 10);
      if (lobby.players[socket.id]) {
        logger(lobby.players[socket.id].name + ' switches to ' + charclass, 4);
        lobby.players[socket.id].charclass = charclass;
        socket.broadcast.emit('a client changes their class', {
          id: socket.id,
          charclass: charclass
        });
      }
    }
  });

  socket.on('this client is ready to play', function() {
    var player = lobby.players[socket.id];
    if (typeof player !== 'undefined') {
      logger(player.name + ' is ready to play', 1);
      player.isReady = true;
      socket.broadcast.emit('a client is ready to play', socket.id);
      if (allReadyToPlay()) {
        startGame();
        io.sockets.emit('server tells all clients to start game');
      }
    }
  });

  /*
  * Game listeners
  */

  socket.on('this client is in the game', function() {
    if (lobby.players[socket.id]) {
      logger(lobby.players[socket.id].name + ' is in the game', 1);
      if (!game.pubData.players[socket.id]) {
        // The client is attempting to join a game in progress so tell this
        // to all other clients
        var lobbyPlayer = lobby.players[socket.id];
        var player = addPlayer(socket.id, lobbyPlayer.name, lobbyPlayer.charclass);
        socket.broadcast.emit('a new player joins the game', player);
        logger(player.name + ' joins a game in progress', 1);
      }
      socket.emit('server sending game state', game.pubData);
    }
  });

  // Sent by each client every 35ms
  socket.on('this client sends updates to server', function(clientUpdates) {
    var player = game.pubData.players[socket.id];
    if (clientUpdates && player) {
      logger(player.name + ' sends an update packet', 4);
      game.privData.updates.playerUpdates[socket.id] = game.privData.updates.playerUpdates[socket.id] || [];
      for (var index in clientUpdates) {
        // Filter out extraneous update item fields
        // Comment out if seeing lag
        // var filteredUpdate = customCopy(clientUpdates[index], updateFields);
        // clientUpdates[index] = filteredUpdate;

        parseUpdate(player, clientUpdates[index]);
      }
      game.privData.updates.playerUpdates[socket.id] = game.privData.updates.playerUpdates[socket.id].concat(clientUpdates);
    }
  });

  socket.on('this client exits the current game to lobby', function() {
    if (game.pubData.players[socket.id]) {
      logger(game.pubData.players[socket.id].name + ' exits the current game to lobby', 1);
      socket.broadcast.emit('a client exits the current game to lobby', socket.id);
      delete game.pubData.players[socket.id];
    }
    if (lobby.players[socket.id]) {
      lobby.players[socket.id].isReady = false;
    }
    // If game is empty, switch back to lobby for everyone
    if (game.pubData.currentState == 1 && noPlayersInGame()) {
      logger('Game empty, switch to lobby state', 1);
      switchToLobbyState();
    }
  });

  /*
  * Misc. listeners
  */

  socket.on('disconnect', function() {
    if (lobby.players[socket.id]) {
      logger(lobby.players[socket.id].name  + ' left the game', 1);
      // Tell all other clients that the player left
      socket.broadcast.emit('a player left the game', socket.id);
      delete lobby.players[socket.id];
    }
    if (game.pubData.players[socket.id]) {
      delete game.pubData.players[socket.id];
    }
    // If game is empty, switch back to lobby for everyone
    if (game.pubData.currentState == 1 && noPlayersInGame()) {
      logger('Game empty, switch to lobby state', 1);
      switchToLobbyState();
    } else if (game.pubData.currentState === 0 && allReadyToPlay()) {
      // If in lobby, all remaining players might be ready
      startGame();
      io.sockets.emit('server tells all clients to start game');
    }
  });
});

/*
* Intervals
*/

// Tell all clients about changes in the game world not under their control
var sendUpdate = function() { 
  if (!noUpdatesToSend()) {
    io.sockets.emit('server sends updates', {
      updateNum: game.privData.updateNum++,
      gameUpdates: game.privData.updates
    });
    game.privData.updates = initGameUpdates();
  }
};

// Increase the in-game time (10 minutes at a time)
var incrementTime = function() {
  game.pubData.time += 10;
};

var periodicPrint = function() {
  if (game.pubData.currentState === 0) {
    logger('Lobby: ', 1);
    logger(lobby, 1);
  } else {
    logger('Game: ', 1);
    logger(game, 1);
  }
};

setInterval(periodicPrint, GAMECFG.periodicPrint * 1000);


/*
* Helper functions
*/

function logger(message, debugLevel) {
  if (gameLogLevel >= debugLevel) {
    console.log(message);
  }
}

function initGame() {
  return {
    pubData: {
      // States:
      // 0 - In lobby, forming teams
      // 1 - Playing game
      currentState: 0,
      time: GAMECFG.startingTime,
      players: {},
      // Minion fields: 
      // id (key), minionType, producerId, posX, posY, maxHp, currHp
      minions: {}
    },
    privData: {
      updateNum: 0,
      intervals: {
        sendUpdateId: undefined,
        incrementTimeId: undefined
      },
      updates: initGameUpdates()
    }
  };
}

function initGameUpdates() {
  return { playerUpdates: {} };
}

function noUpdatesToSend() {
  return emptyObject(game.privData.updates.playerUpdates);
}

function addToLobby(id, name) {
  lobby.players[id] = { 
    id: id,
    name: name,
    charclass: 0,
    isReady: false
  };
}

function sendLobbyState(socket) {
  socket.emit('server sends lobby state', {
    mainPlayerId: socket.id,
    currentState: game.pubData.currentState,
    lobby: lobby
  });
}

function allReadyToPlay() {
  for (var playerId in lobby.players) {
    if (!lobby.players[playerId].isReady) {
      return false;
    }
  }
  return true;
}

function startGame() {
  game.pubData.players = {};
  for (var playerId in lobby.players) {
    var player = lobby.players[playerId];
    addPlayer(playerId, player.name, player.charclass);
  }
  game.privData.updates = initGameUpdates();
  game.pubData.currentState = 1;
  game.privData.intervals.sendUpdateId = setInterval(sendUpdate, 1000 / GAMECFG.serverUpdatesPerSecond);
  game.privData.intervals.incrementTimeId = setInterval(incrementTime, 10000 / GAMECFG.gameMinutesPerSecond);
}

// Add a player to the game world
function addPlayer(id, name, charclass) {
  game.pubData.players[id] = {
    id: id,
    name: name,
    charclass: charclass,
    level: CHARCLASSES[charclass].baseLevel,
    maxHp: CHARCLASSES[charclass].baseHp,
    currHp: CHARCLASSES[charclass].baseHp,
    experience: 0,
    updates: []
  };
  return game.pubData.players[id];
}

// Check if all players have exited game
function noPlayersInGame() {
  return emptyObject(game.pubData.players);
}

function switchToLobbyState() {
  clearInterval(game.privData.intervals.sendUpdateId);
  clearInterval(game.privData.intervals.incrementTimeId);
  game = initGame();
  io.sockets.emit('server broadcasts that game is back to lobby state');
}

function parseUpdate(player, updateItem) {
  if (player.charclass == CHARCLASS.DIRECTOR) {
    parseDirectorUpdate(player, updateItem);
  } else {
    parseSurvivorUpdate(player, updateItem);
  }
}

function parseDirectorUpdate(director, updateItem) {
  var minions = updateItem.summonedMinions;
  if (typeof minions !== 'undefined') {
    for (var minionId in minions) {
      // var minion = customCopy(minions[i], GAMECFG.minionFields);
      var minion = minions[minionId];

      minion.producerId = director.id;
      minion.maxHp = MINIONTYPES[minion.minionType].baseHp;
      minion.currHp = minion.maxHp;

      logger('New minion with id: ' + minion.id, 1);
      // Since it is assumed there is only one director summoning minions,
      // assume all minion ids will be unique
      game.pubData.minions[minion.id] = minion;
    }
  }
}

function parseSurvivorUpdate(survivor, updateItem) {
  var attackHits = updateItem.attackHits;
  if (typeof attackHits !== 'undefined' && Array.isArray(attackHits)) {
    for (var i=0; i < attackHits.length; i++) {
      var attackHit = updateItem.attackHits[i];
      var target = findEntityById(attackHit.entityId);
      var damage = attackHit.damage;
      var successfulHit = calcAttack(survivor, target, damage);

      if (successfulHit) {
        handleExperience(survivor);
      }
    }
  }
}

function calcAttack(attacker, target, damage) {
  if (typeof attacker !== 'undefined' && typeof target !== 'undefined' && 
      typeof damage !== 'undefined') {
    logger(attacker.name + ' hits ' + target.name + ' for ' + damage + ' damage', 2);
    target.currHp -= damage;
    if (target.currHp <= 0) {
      logger(attacker.name + ' has slain ' + target.name, 2);
      delFromGame(target);
    }
    return true;
  } else {
    return false;
  }
}

function handleExperience(survivor) {
  survivor.experience += 2;
  logger(survivor.name + ' gains 2 experience points', 2);
  handleLevelUp(survivor);
}

function handleLevelUp(survivor) {
  var expForLevelUp = CHARLEVELS[survivor.level + 1];
  if (typeof expForLevelUp !== 'undefined') {
    if (survivor.experience >= expForLevelUp) {
      survivor.level++;
      logger(survivor.name + ' is now level ' + survivor.level, 2); 
      io.sockets.emit('a player leveled up', {
        id: survivor.id,
        level: survivor.level
      });
    }
  }
}
