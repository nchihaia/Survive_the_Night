/*
* General helpers
*/

// Merge the fields specified in fieldsToMerge of obj1 into obj0
function customMerge(obj0, obj1, fieldsToMerge) {
  if (emptyObject(obj1)) {
    return;
  }

  for (var index in fieldsToMerge) {
    var key = fieldsToMerge[index];
    var value = obj1[key];
    if (typeof value !== 'undefined') {
      obj0[key] = value;
    }
  }
}

// Copy all of the fields in fieldsToCopy from obj into a new object
function customCopy(obj, fieldsToCopy) {
  var objCopy = {};

  if (!emptyObject(obj)) {
    for (var index in fieldsToCopy) {
      var key = fieldsToCopy[index];
      var value = obj[key];
      if (typeof value !== 'undefined') {
        objCopy[key] = value;
      }
    }
  }
  return objCopy;
}

// True if an object has no fields
function emptyObject(obj) {
  return Object.keys(obj).length === 0;
}

// A random string of a specified length
function randomString(length) {
  return Math.random().toString(36).substr(2, length);
}

function logger(message, debugLevel) {
  if (typeof debugLevel === 'undefined') {
    debugLevel = 2;
  }

  if (gameLogLevel >= debugLevel) {
    console.log(message);
  }
}

/*
* Game helpers
*/

function findEntityById(id) {
  if (typeof id !== 'undefined') {
    var gameObj = game.pubData || game;
    var entity = gameObj.players[id];
    if (typeof entity === 'undefined') {
      entity = gameObj.minions[id];
    }
    return entity;
  }
}

function delFromGame(entity) {
  if (typeof me !== 'undefined') {
    me.game.remove(entity);
  }

  var gameObj = game.pubData || game;
  if (typeof gameObj.minions[entity.id] !== 'undefined') {
    delete gameObj.minions[entity.id];
  } else if (typeof gameObj.players[entity.id] !== 'undefined') {
    delete gameObj.players[entity.id];
  }
}

function printDetailedGame() {
  var tab = '    ';
  var gameObj = game.pubData || game;

  logger('Current state: ' + gameObj.currentState);

  logger('Scores: ' + 'Survivors ' + gameObj.score.survivors + ', Director ' + gameObj.score.director);

  var time = gameObj.time.rawval || gameObj.time;
  logger('Current time: ' + time);

  logger(Object.keys(gameObj.players).length + ' PLAYERS in game: ');
  for (var playerId in gameObj.players) {
    var player = gameObj.players[playerId];
    logger(tab + player.name);
    logger(tab + tab + 'Charclass: ' + player.charclass);
    logger(tab + tab + 'Level: ' + player.level);
    logger(tab + tab + 'Hp: ' + player.currHp + ' / ' + player.maxHp);
    logger(tab + tab + 'Experience: ' + player.experience);
  }

  logger(Object.keys(gameObj.minions).length + ' MINIONS in game: ');
  for (var minionId in gameObj.minions) {
    var minion = gameObj.minions[minionId];
    logger(tab + minion.name);
    logger(tab + tab + 'Type: ' + minion.minionType);
    logger(tab + tab + 'Hp: ' + minion.currHp + ' / ' + minion.maxHp);
    logger(tab + tab + 'Pos: ' + '(' + minion.posX + ', ' + minion.posY + ')');
  }
}
