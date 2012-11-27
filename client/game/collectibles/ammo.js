var AmmoCollectible = me.CollectableEntity.extend( {

  init: function(x, y, settings) {
    settings.image = 'ammoBox';
    this.ammoHold = 20;
    this.parent(x, y, settings);
    this.setTransparency('#00ffff');
  },

  onCollision: function(res, obj) {
    var id = obj.id;
    if (typeof id !== 'undefined' && id == mainPlayerId) {
      game.players[mainPlayerId].ammoCount += this.ammoHold;
      me.game.HUD.updateItemValue('charItem');
      me.game.remove(this);
    }
  }
});
