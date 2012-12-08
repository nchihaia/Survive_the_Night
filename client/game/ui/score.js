var ScoreItem = me.HUD_Item.extend( {	

  init: function() {
    this.parent(me.video.getWidth() / 2, 70, 0);
    this.survivors = 0;
    this.director = 0;
  },

  draw: function(context, x, y) {
    var survivorsScore = 'Survivors: ' + this.survivors;
    context.font = '30px Oswald';
    context.textAlign = 'right';
    context.fillStyle = '#005bb7';
    context.fillText(survivorsScore, this.pos.x, this.pos.y);

    var separator = '|';
    context.font = '30px Oswald';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText(separator, this.pos.x + 15, this.pos.y);

    var directorScore = 'Director: ' + this.director;
    context.font = '30px Oswald';
    context.textAlign = 'left';
    context.fillStyle = '#d53533';
    context.fillText(directorScore, this.pos.x + 30, this.pos.y);

    if (typeof game.winner !== 'undefined') {
      var winText;
      if (game.winner == ENTTYPES.SURVIVOR) {
        winText = 'SURVIVORS WIN';
      } else if (game.winner == ENTTYPES.ENEMY) {
        winText = 'DIRECTOR WINS';
      }
      
      context.font = 'bold 100px Oswald';
      context.textAlign = 'center';
      context.fillStyle = '#402466';
      context.fillText(winText, me.video.getWidth() / 2, me.video.getHeight() / 2);
    } else if (this.respawned == 2) {
      this.respawned = 1;
      var thisObj = this;
      setTimeout(function() {
        thisObj.respawned = 0;
        me.game.HUD.updateItemValue('scoreItem');
      }, 2000);
    } 
    
    if (this.respawned == 1) { 
      var message = 'You were killed by a minion.  Respawning now...';
      this.respawn -= 1;

      context.font = 'bold 40px Oswald';
      context.textAlign = 'center';
      context.fillStyle = '#402466';
      context.fillText(message, me.video.getWidth() / 2, me.video.getHeight() / 2);
    }

    this.parent(context, x, y);
  }
});

