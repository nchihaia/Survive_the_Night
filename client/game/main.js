var surviveTheNight = {

  // Initialize the game
  onload: function() {

    // This causes the game to still be running even if the user has the
    // webpage out of focus/minimized/on another tab
    me.sys.pauseOnBlur = false;
    // 30fps limit
    me.sys.fps = GAMECFG.fps;
    // Gravity off
    me.sys.gravity = 0;
    // Enable frame interpolation
    // me.sys.interpolation = true;

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

    // First screen client sees is the play screen
    me.state.change(me.state.LOBBY);

    // Tell the server we joined the lobby
    var mainName = prompt("Type your player's name:", randomString(4));
    socket.emit('this client first joins the lobby', mainName);
  }
};

// When the webpage is loaded, start up the game by calling the onload function
window.onReady(function() {
  surviveTheNight.onload();
});

// If the user exists the page, tell the server that they have disconnected
// This isn't triggered when the client refreshes the page though (would need to
// uncomment the return).
window.onbeforeunload = function() {
  socket.emit('this client leaves the game');
  // Hide dialog box if there is no return
  // return true;
};
