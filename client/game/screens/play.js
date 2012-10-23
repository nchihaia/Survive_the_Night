var PlayScreen = me.ScreenObject.extend( {

  onResetEvent: function() {	
    me.levelDirector.loadLevel('level_name');
  },

  onDestroyEvent: function() {
  }
});
