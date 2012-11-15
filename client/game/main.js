var surviveTheNight = {

  // Initialize the game
  onload: function() {

    /* 
     * Debug stuff, comment out in production
     */
    // This causes the game to still be running even if the user has the
    // webpage out of focus/minimized/on another tab
    me.sys.pauseOnBlur = false;
    // 40fps limit
    me.sys.fps = 40;

    // Create the game screen, warning player if browser isn't compatible 
    if (!me.video.init('jsapp', 640, 448)) {
      alert("Your browser doesn't support this game");
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

    // Add each entity ONCE into the entity pool.  Even if there
    // are 4 bots, if they are defined by the same entity, the entity 
    // should only be added once to the entity pool
    me.entityPool.add('MainSurvivorEntity', MainSurvivorEntity);
    me.entityPool.add('OtherSurvivorEntity', OtherSurvivorEntity);

    // First screen client sees is the play screen
    me.state.change(me.state.PLAY);
    
    // Basic key bindings
    me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
    me.input.bindKey(me.input.KEY.LEFT, 'left');
    me.input.bindKey(me.input.KEY.RIGHT, 'right');
    me.input.bindKey(me.input.KEY.UP,	'up');
    me.input.bindKey(me.input.KEY.DOWN,	'down');

    // Tell the server that we have joined the game
    socket.emit('joining game');
  }
};

// When the webpage is loaded, start up the game by calling the onload function
window.onReady(function() {
  surviveTheNight.onload();
});
