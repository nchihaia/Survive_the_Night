// Every 100ms, tell the server the player's actions in the past 100ms
var sendUpdate = function() {
  if (clientUpdates.length > 0) {
    logger('Sending update packet to server', 4);
    socket.emit('this client sends updates to server', clientUpdates);
    clientUpdates = [];
  }
};

// Retrieving first-time connection information from the server
var reestablishServerConn = function() {
  if (typeof mainPlayerId === 'undefined') {
    logger('Reestablishing connection with server', 1);
    socket.emit('this client is re-requesting the lobby state');
  }
};

// Increase the in-game time (10 minutes at a time)
var incrementTime = function() {
  me.game.HUD.updateItemValue('timeItem');
  game.time.rawVal+= 10;
};

// Periodically add to the update item the latest x and y positions
// of the minions in the game
// var updateMinionPos = function() {
//   var updateItem = clientUpdates[clientUpdates.length - 1];
//   if (typeof updateItem !== 'undefined' && !emptyObject(game.minions)) {
//     updateItem.minionsUpdate = customCopy(game.minions, ['posX', 'posY']);
//   }
// }
