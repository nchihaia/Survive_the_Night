var BulletProjectile = me.ObjectEntity.extend( {

  init: function(producer) {
    settings = {};
    settings.image = 'bullet';
    settings.spritewidth = 10;
    settings.spriteheight = 10;

    this.parent(0, 0, settings);

    this.addAnimation('vert', [0]);
    this.addAnimation('horiz', [1]);

    this.collidable = true;
    this.resize(0.6);

    this.producer = producer;
    this.damage = 1;

    this.vel.x = 0;
    this.vel.y = 0;
    this.pos.x = producer.pos.x;
    this.pos.y = (producer.top + producer.bottom) / 2;
    switch(producer.direction) {
      case 'up':
        this.vel.y = -20;
        this.pos.x += 12;
        this.setCurrentAnimation('vert');
        break;
      case 'down':
        this.vel.y = 20;
        this.pos.x += 12;
        this.setCurrentAnimation('vert');
        break;
      case 'left':
        this.vel.x = -20;
        this.setCurrentAnimation('horiz');
        break;
      case 'right':
        this.vel.x = 20;
        this.setCurrentAnimation('horiz');
    }
  },

  update: function() {
    this.computeVelocity(this.vel);
    this.pos.add(this.vel);

    // Remove bullet if it hits a solid tile
    var tileRes = this.updateMovement();
    if (tileRes && (tileRes.x !== 0 || tileRes.y !== 0)) {
      me.game.remove(this);
    }

    // Check for collisions with entities
    var entRes = me.game.collide(this);
    if (entRes && entRes.obj.entType && entRes.obj.entType == ENTTYPES.ENEMY) {
      // If the main player fired the bullet, tell this to the server
      if (this.producer.id == mainPlayerId) {
        var enemy = entRes.obj;
        var player = game.players[mainPlayerId];
        player.performAttack(enemy, this);
      }
      me.game.remove(this);
    }

    this.parent(this);
    return true;
  }
});
