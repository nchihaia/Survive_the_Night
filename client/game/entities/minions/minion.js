var MinionEntity = PathfindingEntity.extend( {

  init: function(producer, attrs) {
    settings = {};
    settings.image = MINIONTYPES[attrs.minionType].sprite;
    settings.spritewidth = 39;
    settings.spriteheight = 48;
    this.parent(0, 0, settings);

    this.defaultAnimationSet();

    this.collidable = true;
    this.setVelocity(MINIONTYPES[attrs.minionType].speed, MINIONTYPES[attrs.minionType].speed);
    this.setFriction(0.7, 0.7);
    this.setMaxVelocity(MINIONTYPES[attrs.minionType].maxSpeed, MINIONTYPES[attrs.minionType].maxSpeed);

    customMerge(this, attrs, GAMECFG.minionFields);
    this.pos.x = attrs.posX || producer.pos.x;
    this.pos.y = attrs.posY || producer.pos.y;
    this.producer = producer;
    this.entType = MINIONTYPES[attrs.minionType].entType;
    this.damage = MINIONTYPES[attrs.minionType].damage;
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
    if (typeof game.players[mainPlayerId] !== 'undefined' && game.players[mainPlayerId].charclass == CHARCLASS.DIRECTOR) {
      if (typeof this.target === 'undefined' || 
         (typeof this.target !== 'undefined' && !this.target.alive)) {
          var playerKeys = Object.keys(game.players);
          var randomIndex = parseInt(Math.random() * playerKeys.length, 10);
          this.target = game.players[playerKeys[randomIndex]];
          // // Make sure player picked is not the director
          // if (randomPlayer.charclass != CHARCLASS.DIRECTOR && playerKeys.length === 1) {
            //   while (this.target.charclass == CHARCLASS.DIRECTOR) {
              //     randomPlayerKey = parseInt(Math.random() * playerKeys.length, 10);
              //     this.target = game.players[randomPlayerKey];
              //   }
              // }
          var mainPlayer = game.players[mainPlayerId];
          mainPlayer.newActions.minionTargets = mainPlayer.newActions.minionTargets || [];
          mainPlayer.newActions.minionTargets.push({
            minionId: this.id,
            targetId: this.target.id
          });
        }
    }

    if (typeof this.target !== 'undefined') {
      this.findPath(this.target.pos.x, this.target.pos.y);
    }

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
        if (roll === 0) {
          this.dropItem(AmmoCollectible);
        } else {
          this.dropItem(MedkitCollectible);
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
  }
});
