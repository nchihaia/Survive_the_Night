var TimeItem = me.HUD_Item.extend( {	

  init: function() {
    this.parent(me.video.getWidth() / 2, 35, game.time);
    this.rawVal = GAMECFG.startingTime;
  },

  draw: function(context, x, y) {
    var day = this.getDay();
    var hour = this.getHour();
    var minutes = this.getMinutes();
    var amPM = 'AM';

    if (hour > 11) {
      hour = hour - 12;
      amPM = 'PM';
    }

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    var timeDisplay = 'Day ' + day + ' - ' + hour + ':' + minutes + ' ' + amPM;

    context.font = 'bold 30px Oswald';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText(timeDisplay, this.pos.x, this.pos.y);

    this.parent(context, x, y);
  },

  getDay: function() {
    return parseInt((this.rawVal / 1440) + 1, 10);
  },

  getHour: function() {
    var relTime = this.rawVal % 1440;
    return parseInt(relTime / 60, 10);
  },

  getMinutes: function() {
     return this.rawVal % 60;
  }
});
