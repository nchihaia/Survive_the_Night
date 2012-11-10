var PlayScreen = me.ScreenObject.extend( {

  onResetEvent: function() {	
    // Load the default level.  These levels are defined in assets.js
    me.levelDirector.loadLevel('map_01');
  },

  onDestroyEvent: function() {
  }
});
