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

    /*
    * Winner
    */
    if (typeof game.winner !== 'undefined') {
      var winText;
      switch(game.winner) {
        case ENTTYPES.SURVIVOR:
          winText = 'SURVIVORS WIN';
          break;
        case ENTTYPES.ENEMY:
          winText = 'DIRECTOR WINS';
      }
      this.drawBigMessage(context, winText);
    }

    /*
    * Big message display
    */
    for (var index in MESSAGES) {
      var message = MESSAGES[index];
      if (this[message.name]) { 
        this.drawBigMessage(context, message.text, message.size, message.color);
      }
    }

    this.parent(context, x, y);
  },

  setMessage: function(messageName) {
    this[messageName] = true;
    this.messageTimeout(messageName);
  },

  messageTimeout: function(messageName) {
    setTimeout(function() {
      if (typeof game.score !== 'undefined') {
        game.score[messageName] = false;
        me.game.HUD.updateItemValue('scoreItem');
      }
    },  GAMECFG.bigMessageDisplayTime * 1000);
  },

  drawBigMessage: function(context, message, size, color) {
    size = size || '40px';
    context.font = 'bold ' + size + ' Oswald';
    context.textAlign = 'center';
    context.fillStyle = color || '#402466';
    context.fillText(message, me.video.getWidth() / 2, me.video.getHeight() / 2);
  }
});

