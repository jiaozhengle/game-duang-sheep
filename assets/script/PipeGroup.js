var PipeGroup = Fire.extend(Fire.Component, function () {
    //-- 基础移动速度
    this.speed_ = 100;
    //-- ( Beyond this range will be destroyed ) 超出这个范围就会被销毁
    this.range_ = -600;
    //-- 最大间距
    this.maxSpacing = 250;//280;
    //-- 最小间距
    this.minSpacing = 222; //250;
    //-- 上一次随机到的管道类型
    this.lastPipeType = null;
    //-- 管道的宽度
    this.pipeGroupWith = 0;
});

//-- 管道的类型
var PipeType = (function (t) {
    t[t.Bottom = 0] = 'bottom';        // 上方管子
    t[t.Top = 1] = 'top';           // 上方管子
    t[t.Double = 2] = 'double';        // 下上方管子
    return t;
})({});

PipeGroup.prop('hasPassed', false);

//-- 管道类型
PipeGroup.prop('pipeType', PipeType.Top, Fire.Enum(PipeType));

//-- 上方管子坐标范围 Max 与 Min
PipeGroup.prototype.TopPipePosRange = new Fire.Vec2(800, 710);

//-- 下方管子坐标范围 Max 与 Min
PipeGroup.prototype.BottomPipePosRange = new Fire.Vec2(-750, -800);

//-- 双个上方管子坐标范围 Max 与 Min
PipeGroup.prototype.DoubleTopPipePosRange = new Fire.Vec2(1050, 710);

//-- 双个下方管子坐标范围 Max 与 Min
PipeGroup.prototype.DoubleBottomPipePosRange = new Fire.Vec2(-800, -980);

PipeGroup.prototype.onLoad = function () {
    this.pipe = Fire.Entity.find('/Prefabs/pipe');
};

PipeGroup.prototype.randomPipeType = function () {
    var randomVlue = Math.floor(Math.random() * 100) + 1;
    if (randomVlue >= 1 && randomVlue <= 60) {
        return PipeType.Double;
    }
    else if (randomVlue >= 60 && randomVlue <= 80) {
        return PipeType.Bottom;
    }
    else {
        return PipeType.Top;
    }
}

PipeGroup.prototype.create = function () {
    if (this.lastPipeType !== null && this.lastPipeType === PipeType.Top) {
        while (this.lastPipeType === this.pipeType) {
            this.pipeType = this.randomPipeType();
        }
    }
    else {
        this.pipeType = this.randomPipeType();
        //-- 为了体验，防止第一次出现的管道是上方的
    }
    this.entity.name = PipeType[this.pipeType];
    switch (this.pipeType) {
        case PipeType.Bottom:
            this.initBottomPipe();
            break;
        case PipeType.Top:
            this.initTopPipe();
            break;
        case PipeType.Double:
            this.initDoublePipe();
            break;
        default:
            break;
    }
};

PipeGroup.prototype.initTopPipe = function () {
    var topPipe = Fire.instantiate(this.pipe);
    var topPipeRender = topPipe.getComponent(Fire.SpriteRenderer);
    var randomY = Math.randomRange(this.TopPipePosRange.x, this.TopPipePosRange.y);

    topPipe.parent = this.entity;
    topPipe.transform.x = 0;
    topPipe.transform.y = randomY;
    topPipe.transform.scaleY = 1;
    topPipe.name = 'topPipe';

    this.pipeGroupWith = topPipeRender.width;
};

PipeGroup.prototype.initBottomPipe = function () {
    var bottomPipe = Fire.instantiate(this.pipe);
    var bottomPipeRender = bottomPipe.getComponent(Fire.SpriteRenderer);
    var randomY = Math.randomRange(this.BottomPipePosRange.x, this.BottomPipePosRange.y);

    bottomPipe.parent = this.entity;
    bottomPipe.transform.x = 0;
    bottomPipe.transform.y = randomY;
    bottomPipe.transform.scaleY = -1;
    bottomPipe.name = 'bottomPipe';

    this.pipeGroupWith = bottomPipeRender.sprite.width;
};

PipeGroup.prototype.initDoublePipe = function () {
    var topPipe = Fire.instantiate(this.pipe);
    var bottomPipe = Fire.instantiate(this.pipe);
    var topPipeRender = topPipe.getComponent(Fire.SpriteRenderer);
    var bottomPipeRender = topPipe.getComponent(Fire.SpriteRenderer);

    var randomTopY = 0;
    var randomBottomY = 0;
    var topY = 0;
    var bottomY = 0;
    var spacing = 0;

    while (spacing < this.minSpacing || spacing > this.maxSpacing) {
        randomTopY = Math.randomRange(this.DoubleTopPipePosRange.x, this.DoubleTopPipePosRange.y);
        randomBottomY = Math.randomRange(this.DoubleBottomPipePosRange.x, this.DoubleBottomPipePosRange.y);
        topY = randomTopY - (topPipeRender.sprite.height / 2);
        bottomY = randomBottomY + (bottomPipeRender.sprite.height / 2);
        if (topY < 0 || bottomY > 0) {
            spacing = Math.abs(topY) - Math.abs(bottomY);
        }
        else {
            spacing = Math.abs(topY) + Math.abs(bottomY);
        }
    }
    topPipe.parent = this.entity;
    topPipe.transform.x = 0;
    topPipe.transform.y = randomTopY;
    topPipe.transform.scaleY = 1;
    topPipe.name = 'topPipe';

    bottomPipe.parent = this.entity;
    bottomPipe.transform.x = 0;
    bottomPipe.transform.y = randomBottomY;
    bottomPipe.transform.scaleY = -1;
    bottomPipe.name = 'bottomPipe';

    this.pipeGroupWith = bottomPipeRender.sprite.width;
};

PipeGroup.prototype.onRefresh = function (gameSpeed) {
    this.entity.transform.x -= Fire.Time.deltaTime * ( this.speed_ + gameSpeed );
    if (this.entity.transform.x < this.range_) {
        this.entity.destroy();
        this.entity.dispatchEvent(new Fire.Event("destroy-PipeGroup", true));
    }
};

module.exports = PipeGroup;
