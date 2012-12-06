// A director controlled by the client
var MainDirectorEntity = MainPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  performAbility: function(garbage, key) {
    var n = key;
    switch(n)
    {
        case "D": {this.summonBasic();break;}
        case "F": {this.summonSuper();break;}
    }
    return 0;
  },

  update: function() {
    var entRes = me.game.collide(this);
    this.parent(this);
  },
summonBasic: function()
  {
    var minion = this.summon(MinionEntity, { minionType: MINIONTYPE.BASIC });
    minion.setId();
    this.newActions.summonedMinions = [{ 
      id: minion.id,
      minionType: MINIONTYPE.BASIC,
      name: minion.name,
      posX: minion.pos.x,
      posY: minion.pos.y
    }];
    game.minions[minion.id] = minion;
  },
  summonSuper: function()
  {
      var minion = this.summon(MinionEntity, { minionType: MINIONTYPE.SUPER});
      minion.setId();
      this.newActions.summonedMinions =[{
      minionType:MINIONTYPE.SUPER,
      name: minion.name,
      posX: minion.pos.x,
      posY: minion.pos.y
      }];
  game.minions[minion.id] = minion;
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

      if (typeof updateItem.summonedMinions !== 'undefined') {
        var minion = updateItem.summonedMinions[0];
        logger(this.name + ' summoned a minion at ' + minion.posX + ', ' + minion.posY, 2);
        minion = this.summon(MinionEntity, { 
          id: minion.id, 
          minionType: MINIONTYPE.BASIC,
          posX: minion.posX, 
          posY: minion.posY
        });
        game.minions[minion.id] = minion;
      }

      if (typeof updateItem.minionTargets !== 'undefined') {
        for (var i=0; i < updateItem.minionTargets.length; i++) {
          var minionTarget = updateItem.minionTargets[i];
          var minionThatAttacks = findEntityById(minionTarget.minionId);
          var targetOfMinion = findEntityById(minionTarget.targetId);
          if (typeof minionThatAttacks !== 'undefined' && typeof targetOfMinion !== 'undefined') {
            minionThatAttacks.target = targetOfMinion;
          }
        }
      }
    }
    this.parent(updateItem);
  }
}

);
