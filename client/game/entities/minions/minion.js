var target;
var MinionEntity = PathfindingEntity.extend( {

  init: function(producer, attrs) {
    settings = {};
    settings.image = MINIONTYPES[attrs.minionType].sprite;
    settings.spritewidth = 32;
    settings.spriteheight = 48;
    this.parent(0, 0, settings);

    this.defaultAnimationSet();

    this.collidable = true;
    this.setVelocity(7, 7);
    this.setFriction(0.7, 0.7);
    this.setMaxVelocity(10, 10);
    this.target = this.producer;

    customMerge(this, attrs, GAMECFG.minionFields);
    this.pos.x = attrs.posX || producer.pos.x;
    this.pos.y = attrs.posY || producer.pos.y;
    this.producer = producer;
    this.entType = MINIONTYPES[attrs.minionType].entType;
    this.damage = MINIONTYPES[attrs.minionType].damage;
    this.dmgMultiplier = 1;
    this.actionCooldownTime = MINIONTYPES[attrs.minionType].actionCooldownTime;
    this.isMinion = true;

    // Set Hp.  This value could come from some attribute set on the server side or
    // a default value from the config if no value is passed through attrs
    if (typeof this.maxHp === 'undefined') {
      this.maxHp = MINIONTYPES[attrs.minionType].baseHp;
    }
    if (typeof this.currHp === 'undefined') {
      this.currHp = this.maxHp;
    }

    // Set id and name of the entity.  This is done after init so that
    // we can grab the GUID set by melonJS
    this.setId();
  },

  setId: function() {
    this.id = this.id || this.GUID;
    this.name = MINIONTYPES[this.minionType].name + ' ' + this.id;
  },

  update: function() {
    // Pick a random survivor to attack
    if(this.target == undefined)
        {this.target = this.producer;}
    this.findTarget();
      this.findPath(this.target.pos.x, this.target.pos.y);

    this.parent(this);
    return true;
  },

  draw: function(context) {
    this.drawHp(context);
    this.parent(context);
  },

  onDestroyEvent: function() {
    if (me.state.current().name === 'play') {
      // increment survivor's score
      game.score.survivors += MINIONTYPES[this.minionType].points;
      me.game.HUD.updateItemValue('scoreItem');

      // Drops either an ammo box or medkit for survivors only
      if (game.players[mainPlayerId].charclass != CHARCLASS.DIRECTOR) {
        var roll = parseInt(2 * Math.random(), 10);
        var collectible;
        if (roll === 0) {
          collectible = AmmoCollectible;
        } else {
          collectible = MedkitCollectible;
        }
        this.dropItem(collectible);
        // Drop another of the same pickup if minion's slayer was support
        // (Since the first collectible is dropped exactly where the minion is
        // standing, drop this second one at an offset for some visual distinction)
        if (typeof this.slayer !== 'undefined' && 
            this.slayer.charclass == CHARCLASS.SUPPORT) {
          this.dropItem(collectible, {
            x: this.pos.x + 20,
            y: this.pos.y + 20 
          });
        }
      }
    }
  },

  performAbility: function(target, ability) {
    if (typeof ability === 'undefined') {
      ability = { damage: this.damage };
    }
    var damage = this.performAttack(target, ability);
    return damage;
  },

  performAttack: function(target, attack) {
    var damage = this.parent(target, attack);
    return damage;
  },
  findTarget: function()
  {
      if(!this.target.alive)
          {this.target = this.producer;}
    var gameObj = game.pubData || game;
    for (var playerId in gameObj.players)
        {
           var closest = gameObj.players[playerId];
           if((this.distanceTo(closest) < this.distanceTo(this.target) && closest.entType == 0 && closest.alive) || this.target.pos == this.producer.pos)
               {this.target = closest;}
        }
  }
});
