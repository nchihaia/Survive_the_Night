var MedkitCollectible = Collectible.extend( {

  init: function(x, y, settings) {
    settings.image = 'medkit';
    this.parent(x, y, settings, 'medkit');
    this.setTransparency('#00ffff');
  },

  onCollision: function(res, obj) {
    // A collectible is only "picked up" if the main player collides with it.
    // When the player does pick it up, the player gains health equal to the base
    // amount the medkit holds times the player's level
    var id = obj.id;
    if (typeof id !== 'undefined' && id == mainPlayerId) {
      var player = game.players[mainPlayerId];
      if (typeof player !== 'undefined') {
        var healthGained = this.amount * player.level;
        player.hpIncrease(player, healthGained);
        me.game.remove(this);
      }
    }
  }
});
