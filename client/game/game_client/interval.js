// Every 35ms, tell the server the player's actions in the past 100ms
setInterval(function() {
  if (inCurrentGame()) {
    logger('sending update packet to server', 4);
    socket.emit('this client sends updates to server', clientUpdates);
    clientUpdates = initClientUpdates()
  }
}, 100);


var reestablishServerConn = function() {
  if (mainPlayerId == undefined) {
    logger('Reestablishing connection with server', 1);
    socket.emit('this client is re-requesting the lobby state');
  }
}

