var Entity = me.ObjectEntity.extend( {

  init: function(x, y, settings) {
    this.parent(x, y, settings);
    this.setFriction(0.7, 0.7);
    this.actionOnCooldown = false;
    
    // Damage and heal queue for drawing purposes
    this.hpDeltas = [];
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

  draw: function(context) {
    this.drawHpDelta(context);
    this.parent(context);
  },
  
  // Draw hp damage done and heals done to this entity
  drawHpDelta: function(context) {
    for (var i=0; i < this.hpDeltas.length; i++) {
      var hpDelta = this.hpDeltas[i];

      if (typeof hpDelta.yPosDiff === 'undefined') {
        // Negative delta is damage taken, positive is heal
        if (hpDelta.delta <= 0) {
          hpDelta.fillStyle = 'red';
          hpDelta.deltaDisplay =  hpDelta.delta;
        } else {
          hpDelta.fillStyle = 'green';
          hpDelta.deltaDisplay = '+' + hpDelta.delta;
        }
        // Account for crit
        if (hpDelta.crit) {
          hpDelta.deltaDisplay = 'Crit ' + hpDelta.deltaDisplay;
        }

        // Init numbers to tween
        hpDelta.xPosDiff = -15;
        hpDelta.yPosDiff = -15;
        
        // Start the tween
        var thisObj = this;
        var tween = new me.Tween(hpDelta)
        .to({ xPosDiff: 20, yPosDiff: 20 }, 400)
        .onComplete(function() {
          thisObj.hpDeltas.shift();
        });

        tween.easing(me.Tween.Easing.Quadratic.EaseInOut);
        tween.start();
      }

      context.font = 'bold 12px Oswald';
      context.textAlign = 'left';
      context.fillStyle = hpDelta.fillStyle;
      var xPos = this.right + hpDelta.xPosDiff;
      var yPos = this.top - hpDelta.yPosDiff;
      context.fillText(hpDelta.deltaDisplay, xPos, yPos);
    }
  },
  
  // Draw HP above entity
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
  
  // Draw name and level (if this entity has a level)
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
  
  // Have this entity summon another entity
  summon: function(EntityToSummon, attrs) {
    var summonedEntity = new EntityToSummon(this, attrs);
    me.game.add(summonedEntity, 2);
    me.game.sort();

    return summonedEntity;
  },
  
  // True if obj passed is standing still.
  standingStill: function(obj) {
    if (typeof obj === 'undefined') {
      obj = this;
    }
    return obj.vel.x === 0 && obj.vel.y === 0;
  },
  
  // Calculate the damage of an attack by this entity on a target
  calcDamage: function(target, attack) {
    if (typeof target !== 'undefined' && target.alive) {
      // Damage of an attack is the attack's damage times the attacker's damage
      // multiplier.  The damage multiplier of survivors vary with levels.  All minions
      // have a damage multiplier of 1.
      var damage = attack.damage * this.dmgMultiplier;
      // If this function is called by the main player, or the target is the main player,
      // do some additional damage calculation.  Otherwise, just return attack.damage
      // since this was obviously passed onto us by the server
      if (this.id == mainPlayerId || target.id == mainPlayerId) {
        var isNighttime = game.time.isNighttime();

        // Quadruple damage for minions at night; double damage for survivors 
        // in the daytime
        if (isNighttime && this.isMinion) {
          damage *= 4;
        } else if (!isNighttime && this.entType == ENTTYPES.SURVIVOR) {
          damage *= 2;
        }
      }
      // Factor in critical hits
      var crit = false;
      if (typeof this.critChance === 'number') {
        if (Math.random() <= this.critChance) {
          crit = true;
          damage *= 2;
        }
      }
      return [damage, crit];
    } else {
      return 0;
    }
  },

  performAttack: function(target, attack, damage, crit) {
    if (typeof target !== 'undefined') {
      // Only perform damage calculation if the damage wasn't passed
      // as an argument
      if (typeof damage !== 'number' || typeof crit !== 'boolean') {
        var damageItem = this.calcDamage(target, attack);
        damage = damageItem[0];
        crit = damageItem[1];
      }
      // Make sure damage is a number (make it 0 if it isn't for some reason)
      if (typeof damage !== 'number') {
        damage = 0;
      }

      // Push the damage amount onto the hpDelta queue for visual display
      target.hpDeltas.push({ 
        delta: 0 - damage,
        crit: crit
      });

      // Calculate new hp
      target.currHp -= damage;
      logger(this.name + ' hits ' + target.name + ' for ' + damage + ' damage', 2);
      
      // If target has no more hp
      if (target.currHp <= 0) {
        target.slayer = this;
        if (target.entType == ENTTYPES.ENEMY) {
          // If target is the director or a minion, award points to the survivors
          if (target.alive) {
            target.alive = false;
            target.flicker(20, function() {
              delFromGame(target);
            });
          }
        } else {
          // Else, target is a survivor, so the director gets the points
          if (typeof game.score !== 'undefined') {
            game.score.director += (target.level * 25);
            me.game.HUD.updateItemValue('scoreItem');
            // Respawn survivor at the starting point
            target.pos.x = GAMECFG.survivorStartingXPos;
            target.pos.y = GAMECFG.survivorStartingYPos;
            target.currHp = target.maxHp;
            // Display message if target was the main player
            if (target.id === mainPlayerId) {
              game.score.respawned = 2;
            }
          }
        }
      }

      // Make target flicker
      if (damage > 0 && !target.isFlickering()) {
        target.flicker(2);
      }

      return [damage, crit];
    } else {
      return [false, false];
    }
  },
  
  // This entity drops an item (like a medkit)
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
      var damageItem = this.performAbility(targetEntity, ability);

      // Set the new cooldown
      this.actionOnCooldown = true;
      var thisObj = this;
      setTimeout(function() {
        thisObj.actionOnCooldown = false;
      }, this.actionCooldownTime);
      return damageItem;

    } else {
      return [false, false];
    }
  },

  // Increase the target's hp by the amount given.  This is called by the healer.
  hpIncrease: function(target, amount) {
    logger(this.name + ' heals ' + target.name + ' for ' + amount, 2);
    var newHp = target.currHp + amount;
    target.currHp = Math.min(newHp, target.maxHp);
    me.game.HUD.updateItemValue('charItem');

    // If this entity is the main player, tell the server about the hp increase
    if (typeof this.newActions !== 'undefined') {
      this.newActions.hpIncreases = this.newActions.hpIncreases || [];
      this.newActions.hpIncreases.push({
        targetId: target.id,
        amount: amount
      });
    }

    // Record the amount for display
    target.hpDeltas.push({ delta: amount });
  }
});
