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

// Heroku requires us to use long-polling instead of websockets
io.configure(function() { 
  io.set('transports', ['xhr-polling']); 
  io.set('polling duration', 10); 
});

var game = {
  players: {},
};

var gameUpdates = initGameUpdates();

// Listen for custom events sent by clients
io.sockets.on('connection', function(socket) {
  
  // Sent by a newly created client
  socket.on('joining game', function(data) {

    console.log('Player ' + socket.id + ' joined the game');
    addPlayer(socket.id);

    // Broadcast to all other players except this player that a 
    // new player has joined
    socket.broadcast.emit('new player joined the game', socket.id);

    // Tell the main player about the current game state
    console.log(game);
    socket.emit('tell new player about game state', { 
      mainPlayerId: socket.id, 
      game: game 
    });
  });
  
  // Sent when the player disconnects
  socket.on('disconnect', function(data) {

    // don't do anything if the our game state doesn't know
    // about the player
    if (!game.players[socket.id]) {
      return;
    }
    delete game.players[socket.id];
    console.log('Player ' + socket.id + ' left the game');

    // Tell all other clients that the player has left
    socket.broadcast.emit('a player left the game', socket.id);
  });
  
  // Sent by each client every 35ms
  socket.on("update server on player's actions", function(updates) {
    if (game.players[socket.id]) {
      playerToUpdate = gameUpdates.playerUpdates[socket.id];
      if (playerToUpdate) {
        playerToUpdate.positions = playerToUpdate.positions.concat(updates.positions);
      } else {
        gameUpdates.playerUpdates[socket.id] = updates;
      }
    }
  });
});

// Every 35ms, tell all clients about changes in the game world not under
// their control in the past 35ms
setInterval(function() { 
  io.sockets.emit('updates from the server', gameUpdates);
  gameUpdates = initGameUpdates();
}, 35);

/*
 * Helper functions
 */

function initGameUpdates() {
  return { playerUpdates: {} };
}

// Add a player to the game world
function addPlayer(id) {
  game.players[id] = {
    id: id,
    updates: []
  };
}
