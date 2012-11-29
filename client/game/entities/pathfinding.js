var PathfindingEntity = Entity.extend( {
  
   init: function(x, y, settings) {
    this.parent(x, y, settings);
  },


  update: function() {
    //  this.findPath(this.producer.pos.x, this.producer.pos.y);

    this.updateMovement();
    this.parent(this);
  }
});
