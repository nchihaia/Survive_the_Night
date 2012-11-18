// Every 35ms, tell the server the player's actions in the past 35ms
setInterval(function() {
  if (inCurrentGame()) {
    logger('sending update packet to server', 3);
    socket.emit('this client sends updates to server', clientUpdates);
    clientUpdates = initClientUpdates()
  }
}, 35);
