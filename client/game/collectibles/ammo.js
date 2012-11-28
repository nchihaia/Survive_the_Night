var AmmoCollectible = Collectible.extend( {

  init: function(x, y, settings) {
    settings.image = 'ammoBox';
    this.parent(x, y, settings, 'ammo');
    this.setTransparency('#00ffff');
  },

  onCollision: function(res, obj) {
    var id = obj.id;
    if (typeof id !== 'undefined' && id == mainPlayerId) {
      game.players[mainPlayerId].ammoCount += this.amount;
      me.game.HUD.updateItemValue('charItem');
      me.game.remove(this);
    }
  }
});
