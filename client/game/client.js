// Set the url of our game server for the client can communicate with
var socket = io.connect('http:\/\/localhost:5000');
// var socket = io.connect('http:\/\/survivethenight.herokuapp.com');

// Keeps track of the updates of the actions for the main 
// player (the player the client controls).
var mainPlayerUpdates = initMainPlayerUpdates()

// Stores the state of everything else in our game world that was told to
// us by the game server (past movements, scores, etc...)
var game = {
  players: {},
}

// Decide the maximum number of update items (1 item = 1 frame) to keep
var MAX_FRAMES_TO_KEEP = 3;
var MARGIN = 17;

/*
 * Listening for messages from the server
 */

socket.on('new player joined the game', function(id) {
  addTeammate(id)
});  

socket.on('a player left the game', function(playerId) {
  me.game.remove(game.players[playerId]);
  delete game.players[playerId];
});

socket.on('tell new player about game state', function(data) {
  for (key in data.game.players) {
    if (key != data.mainPlayerId) {
      addTeammate(key);
    }
  }
});

socket.on('updates from the server', function(updates) {
  for (key in updates.playerUpdates) {
    updateTeammate(key, updates.playerUpdates[key].positions);
  }
});

// Every 35ms, tell the server the player's actions in the past 35ms
setInterval(function() { 
  socket.emit("update server on player's actions", mainPlayerUpdates);
  mainPlayerUpdates = initMainPlayerUpdates()
}, 35);

/*
 * Helper functions
 */

function initMainPlayerUpdates() {
  return { positions: [] };
}

function addTeammate(id) {

  // Create a new instance of the entity representing the teammate
  var teammate = new OtherSurvivorEntity(100, 100, {});
  
  teammate.updates = []
  
  game.players[id] = teammate;
  
  // Tell melonJS about the teammate
  me.game.add(teammate, 2);
  me.game.sort();

  console.log(id + ' joined');
}

function updateTeammate(id, updates) {

  var player = game.players[id];

  if (player) {
    player.updates = player.updates.concat(updates);

    // Decide if we need to skip some frames if there are too much
    // update items queued up
    if (player.updates.length > MAX_FRAMES_TO_KEEP) {
      sliceStart = player.updates.length - MAX_FRAMES_TO_KEEP;
      if (sliceStart > MARGIN) {
        sliceEnd = player.updates.length - 1;
        player.updates = player.updates.slice(sliceStart, sliceEnd);
        console.log(id + ': skipped ' + sliceStart + ' frames');
      }
    }
  }
}
