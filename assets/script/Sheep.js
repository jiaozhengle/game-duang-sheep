var SheepState = (function (t) {
    t[t.run = 0] = 'run';
    t[t.jump = 1] = 'jump';
    t[t.drop = 2] = 'drop';
    t[t.down = 3] = 'down';
    t[t.die = 4] = 'die'
    return t;
})({});

var Sheep = Fire.extend(Fire.Component, function () {
    this.skyMaxY = 160;
    this.anim = null;
    this.sheepSpritRender = 0;
    this.runAnimState = null;
    this.jumpAnimState = null;
    this.dropAnimState = null;
    this.downAnimState = null;
    this.dieAnimState = null;
    this.sheepState = SheepState.run;
    this.tempSpeed = 0;
});

Sheep.prop('gravity', 9.8);

Sheep.prop('speed', 300);

Sheep.prop('fLoorCoordinates', -180);

Sheep.prototype.onLoad = function () {
    this.anim = this.entity.getComponent(Fire.SpriteAnimation);
    this.runAnimState = this.anim.getAnimState('sheep_run');
    this.jumpAnimState = this.anim.getAnimState('sheep_jump');
    this.dropAnimState = this.anim.getAnimState('sheep_drop');
    this.downAnimState = this.anim.getAnimState('sheep_down');
    this.dieAnimState = this.anim.getAnimState('sheep_die');

    this.sheepSpritRender = this.entity.getComponent(Fire.SpriteRenderer);

    Fire.Input.on('mouseup', function (event) {
        if (this.entity.transform.y < this.skyMaxY) {
            this.anim.play(this.jumpAnimState, 0);
            this.sheepState = SheepState.jump;
            this.tempSpeed = this.speed;
        }
    }.bind(this));
};

Sheep.prototype.lateUpdate = function () {

    if (this.sheepState === SheepState.jump || this.sheepState === SheepState.drop) {
        this.tempSpeed -= (Fire.Time.deltaTime * 100) * this.gravity;
    }

    switch (this.sheepState) {
        case SheepState.run:
            break;
        case SheepState.jump:
            this.entity.transform.y += Fire.Time.deltaTime * this.tempSpeed;
            if (this.tempSpeed < 0) {
                this.anim.play(this.dropAnimState, 0);
                this.sheepState = SheepState.drop;
            }
            break;
        case SheepState.drop:
            this.entity.transform.y += Fire.Time.deltaTime * this.tempSpeed;
            if (this.entity.transform.y <= this.fLoorCoordinates) {
                this.entity.transform.y = this.fLoorCoordinates;
                this.anim.play(this.downAnimState, 0);
                this.sheepState = SheepState.down;
            }
            break;
        case SheepState.down:
            if (this.downAnimState && !this.anim.isPlaying(this.downAnimState.name)) {
                this.anim.play(this.runAnimState, 0);
                this.sheepState = SheepState.run;
            }
            break;
        case SheepState.die:
            break;
        default:
            break;
    }
};

module.exports = Sheep;
