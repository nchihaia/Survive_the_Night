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

/*
 * Game helpers
 */

function findEntityById(id) {
  var gameObj = game.pubData || game;
  var entity = gameObj.players[id];
  if (typeof entity === 'undefined') {
    entity = gameObj.minions[id];
  }
  return entity;
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
