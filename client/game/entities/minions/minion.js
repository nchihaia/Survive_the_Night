var MinionEntity = PathfindingEntity.extend( {

  init: function(producer, attrs) {
    settings = {};
    settings.image = MINIONTYPES[attrs.minionType].sprite;
    settings.spritewidth = MINIONTYPES[attrs.minionType].spriteWidth;
    settings.spriteheight = MINIONTYPES[attrs.minionType].spriteHeight;
    this.parent(0, 0, settings);

    this.defaultAnimationSet();
    this.collidable = true;
    
    var speed = MINIONTYPES[attrs.minionType].speed;
    var maxSpeed = MINIONTYPES[attrs.minionType].maxSpeed;
    this.setVelocity(speed, speed);
    this.setMaxVelocity(maxSpeed, maxSpeed);

    customMerge(this, attrs, GAMECFG.minionFields);
    this.pos.x = attrs.posX || producer.pos.x;
    this.pos.y = attrs.posY || producer.pos.y;
    this.producer = producer;
    this.target = producer;
    this.entType = MINIONTYPES[attrs.minionType].entType;
    this.damage = MINIONTYPES[attrs.minionType].damage;
    this.dmgMultiplier = 1;
    this.actionCooldownTime = MINIONTYPES[attrs.minionType].actionCooldownTime;
    this.isMinion = true;
    this.summonedTime = me.timer.getTime();

    // Set Hp.  This value could come from some attribute set on the server side or
    // a default value from the config if no value is passed through attrs (like when
    // a client enters a game in progress)
    if (typeof this.maxHp === 'undefined') {
      this.maxHp = MINIONTYPES[attrs.minionType].baseHp;
    }
    if (typeof this.currHp === 'undefined') {
      this.currHp = this.maxHp;
    }

    // Set id and name of the entity.  This is done after init so that
    // we can grab the GUID set by melonJS
    this.setId();
  },

  setId: function() {
    this.id = this.id || this.GUID;
    this.name = MINIONTYPES[this.minionType].name + ' ' + this.id;
  },

  update: function() {
    // Periodically update this minion's target to the closest survivor
    // by proximity.  Only the director handles this.
    var mainPlayer = game.players[mainPlayerId];
    if (typeof mainPlayer !== 'undefined' && mainPlayer.charclass == CHARCLASS.DIRECTOR &&
      me.timer.getTime() % 50 === 0) {
        var oldTarget = this.target;
        this.findTarget();
        // Update the server if the target has changed
        if (typeof this.target !== 'undefined' && oldTarget != this.target) {
          mainPlayer.newActions.minionTargets = mainPlayer.newActions.minionTargets || [];
          mainPlayer.newActions.minionTargets.push({
            minionId: this.id,
            targetId: this.target.id
          });
        }
      }
    
    // Have the minion navigate to its designated target
    if (typeof this.target !== 'undefined') {
      this.findPath(this.target.pos.x, this.target.pos.y);
    }

    this.parent(this);
    return true;
  },

  draw: function(context) {
    this.drawHp(context);
    this.parent(context);
  },

  onDestroyEvent: function() {
    if (me.state.current().name === 'play') {
      // increment survivor's score
      game.score.survivors += MINIONTYPES[this.minionType].points;
      me.game.HUD.updateItemValue('scoreItem');

      // Drops either an ammo box or medkit for survivors only
      if (game.players[mainPlayerId].charclass != CHARCLASS.DIRECTOR) {
        var roll = parseInt(2 * Math.random(), 10);
        var collectible;
        if (roll === 0) {
          collectible = AmmoCollectible;
        } else {
          collectible = MedkitCollectible;
        }
        this.dropItem(collectible);
        // Drop another of the same pickup if minion's slayer was support
        // (Since the first collectible is dropped exactly where the minion is
        // standing, drop this second one at an offset for some visual distinction)
        if (typeof this.slayer !== 'undefined' && 
            this.slayer.charclass == CHARCLASS.SUPPORT) {
          this.dropItem(collectible, {
            x: this.pos.x + 20,
            y: this.pos.y + 20 
          });
        }
      }
    }
  },
  
  // Minion executes the attack
  performAbility: function(target, ability) {
    if (typeof ability === 'undefined') {
      ability = { damage: this.damage };
    }
    var damage = this.performAttack(target, ability);
    return damage;
  },
  
  // Attack hits for damage
  performAttack: function(target, attack) {
    var damage = this.parent(target, attack);
    return damage;
  },
  
  // Find and set the minion's target to the survivor
  // that the minion is closest to
  findTarget: function() {
    var closest;
    var closestDistance;
    for (var playerId in game.players) {
      var player = game.players[playerId];
      if (typeof player !== 'undefined' && player.alive &&
          player.entType == ENTTYPES.SURVIVOR) {
        var playerDistance = this.distanceTo(player);
        // Set closest to be this player if no player has been declared closest yet
        if (typeof closest === 'undefined') {
          closest = player;
          closestDistance = playerDistance;
        } else {
          // Set player to be closest if their playerDistance is less
          if (playerDistance < closestDistance) {
            closest = player;
            closestDistance = playerDistance;
          }
        }
      }
    }
    // If closest is undefined, default to producer
    if (typeof closest === 'undefined') {
      closest = this.producer;
    }

    if (typeof this.target !== 'undefined' && this.target != closest) {
      logger(this.name + ' chooses ' + this.target.name + ' as the new target', 2);
    }
    this.target = closest;
  }
});
