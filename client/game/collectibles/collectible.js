var Collectible = me.CollectableEntity.extend( {

  init: function(x, y, settings, type) {
    this.parent(x, y, settings);
    this.amount = COLLECTIBLES[type].baseAmount;
  }
});

