// The character directly controlled by the client
var MainSurvivorEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {

    // Call the parent constructor (PlayerEntity)
    this.parent(x, y, settings);

    // Camera will follow this entity around
    me.game.viewport.follow(this);
  },

  // Automatically called by melonjs once per tick
  update: function() {

    keyboard_movement(this);

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
    clientUpdates.positions.push( {
      pos_x: this.pos.x,
      pos_y: this.pos.y,
      animation: this.animation
    });

    return true;
  }
});

// Teammates of the main player
var OtherSurvivorEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {

    // Call the parent constructor (PlayerEntity)
    this.parent(x, y, settings);
    this.diff_x = 0
    this.diff_y = 0
  },

 update: function() {
    
    server_movement(this);
    this.parent(this);

    return true;
  }
});
