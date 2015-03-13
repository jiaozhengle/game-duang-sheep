var Sheep = require('Sheep');
var Floor = require('Floor');
var Collision = require('Collision');
var GameOverWindow = require('GameOverWindow');

var GameState = (function (t) {
    t[t.ready = 0] = 'ready';
    t[t.run = 1] = 'run';
    t[t.over = 2] = 'over';
    return t;
})({});

var Game = Fire.extend(Fire.Component, function () {
    Game.instance = this;
});

Game.GameState = GameState;

Game.instance = null;

Game.prop('createPipeTime', 5);

Game.prop('gameSpeed', 0);

//-- 绵羊初始X坐标
Game.prop('initSheepPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

//-- 创建时管道初始X坐标
Game.prop('initPipeGroupPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

Game.prop('pipeGroup', null, Fire.ObjectType(Fire.Entity));

Game.prop('btn_crePipe', null, Fire.ObjectType(Fire.Entity));

Game.prototype.onLoad = function () {
    //-- 游戏状态
    this.gameState = GameState.run;

    this.gameOverWindow = Fire.Entity.find('/GameOverWindow');

    this.floor = Fire.Entity.find('/floor').getComponent(Floor);
    this.sheep = Fire.Entity.find('/sheep').getComponent(Sheep);

    Fire.Input.on('mouseup', function (event) {
        if (this.gameState === GameState.over) {
            return;
        }
        var Sheep = require('Sheep');
        this.sheep.anim.play(this.sheep.jumpAnimState, 0);
        this.sheep.sheepState = Sheep.SheepState.jump;
        this.sheep.tempSpeed = this.sheep.speed;
    }.bind(this));

    this.lastTime = 10;
    this.pipeGroupList = [];
    this.entity.on("destroy-PipeGroup", function (event) {
        if (this.pipeGroupList) {
            var index = this.pipeGroupList.indexOf(event.target);
            this.pipeGroupList.splice(index, 1);
        }
    }.bind(this));

    //-- 分数
    this.fraction = 0;
    this.fractionBtmpFont = Fire.Entity.find('/fraction').getComponent(Fire.BitmapText);
};

Game.prototype.reset = function () {
    this.gameOverWindow.enabled = false;
    this.fraction = 0;
    this.fractionBtmpFont.text = this.fraction;
    this.lastTime = Fire.Time.time + 10;
    for (var i = 0, len = this.pipeGroupList.length; i < len; ++i) {
        var pipeGroupEntity = this.pipeGroupList[i];
        if (!pipeGroupEntity || pipeGroupEntity === undefined) {
            continue;
        }
        pipeGroupEntity.destroy();
    }
    this.pipeGroupList = [];
    this.sheep.init(this.initSheepPos);
    this.gameState = GameState.run;
};

Game.prototype.update = function () {
    switch (this.gameState) {
        case GameState.ready:
            break;
        case GameState.run:
            var gameOver = Collision.collisionDetection(this.sheep, this.pipeGroupList);
            if (gameOver) {
                this.sheep.anim.play(this.sheep.dieAnimState, 0);
                this.sheep.sheepState = Sheep.SheepState.die;
                this.gameState = GameState.over;
                this.gameOverWindow.active = true;
                this.gameOverWindow.getComponent(GameOverWindow).onRefresh();
                return;
            }
            //-- 每过一段时间创建管道
            var curTime = Math.abs(Fire.Time.time - this.lastTime);
            if (curTime >= this.createPipeTime) {
                this.lastTime = Fire.Time.time;
                this.createPipeGroup();
            }
            //-- 地板的更新
            this.floor.onRefresh(this.gameSpeed);
            //-- 绵羊的更新
            this.sheep.onRefresh();
            //-- 管道
            if (this.pipeGroupList && this.pipeGroupList.length > 0) {
                var i = 0, len = this.pipeGroupList.length;
                var pipeGroupEntity, pipeGropComp;
                //-- 管道的更新
                for (i = 0; i < len; ++i) {
                    pipeGroupEntity = this.pipeGroupList[i];
                    if (!pipeGroupEntity || pipeGroupEntity === undefined) {
                        continue;
                    }
                    pipeGropComp = pipeGroupEntity.getComponent('PipeGroup');
                    pipeGropComp.onRefresh(this.gameSpeed);
                }
                //-- 绵羊通过管道的计算 && 计算分数
                for (i = 0; i < len; ++i) {
                    pipeGroupEntity = this.pipeGroupList[i];
                    if (!pipeGroupEntity || pipeGroupEntity === undefined) {
                        continue;
                    }
                    pipeGropComp = pipeGroupEntity.getComponent('PipeGroup');
                    var sheepX = (this.sheep.transform.x - this.sheep.sheepSpritRender.width / 2 );
                    var pipeGroupX = (pipeGroupEntity.transform.x + pipeGropComp.pipeGroupWith / 2 );
                    if (!pipeGropComp.hasPassed && sheepX > pipeGroupX) {
                        pipeGropComp.hasPassed = true;
                        this.fraction++;
                        this.fractionBtmpFont.text = this.fraction;
                    }
                }
            }
            break;
        case GameState.over:
            break;
        default :
            break;
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
