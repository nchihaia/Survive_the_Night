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

    this.parent(context, x, y);
  }
});

