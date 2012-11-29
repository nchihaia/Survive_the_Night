// Abstract entity representing a player.  It could represent the 
// client's character, a teammate's character, or a bot)
var PlayerEntity = Entity.extend( {	

  init: function(x, y, settings, attrs) {
    // Set the sprite image to be playerMock
    // (This is defined in client/game/assets/js)
    settings.image = CHARCLASSES[attrs.charclass].sprite;
    settings.spritewidth = 32;
    settings.spriteheight = 48;
    // Call ObjectEntity constructor
    this.parent(x, y, settings);

    this.defaultAnimationSet();

    // Movements settings for this entity.  Look at melonjs docs for more
    // info, but the names of these settings should be relatively self-explanatory
    this.setVelocity(5, 5);
    this.setFriction(0.7, 0.7);
    this.collidable = true;
    
    // Merge attrs fields into this entity
    customMerge(this, attrs, GAMECFG.playerFields); 

    this.entType = CHARCLASSES[this.charclass].entType;
    this.actionCooldownTime = CHARCLASSES[this.charclass].actionCooldownTime;
    this.ammoCount = CHARCLASSES[this.charclass].startingAmmoAmount;

    // Set Hp.  This value could come from some attribute set on the server side or
    // a default value from the config if no value is passed through attrs
    if (typeof this.maxHp === 'undefined') {
        this.maxHp = CHARCLASSES[this.charclass].baseHp;
    }
    if (typeof this.currHp === 'undefined') {
      this.currHp = this.maxHp;
    }

    // Decide the max number of update items to keep and the margin (cutoff point)
    // that maxUpdatesToKeep has to go over before we trim the number of updates 
    // down to equal maxUpdatesToKeep.
    // Higher values => more fidelity, possibly more delay
    // Lower values => less delay, possibly less fidelity 
    this.updatesMargin = 1;
    this.maxUpdatesToKeep = parseInt(this.updatesMargin / GAMECFG.marginMaxUpdatesRatio, 10);
  },

  onDestroyEvent: function() {
    if (me.state.current().name === 'play' && this.entType == ENTTYPES.SURVIVOR) {
      game.score.director += (this.level * 25);
      me.game.HUD.updateItemValue('scoreItem');
    }
  }
});

var MainPlayerEntity = PlayerEntity.extend( {	

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);

    this.setMaxVelocity(6, 6);
    // Camera will follow this entity around
    me.game.viewport.follow(this);

    this.newActions = {};
  },

  copyMovement: function() {
    return {
      direction: this.direction,
      animation: this.animation,
      pos: {
        x: this.pos.x,
        y: this.pos.y
      },
      vel: {
        x: this.vel.x,
        y: this.vel.y
      }
    };
  },

  update: function() {
    /*
     * Attack
     */
    if (me.input.isKeyPressed('action')) {
      // Only do action if there are enough ammo and not on "cooldown"
      if (this.ammoCount > 0) {
        var canPerform = this.attemptAbility();
        if (typeof canPerform === 'number') {
          this.ammoCount--;
          me.game.HUD.updateItemValue('charItem');
        }
      }
    }

    /*
     * Movement
     */
    var prevDirection = this.direction;

    if (me.input.isKeyPressed('esc')) {
      logger('Exiting to lobby', 1);
      socket.emit('this client exits the current game to lobby');
      lobby.players[mainPlayerId].isReady = false;
      me.state.change(me.state.LOBBY);
    } else {
      if (me.input.isKeyPressed('left')) {
        this.vel.x -= this.accel.x;
        this.direction = 'left';
      } else if (me.input.isKeyPressed('right')) {
        this.vel.x += this.accel.x;
        this.direction = 'right';
      }

      if (me.input.isKeyPressed('up')) {
        this.vel.y -= this.accel.y;
        this.direction = 'up';
      } else if (me.input.isKeyPressed('down')) {
        this.vel.y += this.accel.y;
        this.direction = 'down';
      }
    }

    // If client holds down shift, don't change the direction
    if (me.input.isKeyPressed('shift')) {
      this.direction = prevDirection;
    }

    this.updateMovement();

    // Standing animation if no movement detected
    if (this.standingStill()) {
      this.animation = 'stand_' + this.direction;
    } else {
      this.animation = this.direction;
    }
    this.setCurrentAnimation(this.animation);
    
    // Package into an update item
    var updateItem = this.copyMovement();
    customMerge(updateItem, this.newActions, GAMECFG.playerUpdateActions);
    clientUpdates.push(updateItem);
    this.newActions = {};

    this.parent(this);
    return true;
  }
});

// A player controlled by another client
var OtherPlayerEntity = PlayerEntity.extend( {	

  init: function(x, y, settings, attrs) {
    this.parent(x, y, settings, attrs);

    this.updates = [];
    this.possiblyStuck = 0;
    this.posShouldBe = { 
      x: this.pos.x,
      y: this.pos.y
    };
  },
  
  // Adjust the velocity if the player's position in this client's
  // view is too different from the real player's position
  adjustVel: function(updateItem, dir, animations) {
    var diff = this.pos[dir] - this.posShouldBe[dir];
    if (Math.abs(diff) > GAMECFG.posMargin) {
      if (diff < 0) {
        if (this.standingStill(updateItem)) {
          updateItem.animation = animations[0];
        }
        updateItem.vel[dir] += GAMECFG.velAdjust;
      } else {
        if (this.standingStill(updateItem)) {
          updateItem.animation = animations[1];
        }
        updateItem.vel[dir] -= GAMECFG.velAdjust;
      }
    }
  },

  update: function(updateItem) {
    if (typeof updateItem !== 'undefined') {
      this.adjustVel(updateItem, 'x', ['right', 'left']);
      this.adjustVel(updateItem, 'y', ['down', 'up']);

      this.vel.x = updateItem.vel.x;
      this.vel.y = updateItem.vel.y;
      this.direction = updateItem.direction;
      this.animation = updateItem.animation;
      this.posShouldBe.x = updateItem.pos.x;
      this.posShouldBe.y = updateItem.pos.y;
    }

    this.handleBeingStuck(this.updateMovement());
    this.setCurrentAnimation(this.animation);

    this.parent(this);
    return true;
  },

  draw: function(context) {
    var yPos = this.top;
    this.drawHp(context, yPos);
    yPos -= 10;
    this.drawBasicInfo(context, yPos);
    this.parent(context, yPos);
  },

  critUpdate: function(updateItem) {
  },

  handleBeingStuck: function(tileRes) {
    if (tileRes && (tileRes.x !== 0 || tileRes.y !== 0)) {
      if (this.possiblyStuck === 0) {
        logger(this.name + ' is possibly stuck', 3);
      }
      this.possiblyStuck++;
      if (this.possiblyStuck > (me.sys.fps * GAMECFG.timeForStuck)) {
        logger(this.name + ' is stuck; teleporting to proper position', 3);
        this.pos.x = this.posShouldBe.x;
        this.pos.y = this.posShouldBe.y;
      }
    } else {
      this.possiblyStuck = 0;
    }
  }
});
