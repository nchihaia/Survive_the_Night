var Entity = me.ObjectEntity.extend( {

  init: function(x, y, settings) {
    this.parent(x, y, settings);
    this.actionOnCooldown = false;
  },

  defaultAnimationSet: function() {
    this.addAnimation('stand_down', [0]);
    this.addAnimation('stand_left', [4]);
    this.addAnimation('stand_right', [8]);
    this.addAnimation('stand_up', [12]);
    this.addAnimation('down', [0, 1, 2, 3]);
    this.addAnimation('left', [4,  5,  6,  7]);
    this.addAnimation('right', [8, 9, 10, 11]);
    this.addAnimation('up', [12, 13,14,15]);

    // Set starting animation
    this.direction = 'down';
    this.animation = 'stand_' + this.direction;
    this.setCurrentAnimation(this.animation);
  },

  update: function() {
    // Standing animation if no movement detected
    if (this.standingStill()) {
      this.animation = 'stand_' + this.direction;
    } else {
      this.animation = this.direction;
    }
    this.setCurrentAnimation(this.animation);

    this.parent(this);
  },

  drawHp: function(context, yPos) {
    if (typeof yPos === 'undefined') {
      yPos = this.top;
    }

    var currHp = Math.max(this.currHp, 0);
    context.font = 'bold 10px Droid Sans';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText(currHp + ' / ' + this.maxHp, (this.left + this.right) / 2, yPos);
  },

  drawBasicInfo: function(context, yPos) {
    if (typeof yPos === 'undefined') {
      yPos = this.top;
    }

    var text = this.name;
    if (typeof this.level !== 'undefined') {
      text += ' - Lvl ' + this.level; 
    }

    context.font = 'bold 10px Droid Sans';
    context.textAlign = 'center';
    context.fillStyle = 'blue';
    context.fillText(text, (this.left + this.right) / 2, yPos);
  },

  shoot: function(projectile) {
    me.game.add(new projectile(this), 2);
    me.game.sort();
  },

  summon: function(EntityToSummon, attrs) {
    var summonedEntity = new EntityToSummon(this, attrs);
    me.game.add(summonedEntity, 2);
    me.game.sort();

    return summonedEntity;
  },

  standingStill: function(obj) {
    if (typeof obj === 'undefined') {
      obj = this;
    }
    return obj.vel.x === 0 && obj.vel.y === 0;
  },

  calcDamage: function(target, attack) {
    if (typeof target !== 'undefined' && target.alive) {
      var damage = attack.damage;
      // If this function is called by the main player, or the target is the main player,
      // do some additional damage calculation.  Otherwise, just return attack.damage
      // since this was obviously passed onto us by the server
      if (this.id == mainPlayerId || target.id == mainPlayerId) {
        var isNighttime = game.time.isNighttime();

        // Double damage for minions at night; double damage for survivors in the daytime
        if ((isNighttime && this.isMinion) || (!isNighttime && this.entType == ENTTYPES.SURVIVOR)) {
          // Double damage for minions at night
          damage *= 2;
        } 
      }
      return damage;
    } else {
      return 0;
    }
  },

  performAttack: function(entity, attack) {
    if (typeof entity !== 'undefined') {
      var damage = this.calcDamage(entity, attack);
      entity.currHp -= damage;
      logger(this.name + ' hits ' + entity.name + ' for ' + damage + ' damage', 2);

      if (entity.currHp <= 0) {
        if (entity.entType == ENTTYPES.ENEMY) {
          if (entity.alive) {
            entity.alive = false;
            entity.flicker(20, function() {
              delFromGame(entity);
            });
          }
        } else {
          if (typeof game.score !== 'undefined') {
            game.score.director += (this.level * 25);
            me.game.HUD.updateItemValue('scoreItem');
            if (entity.id == mainPlayerId) {
              entity.pos.x = GAMECFG.survivorStartingXPos;
              entity.pos.y = GAMECFG.survivorStartingYPos;
              entity.currHp = entity.maxHp;
            }
          }
        }
      }
      return damage;
    } else {
      return false;
    }
  },

  dropItem: function(item, pos) {
    // If no position, drop the item where the entity is standing
    pos = pos || {
      x: this.pos.x,
      y: this.pos.y
    };
    var droppedItem = new item(pos.x, pos.y, {});
    me.game.add(droppedItem, 2);
    me.game.sort();
  },

  // Returns damage that ability hit for if not on cooldown, false otherwise
  attemptAbility: function(targetEntity, ability) {
    if (!this.actionOnCooldown) {
      // Do the ability
      var damage = this.performAbility(targetEntity, ability);

      // Set the new cooldown
      this.actionOnCooldown = true;
      var thisObj = this;
      setTimeout(function() {
        thisObj.actionOnCooldown = false;
      }, this.actionCooldownTime);
      return damage;

    } else {
      return false;
    }
  },

  // Increase this entity's hp by 
  hpIncrease: function(amount) {
    var newHp = this.currHp + amount;
    this.currHp = Math.min(newHp, this.maxHp);
    me.game.HUD.updateItemValue('charItem');
    this.newActions.hpIncreases = this.newActions.hpIncreases || [];
    this.newActions.hpIncreases.push(amount);
  }
});
