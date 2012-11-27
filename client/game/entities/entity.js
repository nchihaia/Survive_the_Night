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
      return attack.damage;
    } else {
      return 0;
    }
  },

  performAttack: function(entity, attack) {
    var damage = this.calcDamage(entity, attack);
    entity.currHp -= damage;
    logger(this.name + ' hits ' + entity.name + ' for ' + damage + ' damage', 2);

    if (entity.currHp <= 0) {
      if (entity.alive) {
        entity.alive = false;
        entity.flicker(20, function() {
          delFromGame(entity);
        });
      }
    }
    return damage;
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
  }
});
