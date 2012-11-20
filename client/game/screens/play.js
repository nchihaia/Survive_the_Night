var PlayScreen = me.ScreenObject.extend( {

  // Init only required if we need to call update function
  init: function() {
    this.parent(true);
  },

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

    this.mainPlayerEntity = new MainSurvivorEntity(200, 200, {
      image: PLAYERCLASSES[lobby.players[mainPlayerId].charclass].sprite,
      spritewidth: 32,
      spriteheight: 48
    });
    me.game.add(this.mainPlayerEntity, 2);

    // day night overlay
    this.lightOverlay = new me.ColorLayer('lightOverlay', '#0d0954', 5);
    this.lightOverlay.increment = 0.001;
    this.lightOverlay.opacity = 0.001;
    me.game.add(this.lightOverlay, 5);
  },

  onDestroyEvent: function() {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.ESC);
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);

    me.game.remove(this.mainPlayerEntity);
    me.game.remove(this.lightOverlay);
  },

  update: function() {
    if (this.lightOverlay.opacity >= 0.75) {
      this.lightOverlay.increment = -0.001;
    } else if (this.lightOverlay.opacity <= 0.001) {
      this.lightOverlay.increment = 0.001;
    }
    this.lightOverlay.opacity += this.lightOverlay.increment;
  }
});
