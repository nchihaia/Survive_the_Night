var BulletProjectile = me.ObjectEntity.extend( {

  init: function(producer) {
    settings = {};
    settings.image = 'bullet';
    settings.spritewidth = 20;
    settings.spriteheight = 20;

    this.parent(0, 0, settings);
	
	this.setTransparency('#FFFFFF');//white
	
    this.addAnimation('vert', [0]);

    this.collidable = true;
    this.resize(1.0);

    this.producer = producer;
    this.damage = 1;

    this.vel.x = 0;
    this.vel.y = 0;
    this.pos.x = producer.pos.x;
    this.pos.y = (producer.top + producer.bottom) / 2;

    switch(producer.direction) {
      case 'up':
        this.vel.y = -20;
        this.pos.x += 6;
        this.angle = 0;
        this.flipY(flip=false);
        break;
      case 'down':
        this.vel.y = 20;
        this.pos.x += 10;
        this.angle = Number.prototype.degToRad (180);
        break;
      case 'left':
        this.vel.x = -20;
        this.pos.y -= 10;
        this.angle = Number.prototype.degToRad (270);
        this.flipX(false);
        break;
      case 'right':
        this.vel.x = 20;
        this.pos.y -= 14;
        this.angle = Number.prototype.degToRad (90);
    }
    this.setCurrentAnimation('vert');
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
