// A director controlled by the client
var MainDirectorEntity = MainPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  performAbility: function(garbage, key) {
    var n = key;
    switch(n)
    {
        case "D": 
          this.summonBasic();
          break;
        case "F": 
          this.summonSuper();
          break;
    }
    return [0, false];
  },

  update: function() {
    var entRes = me.game.collide(this);
    this.parent(this);
  },

  summonBasic: function() {
    // Pick a random sprite
    var spriteArrLength = MINIONTYPES[MINIONTYPE.BASIC].sprite.length;
    var randSpriteIndex = parseInt(Math.random() * spriteArrLength, 10);
    
    // Summon the minion
    var minion = this.summon(MinionEntity, { 
      minionType: MINIONTYPE.BASIC,
      spriteIndex: randSpriteIndex
    });
    minion.setId();
  
    // Tell the server about the summoned minion
    this.newActions.summonedMinions = [{ 
      id: minion.id,
      minionType: MINIONTYPE.BASIC,
      spriteIndex: randSpriteIndex,
      name: minion.name,
      posX: minion.pos.x,
      posY: minion.pos.y
    }];
    game.minions[minion.id] = minion;
  },

  summonSuper: function() {
    // Pick a random sprite
    var spriteArrLength = MINIONTYPES[MINIONTYPE.SUPER].sprite.length;
    var randSpriteIndex = parseInt(Math.random() * spriteArrLength, 10);
    
    // Summon the minion
    var minion = this.summon(MinionEntity, { 
      minionType: MINIONTYPE.SUPER,
      spriteIndex: randSpriteIndex
    });
    minion.setId();
  
    // Tell the server about the summoned minion
    this.newActions.summonedMinions = [{ 
      id: minion.id,
      minionType: MINIONTYPE.SUPER,
      spriteIndex: randSpriteIndex,
      name: minion.name,
      posX: minion.pos.x,
      posY: minion.pos.y
    }];
    game.minions[minion.id] = minion;
  },
  
  // Give director the base ammo * number of players in game * day
  ammoRefresh: function() {
    var numPlayers = Object.keys(game.players).length;
    var baseAmmo = CHARCLASSES[this.charclass].startingAmmoAmount;
    var day = game.time.getDay();
    this.ammoCount = baseAmmo * numPlayers * day;
  }
});

// A director controlled by another client
var OtherDirectorEntity = OtherPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  update: function() {
    var updateItem = this.updates.shift();
    if (typeof updateItem !== 'undefined') {
      this.critUpdate(updateItem);
    }

    this.parent(updateItem);
    return true;
  },

  critUpdate: function(updateItem) {
    if (typeof updateItem !== 'undefined') {
      
      // Director summoned a minion
      if (typeof updateItem.summonedMinions !== 'undefined') {
        for (var j=0; j < updateItem.summonedMinions.length; j++) {
          var minionAttrs = updateItem.summonedMinions[j];
          logger(this.name + ' summoned a minion at ' + minionAttrs.posX + ', ' + minionAttrs.posY, 2);
          var minion = this.summon(MinionEntity, minionAttrs);
          game.minions[minion.id] = minion;
        }
      }
      
      // Director's minion(s) changed their targets
      if (typeof updateItem.minionTargets !== 'undefined') {
        for (var i=0; i < updateItem.minionTargets.length; i++) {
          var minionTarget = updateItem.minionTargets[i];
          var minionThatAttacks = findEntityById(minionTarget.minionId);
          var targetOfMinion = findEntityById(minionTarget.targetId);
          if (typeof minionThatAttacks !== 'undefined' && typeof targetOfMinion !== 'undefined') {
            logger(minionThatAttacks.name + ' chooses ' + targetOfMinion.name + ' as the target', 2);
            minionThatAttacks.target = targetOfMinion;
          }
        }
      }
    }
    this.parent(updateItem);
  }
}

);
