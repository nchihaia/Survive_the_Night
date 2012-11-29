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

    // 0 means 12
    if (hour === 0) {
      hour = 12;
    }

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    var timeDisplay = 'Day ' + day + ' - ' + hour + ':' + minutes + ' ' + amPM;

    context.font = 'bold 25px Droid Sans';
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
  },

  isNighttime: function() {
    var hour = this.getHour();
    // Nighttime between 6PM-7AM
    if (hour < 7 || hour >= 18) {
      return true;
    }
    return false;
  }
});
