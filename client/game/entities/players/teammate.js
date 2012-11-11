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
