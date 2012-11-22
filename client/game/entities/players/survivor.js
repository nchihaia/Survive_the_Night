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

    // Remember previous actions so we can check whether or not
    // player has performed a new action
    var prev_xpos = this.pos.x;
    var prev_ypos = this.pos.y;
    var prev_animation = this.animation;

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

    // Record the player's current position to tell the server later if
    // an action was detected in this tick
    if (prev_xpos != this.pos.x || prev_ypos != this.pos.y || prev_animation != this.animation) {
      clientUpdates.positions.push( {
        pos_x: this.pos.x,
        pos_y: this.pos.y,
        animation: this.animation
      });
    } else {
      logger('No new action detected on this tick', 4);
    }

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
  },

  draw: function(context) {
    this.parent(context);
    context.font = '10px Droid Sans';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText(this.currHp + ' / ' + this.maxHp, this.left + 15, this.top);
  }
});
