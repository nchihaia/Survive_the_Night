var MedkitCollectible = Collectible.extend( {

  init: function(x, y, settings) {
    settings.image = 'medkit';
    this.parent(x, y, settings, 'medkit');
    this.setTransparency('#00ffff');
  },

  onCollision: function(res, obj) {
    var id = obj.id;
    if (typeof id !== 'undefined' && id == mainPlayerId) {
      game.players[mainPlayerId].hpIncrease(this.amount);
      me.game.remove(this);
    }
  }
});
