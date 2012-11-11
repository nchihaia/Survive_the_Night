// Abstract entity representing a player.  It could represent the 
// client's character, a teammate's character, or a bot)
var PlayerEntity = me.ObjectEntity.extend( {	

  init: function(x, y, settings) {
    
    // Set the sprite image to be playerA 
    // (This is defined in client/game/assets/js)
    if (!settings.image) {
      settings.image = 'playerA';
      settings.spritewidth = 32;
      settings.spriteheight = 48;
    }

    // Call ObjectEntity constructor
    this.parent(x, y, settings);

    // Define animations
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
    this.animation = this.direction;
    this.setCurrentAnimation(this.animation);

    // Movements settings for this character.  Look at melonjs docs for more
    // info, but the names of these settings should be relatively self-explanatory
    this.setVelocity(3, 3);
    this.setMaxVelocity(4, 4);
    this.setFriction(1.5, 1.5);
    this.gravity = 0;
    this.collidable = true;
  }
});

// The character directly controlled by the client
var MainPlayerEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {

    // Call the parent constructor (PlayerEntity)
    this.parent(x, y, settings);

    // Camera will follow this entity around
    me.game.viewport.follow(this);
  },

  // Automatically called by melonjs once per tick
  update: function() {

    // Change player's animation/position based on keypress
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

    this.updateMovement();

    // Standing animation if no movement detected
    if (this.vel.y == 0 && this.vel.x == 0) {
      this.animation = 'stand_' + this.direction;
      this.setCurrentAnimation(this.animation);
    } else {
      this.animation = this.direction;
      this.setCurrentAnimation(this.animation);
      this.parent(this);
    }
    
    // Record the player's current position to tell the server later
    mainPlayerUpdates.positions.push( {
      pos_x: this.pos.x,
      pos_y: this.pos.y,
      animation: this.animation
    });

    return true;
  }
});

// Teammates of the main player
var TeammateEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {

    // Call the parent constructor (PlayerEntity)
    this.parent(x, y, settings);
  },

 update: function() {
    
    // If there are no more updates about this player's movements,
    // don't do anything
    if (this.updates.length == 0) {
      return;
    }
    
    // Pop an item off this teammate's update stack and set the
    // teammate's position to the coordinates defined by it
    updateItem = this.updates.shift();
    this.pos.x = updateItem.pos_x;
    this.pos.y = updateItem.pos_y;

    this.updateMovement();
    res = me.game.collide(this);
    this.setCurrentAnimation(updateItem.animation);

    this.parent(this);
    return true;
  }
});
