// A survivor controlled by the client
var MainSurvivorEntity = MainPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  update: function() {
    // Handle damage done to this player by a minion
    var entRes = me.game.collide(this);
    if (entRes && entRes.obj.entType == ENTTYPES.ENEMY) {
      var enemy = entRes.obj;
      if (enemy.isMinion) {
        var damageItem = enemy.attemptAbility(this, { damage: enemy.damage });
        if (typeof damageItem[0] === 'number') {
          me.game.HUD.updateItemValue('charItem');
          this.newActions.wasAttacked = this.newActions.wasAttacked || [];
          this.newActions.wasAttacked.push({
            damage: damageItem[0],
            crit: damageItem[1],
            attackerId: enemy.id
          });
        }
      }
    }

    this.parent();
    return true;
  },

  performAbility: function(garbage, key) {
    var n = key;
    switch(n)
    {
        case "D":  this.ability1(); break;
        case "F":  this.ability2(); break;
    }
    return [0, false];
  },
  
  // Called when the bullet projectile hits a target
  performAttack: function(entity, attack) {
    var damageItem = this.parent(entity, attack);
    // Tell the server about the attack
    this.newActions.attackHits = this.newActions.attackHits || [];
    this.newActions.attackHits.push({ 
      damage: damageItem[0],
      crit: damageItem[1],
      entityId: entity.id
    });
    return damageItem;
  },

  ability1: function()
  {
    this.shoot(BulletProjectile);
    this.newActions.shotWeapon = true;
  },
  ability2: function()
  {
      var n = this.charclass;
      switch(n)
      {
          case CHARCLASS.SUPPORT: this.healClose();break;
      }
  },

  // hpIncrease is now called by the healer and has two arguments:
  //  - the entity to heal
  //  - the amount to heal
  healClose: function(){
       for (var playerId in game.players){
           var n = game.players[playerId];
           if(this.distanceTo(n)<=40 && n.entType == ENTTYPES.SURVIVOR)
               {this.hpIncrease(n, 10);}
       }
  }
});

// A survivor controlled by another client
var OtherSurvivorEntity = OtherPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  update: function() {
    // Pop an item off the survivor's update stack and
    // figure out the survivor's actions based on the data given
    var updateItem = this.updates.shift();
    if (typeof updateItem !== 'undefined') {

      if (typeof updateItem.shotWeapon !== 'undefined') {
        this.shoot(BulletProjectile);
      }
      this.critUpdate(updateItem);
    }
    this.parent(updateItem);
    return true;
  },

  critUpdate: function(updateItem) {
    if (typeof updateItem !== 'undefined') {

      // This player attacked an enemy
      if (typeof updateItem.attackHits !== 'undefined') {
        for (var i=0; i < updateItem.attackHits.length; i++) {
          var attackEnemy = updateItem.attackHits[i];
          var target = findEntityById(attackEnemy.entityId);
          if (typeof target !== 'undefined') {
            this.performAttack(target, attackEnemy, attackEnemy.damage, 
                               attackEnemy.crit);
          }
        }
      }

      // This player was attacked by an enemy
      if (typeof updateItem.wasAttacked !== 'undefined') {
        for (var j=0; j < updateItem.wasAttacked.length; j++) {
          var attackByEnemy = updateItem.wasAttacked[j];
          var enemy = findEntityById(attackByEnemy.attackerId);
          if (typeof enemy !== 'undefined') {
            enemy.performAttack(this, attackByEnemy, attackByEnemy.damage, 
                                attackByEnemy.crit);
          }
        }
      }

      // This player healed self or somebody else
      if (typeof updateItem.hpIncreases !== 'undefined') {
        for (var k=0; k < updateItem.hpIncreases.length; k++) {
          var hpIncreaseItem = updateItem.hpIncreases[k];
          var targetToHeal = game.players[hpIncreaseItem.targetId];
          var amount = hpIncreaseItem.amount;
          if (typeof targetToHeal !== 'undefined' && typeof amount !== 'undefined') {
            this.hpIncrease(targetToHeal, amount);
          }
        }
      }
    }
    this.parent(updateItem);
  }
});
