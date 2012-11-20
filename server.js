// Use the Express framework to serve our client files
var express = require('express');
var app = express.createServer(express.logger());

// Set the root directory of where to serve files to clients
app.configure(function() {
  app.use(express.static(__dirname + '/client'));
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

var game = initGame();

var lobby = {
  players: {}
}

var gameUpdates = initGameUpdates();

// Listen for custom events sent by clients
io.sockets.on('connection', function(socket) {

  /*
  * Lobby listeners
  */

  socket.on('this client first joins the lobby', function(name) {
    logger(name + ' joins the lobby', 1);  
    addToLobby(socket.id, name);
    socket.broadcast.emit('a new player joins the lobby', {
      id: socket.id,
      name: name
    });
    // Send new client the lobby state
    sendLobbyState(socket);
  });
  
  socket.on('this client is re-requesting the lobby state', function() {
    logger(socket.id + ' re-requesting lobby state', 1);
    sendLobbyState(socket);
  });

  socket.on('this client changes their class', function(charclass) {
    if (lobby.players[socket.id]) {
      logger(lobby.players[socket.id].name + ' switches to ' + charclass, 4);
      lobby.players[socket.id].charclass = charclass
      socket.broadcast.emit('a client changes their class', {
        id: socket.id,
        charclass: charclass
      });
    }
  });

  socket.on('this client is ready to play', function() {
    if (lobby.players[socket.id]) {
      logger(lobby.players[socket.id].name + ' is ready to play', 1);
      lobby.players[socket.id].isReady = true;
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
      if (!game.players[socket.id]) {
        // The client is attempting to join a game in progress so tell this
        // to all other clients
        var lobbyPlayer = lobby.players[socket.id];
        var player = addPlayer(socket.id, lobbyPlayer.name, lobbyPlayer.charclass);
        socket.broadcast.emit('a new player joins the game', player);
        logger(player.name + ' joins a game in progress', 1);
      }
      socket.emit('server sending game state', game);
    }
  });
  
  // Sent by each client every 35ms
  socket.on('this client sends updates to server', function(clientUpdates) {
    if (game.players[socket.id]) {
      logger(game.players[socket.id] + ' sends an update packet', 4);
      var player = gameUpdates.playerUpdates[socket.id];
      if (player) {
        player.positions = player.positions.concat(clientUpdates.positions);
      } else {
        gameUpdates.playerUpdates[socket.id] = clientUpdates;
      }
    }
  });

  socket.on('this client exits the current game to lobby', function() {
    if (game.players[socket.id]) {
      logger(game.players[socket.id].name + ' exits the current game to lobby', 1);
      socket.broadcast.emit('a client exits the current game to lobby', socket.id);
      delete game.players[socket.id];
    }
    if (lobby.players[socket.id]) {
      lobby.players[socket.id].isReady = false;
    }
    // If game is empty, switch back to lobby for everyone
    if (game.currentState == 1 && noPlayersInGame()) {
      logger('game empty, switch to lobby state', 1);
      switchToLobbyState();
    }
  });

  /*
  * Misc. listeners
  */

  socket.on('disconnect', function(data) {
    if (lobby.players[socket.id]) {
      console.log(lobby.players[socket.id].name  + ' left the game');
      // Tell all other clients that the player left
      socket.broadcast.emit('a player left the game', socket.id);
      delete lobby.players[socket.id];
    }
    if (game.players[socket.id]) {
      delete game.players[socket.id];
    }
    // If game is empty, switch back to lobby for everyone
    if (game.currentState == 1 && noPlayersInGame()) {
      logger('game empty, switch to lobby state', 1);
      switchToLobbyState();
    } else if (game.currentState == 0 && allReadyToPlay()) {
    // If in lobby, all remaining players might be ready
      startGame();
      io.sockets.emit('server tells all clients to start game');
    }
  });
});

/*
 * Intervals
 */

// Every 100ms, tell all clients about changes in the game world not under
// their control in the past 100ms
setInterval(function() { 
  if (game.currentState == 1) {
    io.sockets.emit('server sends updates', gameUpdates);
    gameUpdates = initGameUpdates();
  }
}, 100);

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
    // States:
    // 0 - In lobby, forming teams
    // 1 - Playing game
    currentState: 0,
    players: {}
  };
}

function initGameUpdates() {
  return { playerUpdates: {} };
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
    currentState: game.currentState,
    lobby: lobby
  });
}

function allReadyToPlay() {
  for (key in lobby.players) {
    if (!lobby.players[key].isReady) {
      return false;
    }
  }
  return true;
}

function startGame() {
  game.players = {};
  for (key in lobby.players) {
    var player = lobby.players[key];
    addPlayer(key, player.name, player.charclass);
  }
  gameUpdates = initGameUpdates();
  game.currentState = 1;
}

// Add a player to the game world
function addPlayer(id, name, charclass) {
  game.players[id] = {
    id: id,
    name: name,
    charclass: charclass,
    updates: []
  };
  return game.players[id];
}

// Check if all players have exited game
function noPlayersInGame() {
  return Object.keys(game.players).length == 0;
}

function switchToLobbyState() {
  game = initGame();
  io.sockets.emit('server broadcasts that game is back to lobby state');
}
