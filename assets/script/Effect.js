// Effect
var Effect = {
    toYPos        : Fire.Vec2.zero,
    manually      : false,
    tempDisappear : null,
    manuallyEffect: null
};

Effect.init = function () {
    this.tempDisappear = Fire.Entity.find('/Prefabs/disappear');
};

Effect.create = function (tempEntity, pos) {
    var effect = Fire.instantiate(tempEntity);
    effect.transform.position = pos;
    var effectAnim = effect.getComponent(Fire.SpriteAnimation);
    effectAnim.play();
};

Effect.createManuallyEffectUpMove = function (tempEntity, pos, toUpPos) {
    this.manuallyEffect = Fire.instantiate(tempEntity);
    this.manuallyEffect.transform.position = pos;
    this.manually = true;
    this.toYPos = this.manuallyEffect.transform.position.y + toUpPos;
};

Effect.onRefresh = function () {
    if (this.manually) {
        this.manuallyEffect.transform.y += Fire.Time.deltaTime * 200;
        if (this.manuallyEffect.transform.y > this.toYPos) {
            var disappear = Fire.instantiate(this.tempDisappear);
            var disappearAnim = disappear.getComponent(Fire.SpriteAnimation);
            disappear.transform.position = this.manuallyEffect.transform.position;
            disappearAnim.play();

            this.manuallyEffect.destroy();
            this.manually = false;
            this.manuallyEffect = null;
            this.toYPos = 0;
        }
    }
};

module.exports = Effect;