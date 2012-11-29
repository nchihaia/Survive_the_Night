var PlayScreen = me.ScreenObject.extend( {

  onResetEvent: function() {	
    this.name = 'play';
    // Bind needed keys
    me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
    me.input.bindKey(me.input.KEY.ESC, 'esc', true);
    me.input.bindKey(me.input.KEY.LEFT, 'left');
    me.input.bindKey(me.input.KEY.RIGHT, 'right');
    me.input.bindKey(me.input.KEY.UP,	'up');
    me.input.bindKey(me.input.KEY.DOWN,	'down');
    me.input.bindKey(me.input.KEY.SHIFT,	'shift');
    me.input.bindKey(me.input.KEY.D, 'action');

    // Load the default level.  These levels are defined in assets.js
    me.levelDirector.loadLevel(game.map);

    // Add a HUD (whole screen coverage)
    me.game.addHUD(0, 0, me.video.getWidth(), me.video.getHeight());

    // Time UI
    game.time = new TimeItem();
    me.game.HUD.addItem('timeItem', game.time);

    // Score UI
    game.score = new ScoreItem();
    me.game.HUD.addItem('scoreItem', game.score);

    // Intervals
    var timeIntervalRate = 10000 / GAMECFG.gameMinutesPerSecond;
    this.incrementTimeId = setInterval(incrementTime, timeIntervalRate);
    this.sendUpdateId = setInterval(sendUpdate, 1000 / GAMECFG.clientUpdatesPerSecond);

    // day night overlay
    this.lightOverlay = new me.ColorLayer('lightOverlay', '#0d0954', 5);
    this.lightOverlay.opacity = 0;
    me.game.add(this.lightOverlay, 5);
    this.tweenStep = (GAMECFG.maxLightOpacity - GAMECFG.minLightOpacity) / 12;
    this.lightTween();

    // Add main player
    addMainPlayer();

    game.currentState = 1;
    socket.emit('this client is in the game');
  },

  onDestroyEvent: function() {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.ESC);
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);
    me.input.unbindKey(me.input.KEY.SHIFT);
    me.input.unbindKey(me.input.KEY.D);

    clearInterval(this.incrementTimeId);
    clearInterval(this.sendUpdateId);
    
    if (typeof this.lightOverlay !== 'undefined') {
      me.game.remove(this.lightOverlay);
    }

    if (typeof game.players[mainPlayerId] !== 'undefined') {
      me.game.remove(game.players[mainPlayerId]);
    }
    
    if (typeof game.time !== 'undefined') {
      me.game.HUD.removeItem('timeItem');
    }

    if (typeof game.score !== 'undefined') {
      me.game.HUD.removeItem('scoreItem');
    }

    if (typeof game.charItem !== 'undefined') {
      me.game.HUD.removeItem('charItem');
    }
  },

  lightTween: function() {
    var hour = game.time.getHour();
    // Min opacity at tweenMul = 0.  Max opacity at tweenMul = 12
    var tweenMul = 0;
    var lastHour = 0;
    
    if (hour >= 0 && hour < 6) {
      // From midnight to 6AM
      lastHourToTween = 5;
      tweenMul = 8; 
    } else if (hour == 6) {
      // From 6AM to 7AM
      lastHourToTween = 6;
      tweenMul = 4;
    } else if (hour >= 7 && hour < 12) {
      // From 7AM to noon
      lastHourToTween = 11;
      tweenMul = 0; 
    } else if (hour >= 12 && hour < 17) {
      // From noon to 5PM
      lastHourToTween = 16;
      tweenMul = 3; 
    } else if (hour == 17) {
      // From 5PM to 6PM
      lastHourToTween = 17;
      tweenMul = 8; 
    } else if (hour >= 18 && hour < 24) {
      // From 6PM to midnight 
      lastHourToTween = 24;
      tweenMul = 12; 
    }

    var tweenTo = GAMECFG.minLightOpacity + (tweenMul * this.tweenStep);
    var msToTween = (lastHourToTween - hour + 1) * (60000 / GAMECFG.gameMinutesPerSecond);

    var tween = new me.Tween(this.lightOverlay)
    .to({ opacity: tweenTo }, msToTween)
    .onComplete(function() {  
      me.state.current().lightTween();
    }).start();
  }
});


