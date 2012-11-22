LobbyScreen = me.ScreenObject.extend( {
  init: function() {
    this.parent(true);
  },

  onResetEvent: function() {
    me.game.add(new me.ColorLayer('lightBlue', '#48b5b3', 1));
    this.lobbySeparator = generateSeparator(me.video.getWidth() / 9);
    this.countdown = 3.95;
    this.xCenter = me.video.getWidth() / 2;

    // init/re-init player
    if (lobby.players[mainPlayerId]) {
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
      this.sampleSprites[i] = new PlayerEntity(0, 0, {
        image: CHARCLASSES[i].sprite,
        spritewidth: 32,
        spriteheight: 48
      }); 
      me.game.add(this.sampleSprites[i], 2);
      this.sampleSprites[i].resize(1.5);
    }
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
    if (mainPlayerId == undefined && this.serverConnId == undefined) {
      logger('Need to re-request game state from server', 1);
      this.serverConnId = setInterval(reestablishServerConn, 2000); 
    } else if (mainPlayerId) {
      if (this.serverConnId) {
        clearInterval(this.serverConnId);
      }
      if (parseInt(this.countdown) <= 0) {
        // A game is ready to start so switch to the play screen
        me.state.change(me.state.PLAY);
      } else {
        var player = lobby.players[mainPlayerId];

        // Left-right class choosing
        if (!player.isReady) {
          if (me.input.isKeyPressed('left')) {
            player.charclass--;
            if (player.charclass < 0) {
              player.charclass = CHARCLASSES.length - 1;
            }
            socket.emit('this client changes their class', player.charclass)
          } else if (me.input.isKeyPressed('right')) {
            player.charclass++;
            if (player.charclass > CHARCLASSES.length - 1) {
              player.charclass = 0;
            }
            socket.emit('this client changes their class', player.charclass)
          }

          if (me.input.isKeyPressed('enter')) {
            if (game.currentState == 0) {
              socket.emit('this client is ready to play');
            } else if (game.currentState == 1) {
              // A game is already in progress so switch straight to the play screen
              me.state.change(me.state.PLAY);
            }
            lobby.players[mainPlayerId].isReady = true;
          }
        }
      }
    }

    return true;
  },

  draw: function(context) {
    if (mainPlayerId == undefined) {
      context.font = 'bold 25px Oswald';
      context.textAlign = 'center';
      context.fillText(context, 'Establishing connection with game server...', this.xCenter, 200);
    } else {
      var yPos = 40;

      /*
      * Title
      */
      context.font = 'bold 40px Jolly Lodger';
      context.textAlign = 'center';
      context.fillStyle = 'blue';
      context.fillText('SURVIVE THE NIGHT', this.xCenter, yPos);

      /*
      * Class select
      */
      var classXPos = 130;
      yPos += 120;
      for (var i=0; i < CHARCLASSES.length; i++) {
        // Draw director further right than the other classes
        if (i == CHARCLASSES.length - 1) {
          classXPos = classXPos + 100;
        } 
        // Position sample sprite
        this.sampleSprites[i].pos.x = classXPos - 15;
        this.sampleSprites[i].pos.y = yPos - 90;
        // Highlight the currently selected class
        if (i == lobby.players[mainPlayerId].charclass) {
          context.fillStyle = 'white';
          this.sampleSprites[i].setCurrentAnimation('down');
        } else {
          context.fillStyle = 'black';
          this.sampleSprites[i].setCurrentAnimation('stand_down');
        }
        // Draw class name
        context.font = '25px Oswald';
        context.fillText(CHARCLASSES[i].name, classXPos, yPos);
        // Draw class description
        context.fillStyle = 'black';
        context.font = '16px Droid Sans';
        context.fillText(CHARCLASSES[i].descript, classXPos, yPos + 30);
        // Draw pros and cons
        context.font = '14px Droid Sans';
        var attrYPos = yPos + 50;
        // Pros
        for (var j=0; j < CHARCLASSES[i].pros.length; j++) {
          context.fillStyle = 'green';
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
      yPos += 100;
      if (game.currentState == 0) {
        // For when a game hasn't started yet and everyone is in the lobby
        if (lobby.allReady) {
          context.fillText('Starting game in: ' + parseInt(this.countdown), this.xCenter, yPos);
          this.countdown -= .05;
        } else if (lobby.players[mainPlayerId].isReady) {
          context.fillText('Please wait semi-patiently until all players are ready', this.xCenter, yPos);
        } else {
          context.fillText('Choose your class then press ENTER to ready up', this.xCenter, yPos);
        }
      } else if (game.currentState == 1) {
        // For when a game is in progress and the client is joining in
        context.fillText('A game is in progress! Choose a class then press ENTER to join', this.xCenter, yPos);
      }

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
      for (key in lobby.players) {
        var player = lobby.players[key];
        var displayText = player.name + ' - ' + CHARCLASSES[player.charclass].name;
        // Append additional message if player is ready or in the game
        if (player.isReady) {
          if (game.currentState == 0) {
            displayText += ' - ' + 'READY';
          } else if (game.currentState == 1) {
            displayText += ' - ' + 'IN GAME';
          }
        } else if (game.currentState == 0) {
          displayText += ' - ' + 'IN LOBBY';
        }
        // Purple text for main player, black for everyone else
        if (key == mainPlayerId) {
          context.fillStyle = 'purple';
        } else {
          context.fillStyle = 'black';
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
