var PlayScreen = me.ScreenObject.extend( {

  onResetEvent: function() {	
    // Bind needed keys
    me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
    me.input.bindKey(me.input.KEY.ESC, 'esc', true);
    me.input.bindKey(me.input.KEY.LEFT, 'left');
    me.input.bindKey(me.input.KEY.RIGHT, 'right');
    me.input.bindKey(me.input.KEY.UP,	'up');
    me.input.bindKey(me.input.KEY.DOWN,	'down');

    // Load the default level.  These levels are defined in assets.js
    me.levelDirector.loadLevel('map_01');

    socket.emit('this client is in the game');
    game.currentState = 1;
  },

  onDestroyEvent: function() {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.ESC);
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);
  }
});
