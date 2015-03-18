// Effect
var Effect = { };

Effect.create = function (tempEntity, pos) {
    var effect = Fire.instantiate(tempEntity);
    var effectAnim = effect.getComponent(Fire.SpriteAnimation);
    effect.transform.position = pos;
    effectAnim.play();
};

module.exports = Effect;