LobbyScreen = me.ScreenObject.extend( {
  init: function() {
    this.parent(true);
    this.name = 'lobby';
  },

  onResetEvent: function() {
    game = initGame();
    me.game.add(new me.ColorLayer('purple', '#ab6cff', 1));
    this.lobbySeparator = generateSeparator(me.video.getWidth() / 9);
    this.countdown = GAMECFG.countdownTime + 0.95;
    this.xCenter = me.video.getWidth() / 2;

    // init/re-init player
    if (typeof mainPlayerId !== 'undefined' && 
    typeof lobby.players[mainPlayerId] !== 'undefined') {
      lobby.players[mainPlayerId].isReady = false;
    }

    // Bind keys
    me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
    me.input.bindKey(me.input.KEY.LEFT, 'left', true);
    me.input.bindKey(me.input.KEY.RIGHT, 'right', true);
    me.input.bindKey(me.input.KEY.UP,	'up', true);
    me.input.bindKey(me.input.KEY.DOWN,	'down', true);

    // Add sample class models
    this.sampleSprites = [];
    for (var i=0; i < CHARCLASSES.length; i++) {
      this.sampleSprites[i] = new PlayerEntity(0, 0, {}, { charclass: i }); 
      me.game.add(this.sampleSprites[i], 2);
      this.sampleSprites[i].resize(1.5);
    }
    me.game.sort();
  },

  onDestroyEvent: function() {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);

    // remove sample player models
    for (var i=0; i < this.sampleSprites.length; i++) {
      me.game.remove(this.sampleSprites[i]);
    }
  },

  update: function() {
    if (typeof mainPlayerId === 'undefined' && typeof this.serverConnId === 'undefined') {
      logger('Need to re-request game state from server', 1);
      this.serverConnId = setInterval(reestablishServerConn, 2000); 
    } else if (mainPlayerId) {
      if (this.serverConnId) {
        clearInterval(this.serverConnId);
      }
      var player = lobby.players[mainPlayerId];

      if (parseInt(this.countdown, 10) <= 0) {
        // If countdown reaches 0, the game has already started (for other players),
        // whether or not this player is ready
        if (game.currentState === 0) {
          game.currentState = 1;
        }
        // Only switch to play screen if main player is ready
        if (player.isReady) {
          me.state.change(me.state.PLAY);
        }
      }
      
      // Only let a player change their class if they're not ready
      if (!player.isReady) {
        // Left-right class choosing
        if (!player.isReady) {
          if (me.input.isKeyPressed('left')) {
            player.charclass--;
            if (player.charclass < 0) {
              player.charclass = CHARCLASSES.length - 1;
            }
            socket.emit('this client changes their class', player.charclass);
          } else if (me.input.isKeyPressed('right')) {
            player.charclass++;
            if (player.charclass > CHARCLASSES.length - 1) {
              player.charclass = 0;
            }
            socket.emit('this client changes their class', player.charclass);
          }

          if (me.input.isKeyPressed('enter')) {
            // Check to see if client can select this character 
            // there can be (only one director for example)
            socket.emit('this client chooses a charclass', player.charclass);
          }
        }
      }
    }
    
    this.parent(this);
    return true;
  },

  draw: function(context) {
    if (typeof mainPlayerId === 'undefined') {
      context.font = 'bold 25px Oswald';
      context.textAlign = 'center';
      context.fillText(context, 'Establishing connection with game server...', this.xCenter, 200);
    } else {
      var yPos = 40;
      context.textAlign = 'center';

      /*
      * Title
      */
      // context.font = 'bold 40px Jolly Lodger';
      // context.fillStyle = '#301b4c';
      // context.fillText('SURVIVE THE NIGHT', this.xCenter, yPos);

      /*
      * Class select
      */
      var classXPos = 130;
      yPos += 80;
      for (var i=0; i < CHARCLASSES.length; i++) {
        // Draw director further right than the other classes
        if (i == CHARCLASS.DIRECTOR) {
          classXPos = classXPos + 100;
        } 
        // Position sample sprite
        this.sampleSprites[i].pos.x = classXPos - 15;
        this.sampleSprites[i].pos.y = yPos - 90;
        // Highlight the currently selected class
        if (i == lobby.players[mainPlayerId].charclass) {
          context.fillStyle = 'white';
          // this.sampleSprites[i].setCurrentAnimation('down');
        } else {
          context.fillStyle = 'black';
          // this.sampleSprites[i].setCurrentAnimation('stand_down');
        }
        // Draw class name
        context.font = '25px Oswald';
        context.fillText(CHARCLASSES[i].name, classXPos, yPos);
        // Draw class description
        context.fillStyle = 'black';
        context.font = '16px Droid Sans';
        context.fillText(CHARCLASSES[i].descript, classXPos, yPos + 20);
        // Draw pros and cons
        context.font = '12px Droid Sans';
        var attrYPos = yPos + 40;
        // Pros
        for (var j=0; j < CHARCLASSES[i].pros.length; j++) {
          context.fillStyle = '#296d0a';
          context.fillText('+ ' + CHARCLASSES[i].pros[j], classXPos, attrYPos);
          attrYPos += 15;
        }
        // Cons
        for (var k=0; k < CHARCLASSES[i].cons.length; k++) {
          context.fillStyle = 'red';
          context.fillText('- ' + CHARCLASSES[i].cons[k], classXPos, attrYPos);
          attrYPos += 15;
        }
        classXPos += 200;
      }

      /*
      * Ready-up message
      */
      context.fillStyle = 'black';
      context.font = 'bold 18px Droid Sans';
      yPos += 135;
      var text = 'Choose your class then press ENTER to ready up';
      if (game.currentState === 0) {
        // For when a game hasn't started yet and everyone is in the lobby
        if (lobby.allReady) {
          text = 'Starting game in: ' + parseInt(this.countdown, 10);
          // Decrement the countdown until it reaches 0
          if (this.countdown >= 1) {
            this.countdown -= 0.05;
          }
        } else if (lobby.players[mainPlayerId].isReady) {
          text = 'Please wait semi-patiently until the game starts';
        } else if (!lobby.nobodyReady) {
          text = 'A game is starting soon so hurry up and choose a character';
        } else {
          text = 'Choose your class then press ENTER to ready up';
        }
      } else if (game.currentState == 1) {
        if (typeof mainPlayerId !== 'undefined') {
          var mainPlayer = lobby.players[mainPlayerId];
          if (typeof mainPlayer !== 'undefined' && mainPlayer.isReady) {
            text = 'Loading map...';
          } else {
            // For when a game is in progress and the client is joining in
            text = 'A game is in progress! Choose a class then press ENTER to join';
          }
        }
      }
      context.fillText(text, this.xCenter, yPos);

      /*
      * Players in lobby
      */
      // Draw: separator
      yPos += 30;
      context.font = '40px Oswald';
      context.fillStyle = 'black';
      context.textAlign = 'center';
      context.fillText(this.lobbySeparator, this.xCenter, yPos);

      // Draw: 'Players:'
      yPos += 25;
      context.font = 'bold 18px Oswald';
      context.fillStyle = 'black';
      context.fillText('Players:', this.xCenter, yPos);

      // Draw: names of players
      yPos += 30;
      context.font = '16px Droid Sans';
      context.fillStyle = 'black';
      for (var playerId in lobby.players) {
        var player = lobby.players[playerId];
        var displayText = player.name + ' - ' + CHARCLASSES[player.charclass].name;
        // Append additional message if player is ready or in the game
        if (player.isReady) {
          if (game.currentState === 0) {
            displayText += ' - ' + 'READY';
          } else if (game.currentState === 1) {
            displayText += ' - ' + 'IN GAME';
          }
        } else if (game.currentState === 0) {
          displayText += ' - ' + 'IN LOBBY';
        }
        // Purple text for main player, black for everyone else
        if (playerId == mainPlayerId) {
          context.fillStyle = 'purple';
        } else {
          context.fillStyle = 'blue';
        }
        context.fillText(displayText, this.xCenter, yPos);
        yPos += 20;
      }
    }
  }
});

function generateSeparator(num) {
  var separator = '';
  for (var i=0; i < num; i++) {
    separator += '-';
  }
  return separator;
}
