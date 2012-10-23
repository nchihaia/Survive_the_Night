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

// Heroku requires us to use long-polling instead of websockets
io.configure(function() { 
  io.set('transports', ['xhr-polling']); 
  io.set('polling duration', 10); 
});

// Listen for custom events sent by clients
io.sockets.on('connection', function(socket) {
  
  // Sent by a newly created client
  socket.on('joining game', function(data) {
    console.log('Player ' + socket.id + ' joined the game');
  });
});
