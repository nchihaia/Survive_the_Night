var AmmoCollectible = Collectible.extend( {

  init: function(x, y, settings) {
    settings.image = 'ammo_box';
    this.parent(x, y, settings, 'ammo');
    this.setTransparency('#00ffff');
  },

  onCollision: function(res, obj) {
    // A collectible is only "picked up" if the main player collides with it.
    var id = obj.id;
    if (typeof id !== 'undefined' && id == mainPlayerId) {
      var player = game.players[mainPlayerId];
      if (typeof player !== 'undefined') {
        player.ammoCount += this.amount * player.level;
        me.game.HUD.updateItemValue('charItem');
        me.game.remove(this);
      }
    }
  }
});
