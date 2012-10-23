var surviveTheNight = {

  // Initialize game
  onload: function() {

    // Debug stuff, comment out in production
    me.sys.pauseOnBlur = false;
    me.sys.fps = 40;

    // Create the game screen, warning player if browser isn't compatible 
    if (!me.video.init('jsapp', 640, 480)) {
      alert('Your browser doesn't support this game');
      return;
    }

    // Load all of our assets, displaying a loading screen
    me.loader.onload = this.loaded.bind(this);
    me.loader.preload(assets);
    me.state.change(me.state.LOADING);
  },

  // Callback for when all assets are loaded 
  loaded: function() {	
    
    // Add game screens
    me.state.set(me.state.PLAY, new PlayScreen());

    // Add each entity ONCE into the entity pool
    me.entityPool.add('MainPlayerEntity', MainPlayerEntity);

    // First screen client sees is the play screen
    me.state.change(me.state.PLAY);
    
    // Basic key bindings
    me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
    me.input.bindKey(me.input.KEY.LEFT, 'left');
    me.input.bindKey(me.input.KEY.RIGHT, 'right');
    me.input.bindKey(me.input.KEY.UP,	'up');
    me.input.bindKey(me.input.KEY.DOWN,	'down');
  }
};

window.onReady(function() {
  gemCollector.onload();
});


