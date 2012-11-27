// A director controlled by the client
var MainDirectorEntity = MainPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  performAbility: function() {
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
    return 0;
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
    }
    this.parent(updateItem);
  }
});
