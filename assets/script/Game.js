var Game = Fire.extend(Fire.Component, function () {
    Game.instance = this;
});

Game.instance = null;

Game.prop('createTime', 3);

Game.prop('speed', 0);

//-- 创建时初始X坐标
Game.prop('initPipeGroupPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

Game.prop('pipe', null, Fire.ObjectType(Fire.Entity));

Game.prop('pipeGroup', null, Fire.ObjectType(Fire.Entity));

Game.prop('btn_crePipe', null, Fire.ObjectType(Fire.Entity));

Game.prototype.onLoad = function () {
    this.lastTime = 10;
};

Game.prototype.update = function () {
    //-- 每过一段时间创建管道
    var curTime = Math.abs(Fire.Time.time - this.lastTime);
    if (curTime >= this.createTime) {
        this.lastTime = Fire.Time.time;
        this.createPipeGroup();
        console.log("DD");
    }
};

Game.prototype.createPipeGroup = function () {
    var entity = new Fire.Entity('group');
    var pipeGropComp = entity.addComponent('PipeGroup')
    entity.parent = this.pipeGroup;
    entity.transform.position = this.initPipeGroupPos;
    pipeGropComp.create();
};

module.exports = Game;
