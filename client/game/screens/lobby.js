var startingGame = false;

LobbyScreen = me.ScreenObject.extend( {
  init: function() {
    this.parent(true);
  },

  onResetEvent: function() {
    this.pen =  new me.Font('Arial', 32);
    this.pen.set('left');
    me.game.add(new me.ColorLayer('lightBlue', '#48b5b3', 1));
    this.lobbySeparator = generateSeparator(78);
    this.countdown = 3.95;

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
  },

  onDestroyEvent: function() {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);
  },

  update: function() {
    if (mainPlayerId == undefined) {
      // Re-request game state from server if somehow message wasn't received
      logger('Establishing connection with server', 1);
      socket.emit('this client is re-requesting the lobby state');
    } else if (parseInt(this.countdown) <= 0) {
      // A game is ready to start so switch to the play screen
      me.state.change(me.state.PLAY);
    } else {
      var player = lobby.players[mainPlayerId];

      // Left-right character choosing
      if (!player.isReady) {
        if (me.input.isKeyPressed('left')) {
          player.character--;
          if (player.character < 0) {
            player.character = CHARACTERS.length - 1;
          }
          socket.emit('this client changes their character', player.character)
        } else if (me.input.isKeyPressed('right')) {
          player.character++;
          if (player.character > CHARACTERS.length - 1) {
            player.character = 0;
          }
          socket.emit('this client changes their character', player.character)
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

    return true;
  },

  draw: function(context) {
    if (mainPlayerId == undefined) {
      context.font = 'bold 25px Oswald';
      this.pen.draw(context, 'Establishing connection with game server...', 80, 170);
    } else {
      var yPos = 10;

      /*
      * Title
      */
      context.font = 'bold 32px Jolly Lodger';
      this.pen.draw(context, 'SURVIVE THE NIGHT', 200 , yPos);

      /*
      * Character select
      */
      var characterXPos = 20;
      yPos += 90;
      context.font = '20px Oswald';
      for (var i=0; i < CHARACTERS.length; i++) {
        if (i == lobby.players[mainPlayerId].character) {
          context.fillStyle = 'white';
        } else {
          context.fillStyle = 'black';
        }
        // Draw director further right than the other chars
        if (i == CHARACTERS.length - 1) {
          characterXPos = characterXPos + 30;
        } 
        this.pen.draw(context, CHARACTERS[i], characterXPos, yPos);
        characterXPos += CHARACTERS[i].length * 12 + 10;
      }
      this.pen.draw(context, CHARACTERS[0], characterXPos + 30, yPos);

      /*
      * Ready-up message
      */
      context.fillStyle = 'red';
      context.font = 'bold 18px Droid Sans';
      yPos += 50;
      if (game.currentState == 0) {
        // For when a game hasn't started yet and everyone is in the lobby
        if (lobby.allReady) {
          this.pen.draw(context, 'Starting game in: ' + parseInt(this.countdown), 80, yPos);
          this.countdown -= .05;
        } else if (lobby.players[mainPlayerId].isReady) {
          this.pen.draw(context, 'Please wait semi-patiently until all players are ready', 70, yPos);
        } else {
          this.pen.draw(context, 'Choose your character then press ENTER to ready up', 80, yPos);
        }
      } else if (game.currentState == 1) {
        // For when a game is in progress and the client is joining in
        this.pen.draw(context, 'A game is in progress! Choose a character then press ENTER to join', 10, yPos);
      }

      /*
      * Players in lobby
      */
      // Draw: separator
      yPos += 5;
      context.font = '40px Oswald';
      context.fillStyle = 'black';
      this.pen.draw(context, this.lobbySeparator, 10, yPos);

      // Draw: 'Players:'
      yPos += 50;
      context.font = 'bold 18px Oswald';
      context.fillStyle = 'black';
      this.pen.draw(context, 'Players:', 20, yPos);

      // Draw: names of players
      yPos += 40;
      context.font = '16px Droid Sans';
      context.fillStyle = 'black';
      for (key in lobby.players) {
        var player = lobby.players[key];
        var displayText = player.name + ' - ' + CHARACTERS[player.character];
        // Append ready message if this player is ready to play
        if (player.isReady) {
          if (game.currentState == 0) {
            displayText += ' - ' + 'READY';
          } else if (game.currentState == 1) {
            displayText += ' - ' + 'IN GAME';
          }
        }
        this.pen.draw(context, displayText, 20, yPos);
        yPos += 25;
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
