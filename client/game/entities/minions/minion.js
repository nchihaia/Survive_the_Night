var MinionEntity = Entity.extend( {

  init: function(producer, attrs) {
    settings = {};
    settings.image = MINIONTYPES[attrs.minionType].sprite;
    settings.spritewidth = 32;
    settings.spriteheight = 48;
    this.parent(0, 0, settings);

    this.defaultAnimationSet();

    this.collidable = true;
    
    customMerge(this, attrs, GAMECFG.minionFields);
    this.pos.x = attrs.posX || producer.pos.x;
    this.pos.y = attrs.posY || producer.pos.y;
    this.producer = producer;
    this.entType = MINIONTYPES[attrs.minionType].entType;
    this.maxHp = MINIONTYPES[attrs.minionType].baseHp;
    this.currHp = this.maxHp;
    this.damage = MINIONTYPES[attrs.minionType].damage;
    this.actionCooldownTime = MINIONTYPES[attrs.minionType].actionCooldownTime;
    this.isMinion = true;

    this.setId();
  },

  setId: function() {
    this.id = this.id || this.GUID;
    this.name = MINIONTYPES[this.minionType].name + ' ' + this.id;
  },

  update: function() {
    this.parent(this);
    return true;
  },

  draw: function(context) {
    this.drawHp(context);
    this.parent(context);
  },

  onDestroyEvent: function() {
    this.dropItem(AmmoCollectible);
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
