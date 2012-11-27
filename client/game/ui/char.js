var CharItem = me.HUD_Item.extend( {	

  init: function() {
    this.parent(me.video.getWidth() / 40, me.video.getHeight() / 1.2);
  },

  draw: function(context, x, y) {
    var player = game.players[mainPlayerId];
    if (player) {
      var yPos = 0;
      // Name
      context.font = 'bold 20px Droid Sans';
      context.textAlign = 'left';
      context.fillStyle = 'purple';
      context.fillText(player.name, this.pos.x, this.pos.y + yPos);
      
      // Level
      yPos += 25;
      context.fillStyle = 'black';
      context.font = 'bold 18px Droid Sans';
      context.fillText('Level ' + player.level, this.pos.x, this.pos.y + yPos); 

      // HP
      yPos += 25;
      context.fillStyle = '#0a0e02';
      context.font = 'bold 20px Droid Sans';
      context.fillText(player.currHp + ' / ' + player.maxHp, this.pos.x, this.pos.y + yPos);

      // Ammo
      yPos += 25;
      context.fillStyle = '#0a0e02';
      context.font = 'bold 20px Droid Sans';
      context.fillStyle = 'brown';
      context.fillText('Ammo: ' + player.ammoCount, this.pos.x, this.pos.y + yPos);
    }

    this.parent(context, x, y);
  }
});

