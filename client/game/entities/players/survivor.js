// A survivor controlled by the client
var MainSurvivorEntity = MainPlayerEntity.extend( {

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);
  },

  update: function() {
    var entRes = me.game.collide(this);
    if (entRes && entRes.obj.entType == ENTTYPES.ENEMY) {
      var enemy = entRes.obj;
      if (enemy.isMinion) {
        var damage = enemy.attemptAbility(this, { damage: enemy.damage });
        if (typeof damage === 'number') {
          me.game.HUD.updateItemValue('charItem');
          this.newActions.wasAttacked = this.newActions.wasAttacked || [];
          this.newActions.wasAttacked.push({
            damage: damage,
            attackerId: enemy.id
          });
        }
      }
    }

    this.parent();
    return true;
  },

  performAbility: function() {
    this.shoot(BulletProjectile);
    this.newActions.shotWeapon = true;
    return 0;
  },

  performAttack: function(entity, attack) {
    var damage = this.parent(entity, attack);
    this.newActions.attackHits = this.newActions.attackHits || [];
    this.newActions.attackHits.push({ 
      damage: damage,
      entityId: entity.id
    });
    return damage;
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
          this.performAttack(target, attackEnemy);
        }
      }

      // This player was attacked by an enemy
      if (typeof updateItem.wasAttacked !== 'undefined') {
        for (var j=0; j < updateItem.wasAttacked.length; j++) {
          var attackByEnemy = updateItem.wasAttacked[j];
          var enemy = findEntityById(attackByEnemy.attackerId);
          enemy.performAttack(this, attackByEnemy);
        }
      }
    }
    this.parent(updateItem);
  }
});
