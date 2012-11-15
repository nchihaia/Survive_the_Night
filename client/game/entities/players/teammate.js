// Teammates of the main player
var TeammateEntity = PlayerEntity.extend( {

  init: function(x, y, settings) {

    // Call the parent constructor (PlayerEntity)
    this.parent(x, y, settings);
    this.diff_x = 0
    this.diff_y = 0
  },

 update: function() {
    
    // If there are no more updates about this player's movements,
    // don't do anything
    if (this.updates.length == 0) {
      
      if (this.diff_x == 0 && this.diff_y == 0) {
        return;
      }
      
      if (!isNaN(this.diff_x)) {
        this.pos.x += this.diff_x;
      }
      if (!isNaN(this.diff_y)) {
        this.pos.y += this.diff_y;
      }

      this.updateMovement();
      this.setCurrentAnimation(this.animation);
      return;
    } else {
      // Pop an item off this teammate's update stack and set the
      // teammate's position to the coordinates defined by it
      updateItem = this.updates.shift();

      this.diff_x = updateItem.pos_x - this.pos_x
      this.diff_y = updateItem.pos_y - this.pos_y

      this.pos.x = updateItem.pos_x;
      this.pos.y = updateItem.pos_y;
      this.updateMovement();
      this.animation = updateItem.animation;
      this.setCurrentAnimation(this.animation);
    }
      
    // res = me.game.collide(this);
    this.parent(this);

    return true;
  }
});
