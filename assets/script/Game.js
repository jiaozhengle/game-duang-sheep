var Sheep = require('Sheep');

var Game = Fire.extend(Fire.Component, function () {
    Game.instance = this;
});

Game.instance = null;

Game.prop('createPipeTime', 5);

Game.prop('speed', 0);

//-- 创建时初始X坐标
Game.prop('initPipeGroupPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

Game.prop('pipe', null, Fire.ObjectType(Fire.Entity));

Game.prop('pipeGroup', null, Fire.ObjectType(Fire.Entity));

Game.prop('btn_crePipe', null, Fire.ObjectType(Fire.Entity));

Game.prototype.onLoad = function () {
    this.fraction = 0;
    this.sheep = Fire.Entity.find('/sheep').getComponent(Sheep);
    this.lastTime = 10;
    this.pipeGroupList = [];
    this.entity.on("destroy-PipeGroup", function (event) {
        if (this.pipeGroupList) {
            var index = this.pipeGroupList.indexOf(event.target);
            this.pipeGroupList.splice(index, 1);
        }
    }.bind(this));

    //-- 分数
    this.fractionBtmpFont = Fire.Entity.find('/fraction').getComponent(Fire.BitmapText);
};

Game.prototype.update = function () {
    //-- 每过一段时间创建管道
    var curTime = Math.abs(Fire.Time.time - this.lastTime);
    if (curTime >= this.createPipeTime) {
        this.lastTime = Fire.Time.time;
        this.createPipeGroup();
    }

    //-- 绵羊通过管道的计算 && 计算分数
    if (this.pipeGroupList && this.pipeGroupList.length > 0) {
        for (var i = 0, len = this.pipeGroupList.length; i < len; ++i) {
            var pipeGroupEntity = this.pipeGroupList[i];
            var pipeGropComp = this.pipeGroupList[i].getComponent('PipeGroup');
            var sheepX = (this.sheep.transform.x - this.sheep.sheepSpritRender.width / 2 );
            var pipeGroupX = (pipeGroupEntity.transform.x + pipeGropComp.pipeGroupWith / 2 );
            if (!pipeGropComp.hasPassed && sheepX > pipeGroupX) {
                pipeGropComp.hasPassed = true;
                this.fraction++;
                this.fractionBtmpFont.text = this.fraction;
            }
        }
    }
};

//-- 创建管道组
Game.prototype.createPipeGroup = function () {
    var entity = new Fire.Entity();
    var pipeGropComp = entity.addComponent('PipeGroup')
    entity.parent = this.pipeGroup;
    entity.transform.position = this.initPipeGroupPos;
    pipeGropComp.create();
    this.pipeGroupList.push(entity);
};

module.exports = Game;
