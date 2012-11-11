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
