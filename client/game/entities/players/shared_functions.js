function keyboard_movement(player) {
  if (me.input.isKeyPressed('left')) {
    player.vel.x -= player.accel.x;
    player.direction = 'left';
  } else if (me.input.isKeyPressed('right')) {
    player.vel.x += player.accel.x;
    player.direction = 'right';
  }

  if (me.input.isKeyPressed('up')) {
    player.vel.y -= player.accel.y;
    player.direction = 'up';
  } else if (me.input.isKeyPressed('down')) {
    player.vel.y += player.accel.y;
    player.direction = 'down';
  }
}

function server_movement(player) {
  // If there are no more updates about player player's movements,
  // don't do anything
  if (player.updates.length == 0) {

    if (player.diff_x == 0 && player.diff_y == 0) {
      return;
    }

    if (!isNaN(player.diff_x)) {
      player.pos.x += player.diff_x;
    }
    if (!isNaN(player.diff_y)) {
      player.pos.y += player.diff_y;
    }

  } else {
    // Pop an item off player teammate's update stack and set the
    // teammate's position to the coordinates defined by it
    updateItem = player.updates.shift();

    player.diff_x = updateItem.pos_x - player.pos_x
    player.diff_y = updateItem.pos_y - player.pos_y

    player.pos.x = updateItem.pos_x;
    player.pos.y = updateItem.pos_y;
    player.animation = updateItem.animation;
  }

  // res = me.game.collide(player);
  player.updateMovement();
  player.setCurrentAnimation(player.animation);
}
