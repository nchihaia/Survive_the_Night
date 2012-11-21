// Set the url of our game server for the client can communicate with
var socket = io.connect('http:\/\/localhost:5000');
// var socket = io.connect('http:\/\/survivethenight.herokuapp.com');

var gameLogLevel = 3;

var mainPlayerId = undefined;

// Keeps track of the updates of the actions for the main 
// player (the player the client controls).
var clientUpdates = initClientUpdates();

// Stores the state of everything else in our game world that was told to
// us by the game server (past movements, scores, etc...)
var game = initGame();

var lobby = {
  players: {},
  allReady: false
}

// Decide the maximum number of update items (1 item = 1 frame) to keep
var margin = 1;
var max_frames_to_keep = parseInt(margin / 6);

function initGame() {
  return {
    // States:
    // 0 - In lobby, forming teams
    // 1 - Playing game
    currentState: 0,
    players: {}
  };
}

function initClientUpdates() {
  return { positions: [] };
}

function logger(message, logLevel) {
  if (gameLogLevel >= logLevel) {
    console.log(message);
  }
}
