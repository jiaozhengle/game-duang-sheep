var Sheep = require('Sheep');
var Floor = require('Floor');
var Collision = require('Collision');
var GameOverWindow = require('GameOverWindow');
var AudioControl = require('AudioControl');
var Effect = require('Effect');

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

Game.prop('tempMask', null, Fire.ObjectType(Fire.Entity));

Game.prop('createPipeTime', 5);

Game.prop('gameSpeed', 0);

//-- 绵羊初始X坐标
Game.prop('initSheepPos', new Fire.Vec2(-150, -180), Fire.ObjectType(Fire.Vec2));

//-- 创建时管道初始X坐标
Game.prop('initPipeGroupPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

Game.prop('pipeGroup', null, Fire.ObjectType(Fire.Entity));

Game.prototype.onLoad = function () {
    //-- 游戏状态
    this.gameState = GameState.run;

    this.gameOverWindow = Fire.Entity.find('/GameOverWindow');

    this.bg = Fire.Entity.find('/bg').getComponent(Floor);
    this.floor = Fire.Entity.find('/floor').getComponent(Floor);
    this.sheep = Fire.Entity.find('/sheep').getComponent(Sheep);

    this.mask = Fire.Entity.find('/mask');
    if(!this.mask){
        this.mask = Fire.instantiate(this.tempMask);
        this.mask.name = 'mask';
        this.mask.dontDestroyOnLoad = true;
    }
    this.maskRender = this.mask.getComponent(Fire.SpriteRenderer);

    this.fogJumpEffect = Fire.Entity.find('/Prefabs/fog_1');

    Fire.Input.on('mousedown', function (event) {
        if (this.gameState === GameState.over) {
            return;
        }
        var Sheep = require('Sheep');
        this.sheep.anim.play(this.sheep.jumpAnimState, 0);
        this.sheep.sheepState = Sheep.SheepState.jump;
        this.sheep.tempSpeed = this.sheep.speed;
        AudioControl.playJump();

        var pos = new Vec2(this.sheep.transform.x - 80, this.sheep.transform.y + 10);
        Effect.create(this.fogJumpEffect, pos);
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

    //-- 音效
    AudioControl.init();
};

Game.prototype.onStart = function () {
    this.reset();
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
    this.gameState = GameState.ready;
    AudioControl.gameOverAuido.stop();
    AudioControl.hitAuido.stop();
};

Game.prototype.update = function () {

    //-- 绵羊的更新
    //-- 绵羊的更新
    this.sheep.onRefresh();

    switch (this.gameState) {
        case GameState.ready:
            if (this.mask.active) {
                this.maskRender.color.a -= Fire.Time.deltaTime;
                if (this.maskRender.color.a < 0.3) {
                    AudioControl.playReadyGameBg();
                }
                if (this.maskRender.color.a <= 0) {
                    this.mask.active = false;
                    this.gameState = GameState.run;
                }
            }
            break;
        case GameState.run:
            var gameOver = Collision.collisionDetection(this.sheep, this.pipeGroupList);
            if (gameOver) {
                AudioControl.gameAuido.stop();
                AudioControl.gameOverAuido.play();
                AudioControl.playHit();
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
            //-- 背景刷新
            this.bg.onRefresh(this.gameSpeed);
            //-- 地板刷新
            this.floor.onRefresh(this.gameSpeed);
            //-- 管道刷新
            if (this.pipeGroupList && this.pipeGroupList.length > 0) {
                var i = 0, len = this.pipeGroupList.length;
                var pipeGroupEntity, pipeGropComp;
                //-- 管道刷新
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
                        AudioControl.playPoint();
                    }
                }
            }
            break;
        case GameState.over:
            if (this.mask.active) {
                this.maskRender.color.a += Fire.Time.deltaTime;
                if (this.maskRender.color.a > 1) {
                    Fire.Engine.loadScene('MainMenu');
                }
            }
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
