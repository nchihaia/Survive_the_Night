// Abstract entity representing a player.  It could represent the 
// client's character, a teammate's character, or a bot)
var PlayerEntity = me.ObjectEntity.extend( {	

  init: function(x, y, settings) {
    // Call ObjectEntity constructor
    this.parent(x, y, settings);
  }
});

// The character directly controlled by the client
var MainPlayerEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {
    this.parent(x, y, settings);
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

    return true;
  }
});
