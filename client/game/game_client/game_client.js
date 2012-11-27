// Set the url of our game server for the client can communicate with
var socket = io.connect('http:\/\/localhost:5000');
// var socket = io.connect('http:\/\/stn.herokuapp.com');

var gameLogLevel = GAMECFG.logLevel;

var mainPlayerId;

// Keeps track of the updates of the actions for the main 
// player (the player the client controls).
var clientUpdates = [];

// Stores the state of everything else in our game world that was told to
// us by the game server (past positions, scores, etc...)
var game = initGame();

var lobby = {
  players: {},
  allReady: false
};

function initGame() {
  return {
    // States:
    // 0 - In lobby, forming teams
    // 1 - Playing game
    currentState: 0,
    time: undefined,
    charDisplay: undefined,
    updatenum: undefined,
    numPacketsLost: 0,
    players: {},
    minions: {}
  };
}

function logger(message, logLevel) {
  if (gameLogLevel >= logLevel) {
    console.log(message);
  }
}
