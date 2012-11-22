var surviveTheNight = {

  // Initialize the game
  onload: function() {

    // This causes the game to still be running even if the user has the
    // webpage out of focus/minimized/on another tab
    me.sys.pauseOnBlur = false;
    // 30fps limit
    me.sys.fps = 30;

    // Create the game screen, warning player if browser isn't compatible 
    if (!me.video.init('jsapp', 960, 540, true)) {
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
    me.state.set(me.state.LOBBY, new LobbyScreen());

    // Add each entity ONCE into the entity pool.  Even if there
    // are 4 bots, if they are defined by the same entity, the entity 
    // should only be added once to the entity pool
    me.entityPool.add('MainSurvivorEntity', MainSurvivorEntity);
    me.entityPool.add('OtherSurvivorEntity', OtherSurvivorEntity);

    // First screen client sees is the play screen
    me.state.change(me.state.LOBBY);

    // Tell the server we joined the lobby
    var mainName = prompt("Type your player's name:", Math.random().toString(36).substr(2, 4));
    socket.emit('this client first joins the lobby', mainName);
  }
};

// When the webpage is loaded, start up the game by calling the onload function
window.onReady(function() {
  surviveTheNight.onload();
});
