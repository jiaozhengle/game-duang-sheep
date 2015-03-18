require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AudioControl":[function(require,module,exports){
Fire._RFpush(module, 'd805b94751ec4e798480ff8b727b1d03', 'AudioControl');
// script/AudioControl.js

// AudioControl
var AudioControl = {};

AudioControl.init = function () {
    //-- 音效 （撞到）（得分）(失败)
    this.hitAuido = Fire.Entity.find('/Audio/sfx_hit').getComponent(Fire.AudioSource);
    this.pointAuido = Fire.Entity.find('/Audio/sfx_point').getComponent(Fire.AudioSource);
    this.gameAuido = Fire.Entity.find('/Audio/Gameplay_Loop_03').getComponent(Fire.AudioSource);
    this.gameOverAuido = Fire.Entity.find('/Audio/GameOver').getComponent(Fire.AudioSource);
    this.jumpAuido = Fire.Entity.find('/Audio/Tag_Black').getComponent(Fire.AudioSource);
    this.readyAuido = Fire.Entity.find('/Audio/Start_Announce').getComponent(Fire.AudioSource);
};

AudioControl.playReadyGameBg = function () {
    this.readyAuido.play();
    this.readyAuido.onEnd = function () {
        var Game = require('Game');
        if(Game.instance.gameState === Game.GameState.over){
            return;
        }
        this.gameAuido.loop = true;
        this.gameAuido.play();
    }.bind(this);
};

module.exports = AudioControl;

Fire._RFpop();
},{"Game":"Game"}],"Collision":[function(require,module,exports){
Fire._RFpush(module, 'fef90ce6f6bd4e38abd64e608bc113c5', 'Collision');
// script/Collision.js

var Collision = {
    //-- 检测碰撞
    collisionDetection: function (sheep, pipeGroupList) {
        if (pipeGroupList && pipeGroupList.length > 0) {
            for (var i = 0, len = pipeGroupList.length; i < len; ++i) {

                //-- 绵羊的四个面的坐标
                var sheepTop = (sheep.transform.y + sheep.sheepSpritRender.height / 2 );
                var sheepBottom = (sheep.transform.y - sheep.sheepSpritRender.height / 2 );
                var sheepLeft = (sheep.transform.x - sheep.sheepSpritRender.width / 2 );
                var sheepRight = (sheep.transform.x + sheep.sheepSpritRender.width / 2 );

                var pipeGroupEntity = pipeGroupList[i];
                var bottomPipe = pipeGroupEntity.find('bottomPipe');
                var topPipe = pipeGroupEntity.find('topPipe');

                var pipeRender, pipeTop, pipeBottom, pipeLeft, pipeRight;
                if (bottomPipe) {
                    pipeRender = bottomPipe.getComponent(Fire.SpriteRenderer);
                    pipeTop = bottomPipe.transform.y + (pipeRender.height / 2);
                    pipeLeft = pipeGroupEntity.transform.x - (pipeRender.width / 2 - 30);
                    pipeRight = pipeGroupEntity.transform.x + (pipeRender.width / 2 - 30);
                    if (sheepBottom < pipeTop && ((sheepLeft < pipeRight && sheepRight > pipeRight) || (sheepRight > pipeLeft && sheepRight < pipeRight))) {
                        return true;
                    }
                }
                if (topPipe) {
                    pipeRender = topPipe.getComponent(Fire.SpriteRenderer);
                    pipeBottom = topPipe.transform.y - (pipeRender.height / 2);
                    pipeLeft = pipeGroupEntity.transform.x - (pipeRender.width / 2 - 30);
                    pipeRight = pipeGroupEntity.transform.x + (pipeRender.width / 2 - 30);
                    if (sheepTop > pipeBottom && ((sheepLeft < pipeRight && sheepRight > pipeRight) || (sheepRight > pipeLeft && sheepRight < pipeRight))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

module.exports = Collision;

Fire._RFpop();
},{}],"Effect":[function(require,module,exports){
Fire._RFpush(module, '729ab69e54964a00933f76871818c878', 'Effect');
// script/Effect.js

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

Fire._RFpop();
},{}],"Floor":[function(require,module,exports){
Fire._RFpush(module, 'b5c7a2530f0642748f5cbee252849281', 'Floor');
// script/Floor.js

var Floor = Fire.extend(Fire.Component);
//speed
Floor.prop('speed', 300);

Floor.prop('x', -858);

Floor.prototype.onRefresh = function (gameSpeed) {
    this.entity.transform.x -= (Fire.Time.deltaTime * ( this.speed + gameSpeed ));
    if (this.entity.transform.x < this.x) {
        this.entity.transform.x = 0;
    }
};

module.exports = Floor;

Fire._RFpop();
},{}],"GameOverWindow":[function(require,module,exports){
Fire._RFpush(module, '3f0ba8fa057a47daa5e2374741f0b8df', 'GameOverWindow');
// script/GameOverWindow.js

var GameOverWindow = Fire.extend(Fire.Component);

GameOverWindow.prop('title', null, Fire.ObjectType(Fire.Entity));

GameOverWindow.prop('panel', null, Fire.ObjectType(Fire.Entity));

GameOverWindow.prop('btn_play', null, Fire.ObjectType(Fire.Entity));

GameOverWindow.prop('score', null, Fire.ObjectType(Fire.Entity));

GameOverWindow.prototype.onRefresh = function () {
    var Game = require('Game');
    var scoreValue = this.score.getComponent(Fire.BitmapText);
    scoreValue.text = Game.instance.fraction;
    this.btn_play.on('mouseup', function () {
        scoreValue.text = "0";
        this.entity.active = false;
        Game.instance.mask.active = true;
    }.bind(this));
    this.title.transform.position = new Fire.Vec2(0, 250);
    this.panel.transform.position = new Fire.Vec2(0, -200);
};

GameOverWindow.prototype.update = function () {
    if (this.title.transform.y > 100) {
        this.title.transform.y -= Fire.Time.deltaTime * 600;
    }
    else {
        this.title.transform.y = 100;
    }
    if (this.panel.transform.y < 0) {
        this.panel.transform.y += Fire.Time.deltaTime * 600;
    }
    else {
        this.panel.transform.y = 0;
    }
};

module.exports = GameOverWindow;

Fire._RFpop();
},{"Game":"Game"}],"Game":[function(require,module,exports){
Fire._RFpush(module, 'fc991dd700334b809d41c8a86a702e59', 'Game');
// script/Game.js

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

//-- 绵羊初始X坐标
Game.prop('initSheepPos', new Fire.Vec2(-150, -180), Fire.ObjectType(Fire.Vec2));

//-- 创建时管道初始X坐标
Game.prop('initPipeGroupPos', new Fire.Vec2(600, 0), Fire.ObjectType(Fire.Vec2));

Game.prop('createPipeTime', 5);

Game.prop('gameSpeed', 0);

Game.prototype.onLoad = function () {

    this.fogJumpEffect = Fire.Entity.find('/Prefabs/fog_1');
    this.tempAddFractionEff = Fire.Entity.find('/Prefabs/addFraction');
    this.tempMask = Fire.Entity.find('/Prefabs/mask');

    this.pipeGroup = Fire.Entity.find('/Game/PipeGroup');

    //-- 游戏状态
    this.gameState = GameState.run;

    this.gameOverWindow = Fire.Entity.find('/GameOverWindow');

    this.bg = Fire.Entity.find('/bg').getComponent(Floor);
    this.floor = Fire.Entity.find('/floor').getComponent(Floor);
    this.sheep = Fire.Entity.find('/sheep').getComponent(Sheep);

    this.mask = Fire.Entity.find('/mask');
    if (!this.mask) {
        this.mask = Fire.instantiate(this.tempMask);
        this.mask.name = 'mask';
        this.mask.dontDestroyOnLoad = true;
    }
    this.maskRender = this.mask.getComponent(Fire.SpriteRenderer);


    Fire.Input.on('mousedown', function (event) {
        if (this.gameState === GameState.over) {
            return;
        }
        var Sheep = require('Sheep');
        this.sheep.anim.play(this.sheep.jumpAnimState, 0);
        this.sheep.sheepState = Sheep.SheepState.jump;
        this.sheep.tempSpeed = this.sheep.speed;
        AudioControl.jumpAuido.stop();
        AudioControl.jumpAuido.play();

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

    //-- 特效
    Effect.init();
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
                AudioControl.hitAuido.play();
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
                        var initPos = new Vec2(this.sheep.transform.x - 30, this.sheep.transform.y + 50);
                        Effect.createManuallyEffectUpMove(this.tempAddFractionEff, initPos, 100);
                        AudioControl.pointAuido.play();
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

    //-- 特效刷新
    Effect.onRefresh();
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

Fire._RFpop();
},{"AudioControl":"AudioControl","Collision":"Collision","Effect":"Effect","Floor":"Floor","GameOverWindow":"GameOverWindow","Sheep":"Sheep"}],"MainMenu":[function(require,module,exports){
Fire._RFpush(module, '3deb99f839ef4eb893b38835bda95563', 'MainMenu');
// script/MainMenu.js

var MainMenu = Fire.extend(Fire.Component);

MainMenu.prop('tempMask', null, Fire.ObjectType(Fire.Entity));

MainMenu.prototype.onLoad = function () {
    this.bg = this.entity.find('bg').getComponent('Floor');
    this.floor = this.entity.find('floor').getComponent('Floor');
    this.btn_play = this.entity.find('button_play');
    this.btn_play.on('mouseup', function () {
        this.goToGame = true;
        this.mask.active = true;
    }.bind(this));

    this.mask = Fire.Entity.find('/mask');
    this.maskRender = null;
    if(!this.mask){
        this.mask = Fire.instantiate(this.tempMask);
        this.mask.name = 'mask';
        this.mask.dontDestroyOnLoad = true;
    }
    this.maskRender = this.mask.getComponent(Fire.SpriteRenderer);
    this.maskRender.color.a = 1;
    this.goToGame = false;
};

MainMenu.prototype.lateUpdate = function () {
    //-- 背景更新
    this.bg.onRefresh(0);
    //-- 地面更新
    this.floor.onRefresh(0);

    if (this.mask.active) {
        if (this.goToGame) {
            this.maskRender.color.a += Fire.Time.deltaTime;
            if (this.maskRender.color.a > 1) {
                Fire.Engine.loadScene('Game');
            }
        }
        else {
            this.maskRender.color.a -= Fire.Time.deltaTime;
            if (this.maskRender.color.a < 0) {
                this.maskRender.color.a = 0;
                this.mask.active = false;
            }
        }
    }
};

module.exports = MainMenu;

Fire._RFpop();
},{}],"PipeGroup":[function(require,module,exports){
Fire._RFpush(module, '004ccda08e9349389d905b1f21bf9f6a', 'PipeGroup');
// script/PipeGroup.js

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

Fire._RFpop();
},{}],"Sheep":[function(require,module,exports){
Fire._RFpush(module, '06633c0aa9354ce9ad4af86dbadaad50', 'Sheep');
// script/Sheep.js

var Effect = require('Effect');

var SheepState = (function (t) {
    t[t.none = 0] = 'none',
    t[t.run = 0] = 'run';
    t[t.jump = 1] = 'jump';
    t[t.drop = 2] = 'drop';
    t[t.down = 3] = 'down';
    t[t.die = 4] = 'die'
    return t;
})({});

var Sheep = Fire.extend(Fire.Component, function () {
    this.skyMaxY = 250;//160;
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

Sheep.SheepState = SheepState;

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
    this.dieRotation = -88;

    this.fogDownEffect = Fire.Entity.find('/Prefabs/fog_2');
};

Sheep.prototype.init = function (pos) {
    this.entity.transform.rotation = 0;
    this.entity.transform.position = pos;
    this.anim.play(this.runAnimState, 0);
    this.sheepState = SheepState.run;
};

Sheep.prototype.onRefresh = function () {

    if (this.sheepState !== SheepState.run) {
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

                var pos = new Vec2(this.entity.transform.x, this.entity.transform.y - 30);
                Effect.create(this.fogDownEffect, pos);

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
            if (this.entity.transform.y > this.fLoorCoordinates) {
                this.entity.transform.y += Fire.Time.deltaTime * this.tempSpeed;
            }
            else{
                var pos = new Vec2(this.entity.transform.x, this.entity.transform.y - 30);
                Effect.create(this.fogDownEffect, pos);
                this.sheepState = SheepState.none;
            }
            break;
        default:
            break;
    }
};

module.exports = Sheep;

Fire._RFpop();
},{"Effect":"Effect"}],"audio-clip":[function(require,module,exports){
Fire._RFpush(module, 'audio-clip');
// src/audio-clip.js

Fire.AudioClip = (function () {
    var AudioClip = Fire.extend("Fire.AudioClip", Fire.Asset);

    AudioClip.prop('rawData', null, Fire.RawType('audio'));

    AudioClip.get('buffer', function () {
        return Fire.AudioContext.getClipBuffer(this);
    }, Fire.HideInInspector);

    AudioClip.get("length", function () {
        return Fire.AudioContext.getClipLength(this);
    });

    AudioClip.get("samples", function () {
        return Fire.AudioContext.getClipSamples(this);
    });

    AudioClip.get("channels", function () {
        return Fire.AudioContext.getClipChannels(this);
    });

    AudioClip.get("frequency", function () {
        return Fire.AudioContext.getClipFrequency(this);
    });

    return AudioClip;
})();

// create entity action
// @if EDITOR
Fire.AudioClip.prototype.createEntity = function ( cb ) {
    var ent = new Fire.Entity(this.name);

    var audioSource = ent.addComponent(Fire.AudioSource);

    audioSource.clip = this;

    if ( cb )
        cb (ent);
};
// @endif

module.exports = Fire.AudioClip;

Fire._RFpop();
},{}],"audio-legacy":[function(require,module,exports){
Fire._RFpush(module, 'audio-legacy');
// src/audio-legacy.js

(function(){
    var UseWebAudio = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    if (UseWebAudio) {
        return;
    }
    var AudioContext = {};

    function loader (url, callback, onProgress) {
        var audio = document.createElement("audio");
        audio.addEventListener("canplaythrough", function () {
            callback(null, audio);
        }, false);
        audio.addEventListener('error', function (e) {
            callback('LoadAudioClip: "' + url +
                    '" seems to be unreachable or the file is empty. InnerMessage: ' + e, null);
        }, false);

        audio.src = url;
        audio.load();
    }

    Fire.LoadManager.registerRawTypes('audio', loader);

    AudioContext.initSource = function (target) {
        target._audio = null;
    };

    AudioContext.getCurrentTime = function (target) {
        if (target && target._audio && target._playing) {
            return target._audio.currentTime;
        }
        else {
            return 0;
        }
    };

    AudioContext.updateTime = function (target, value) {
        if (target && target._audio) {
            var duration = target._audio.duration;
            target._audio.currentTime = value;
        }
    };

    // 靜音
    AudioContext.updateMute = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.muted = target.mute;
    };

    // 设置音量，音量范围是[0, 1]
    AudioContext.updateVolume = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.volume = target.volume;
    };

    // 设置循环
    AudioContext.updateLoop = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.loop = target.loop;
    };

    // 将音乐源节点绑定具体的音频buffer
    AudioContext.updateAudioClip = function (target) {
        if (!target || !target.clip) { return; }
        target._audio = target.clip.rawData;
    };

    // 暫停
    AudioContext.pause = function (target) {
        if (!target._audio) { return; }
        target._audio.pause();
    };

    // 停止
    AudioContext.stop = function (target) {
        if (!target._audio) { return; }
        target._audio.pause();
        target._audio.currentTime = 0;
    };

    // 播放
    AudioContext.play = function (target) {
        if (!target || !target.clip || !target.clip.rawData) { return; }
        if (target._playing && !target._paused) { return; }
        this.updateAudioClip(target);
        this.updateVolume(target);
        this.updateLoop(target);
        this.updateMute(target);
        target._audio.play();

        // 播放结束后的回调
        target._audio.addEventListener('ended', function () {
            target.onPlayEnd.bind(target);
        }, false);
    };

    // 获得音频剪辑的 buffer
    AudioContext.getClipBuffer = function (clip) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 以秒为单位 获取音频剪辑的 长度
    AudioContext.getClipLength = function (clip) {
        return target.clip.rawData.duration;
    };

    // 音频剪辑的长度
    AudioContext.getClipSamples = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 音频剪辑的声道数
    AudioContext.getClipChannels = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 音频剪辑的采样频率
    AudioContext.getClipFrequency = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };


    Fire.AudioContext = AudioContext;
})();

Fire._RFpop();
},{}],"audio-source":[function(require,module,exports){
Fire._RFpush(module, 'audio-source');
// src/audio-source.js

var AudioSource = (function () {
    var AudioSource = Fire.extend("Fire.AudioSource", Fire.Component, function () {
        this._playing = false; //-- 声源暂停或者停止时候为false
        this._paused = false;//-- 来区分声源是暂停还是停止

        this._startTime = 0;
        this._lastPlay = 0;

        this._buffSource = null;
        this._volumeGain = null;

        this.onEnd = null;
    });

    //
    Fire.addComponentMenu(AudioSource, 'AudioSource');

    //
    Object.defineProperty(AudioSource.prototype, "isPlaying", {
        get: function () {
            return this._playing && !this._paused;
        }
    });

    Object.defineProperty(AudioSource.prototype, "isPaused", {
        get: function () {
            return this._paused;
        }
    });

    //
    Object.defineProperty(AudioSource.prototype, 'time', {
        get: function () {
            return Fire.AudioContext.getCurrentTime(this);
        },
        set: function (value) {
            Fire.AudioContext.updateTime(this, value);
        }
    });

    //
    AudioSource.prop('_playbackRate', 1.0, Fire.HideInInspector);
    AudioSource.getset('playbackRate',
        function () {
            return this._playbackRate;
        },
        function (value) {
            if (this._playbackRate !== value) {
                this._playbackRate = value;
                Fire.AudioContext.updatePlaybackRate(this);
            }
        }
    );

    //
    AudioSource.prop('_clip', null, Fire.HideInInspector);
    AudioSource.getset('clip',
        function () {
            return this._clip;
        },
        function (value) {
            if (this._clip !== value) {
                this._clip = value;
                Fire.AudioContext.updateAudioClip(this);
            }
        },
        Fire.ObjectType(Fire.AudioClip)
    );

    //
    AudioSource.prop('_loop', false, Fire.HideInInspector);
    AudioSource.getset('loop',
       function () {
           return this._loop;
       },
       function (value) {
           if (this._loop !== value) {
               this._loop = value;
               Fire.AudioContext.updateLoop(this);
           }
       }
    );

    //
    AudioSource.prop('_mute', false, Fire.HideInInspector);
    AudioSource.getset('mute',
       function () {
           return this._mute;
       },
       function (value) {
           if (this._mute !== value) {
               this._mute = value;
               Fire.AudioContext.updateMute(this);
           }
       }
    );

    //
    AudioSource.prop('_volume', 1, Fire.HideInInspector);
    AudioSource.getset('volume',
       function () {
           return this._volume;
       },
       function (value) {
           if (this._volume !== value) {
               this._volume = Math.clamp01(value);
               Fire.AudioContext.updateVolume(this);
           }
       },
       Fire.Range(0,1)
    );

    AudioSource.prop('playOnAwake', true);

    AudioSource.prototype.onPlayEnd = function () {
        if ( this.onEnd ) {
            this.onEnd();
        }

        this._playing = false;
        this._paused = false;
    };

    AudioSource.prototype.pause = function () {
        if ( this._paused )
            return;

        Fire.AudioContext.pause(this);
        this._paused = true;
    };

    AudioSource.prototype.play = function () {
        if ( this._playing && !this._paused )
            return;

        if ( this._paused )
            Fire.AudioContext.play(this, this._startTime);
        else
            Fire.AudioContext.play(this, 0);

        this._playing = true;
        this._paused = false;
    };

    AudioSource.prototype.stop = function () {
        if ( !this._playing ) {
            return;
        }

        Fire.AudioContext.stop(this);
        this._playing = false;
        this._paused = false;
    };

    AudioSource.prototype.onLoad = function () {
        if (this._playing ) {
            this.stop();
        }
    };

    AudioSource.prototype.onStart = function () {
        //if (this.playOnAwake) {
        //    console.log("onStart");
        //    this.play();
        //}
    };

    AudioSource.prototype.onEnable = function () {
        if (this.playOnAwake) {
            this.play();
        }
    };

    AudioSource.prototype.onDisable = function () {
        this.stop();
    };

    return AudioSource;
})();

Fire.AudioSource = AudioSource;

Fire._RFpop();
},{}],"audio-web-audio":[function(require,module,exports){
Fire._RFpush(module, 'audio-web-audio');
// src/audio-web-audio.js

(function () {
    var NativeAudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    if ( !NativeAudioContext ) {
        return;
    }

    // fix fireball-x/dev#365
    if (!Fire.nativeAC) {
        Fire.nativeAC = new NativeAudioContext();
    }

    // 添加safeDecodeAudioData的原因：https://github.com/fireball-x/dev/issues/318
    function safeDecodeAudioData(context, buffer, url, callback) {
        var timeout = false;
        var timerId = setTimeout(function () {
            callback('The operation of decoding audio data already timeout! Audio url: "' + url +
                     '". Set Fire.AudioContext.MaxDecodeTime to a larger value if this error often occur. ' +
                     'See fireball-x/dev#318 for details.', null);
        }, AudioContext.MaxDecodeTime);

        context.decodeAudioData(buffer,
            function (decodedData) {
                if (!timeout) {
                    callback(null, decodedData);
                    clearTimeout(timerId);
                }
            },
            function (e) {
                if (!timeout) {
                    callback(null, 'LoadAudioClip: "' + url +
                        '" seems to be unreachable or the file is empty. InnerMessage: ' + e);
                    clearTimeout(timerId);
                }
            }
        );
    }

    function loader(url, callback, onProgress) {
        var cb = callback && function (error, xhr) {
            if (xhr) {
                safeDecodeAudioData(Fire.nativeAC, xhr.response, url, callback);
            }
            else {
                callback('LoadAudioClip: "' + url +
               '" seems to be unreachable or the file is empty. InnerMessage: ' + error, null);
            }
        };
        Fire.LoadManager._loadFromXHR(url, cb, onProgress, 'arraybuffer');
    }

    Fire.LoadManager.registerRawTypes('audio', loader);

    var AudioContext = {};

    AudioContext.MaxDecodeTime = 4000;

    AudioContext.getCurrentTime = function (target) {
        if ( target._paused ) {
            return target._startTime;
        }

        if ( target._playing ) {
            return target._startTime + this.getPlayedTime(target);
        }

        return 0;
    };

    AudioContext.getPlayedTime = function (target) {
        return (Fire.nativeAC.currentTime - target._lastPlay) * target._playbackRate;
    };

    //
    AudioContext.updateTime = function (target, time) {
        target._lastPlay = Fire.nativeAC.currentTime;
        target._startTime = time;

        if ( target.isPlaying ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.updateMute = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.mute ? -1 : (target.volume - 1);
    };

    // range [0,1]
    AudioContext.updateVolume = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.volume - 1;
    };

    //
    AudioContext.updateLoop = function (target) {
        if (!target._buffSource) { return; }
        target._buffSource.loop = target.loop;
    };

    // bind buffer source
    AudioContext.updateAudioClip = function (target) {
        if ( target.isPlaying ) {
            this.stop(target,false);
            this.play(target);
        }
    };

    //
    AudioContext.updatePlaybackRate = function (target) {
        if ( !this.isPaused ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.pause = function (target) {
        if (!target._buffSource) { return; }

        target._startTime += this.getPlayedTime(target);
        target._buffSource.onended = null;
        target._buffSource.stop();
    };

    //
    AudioContext.stop = function ( target, ended ) {
        if (!target._buffSource) { return; }

        if ( !ended ) {
            target._buffSource.onended = null;
        }
        target._buffSource.stop();
    };

    //
    AudioContext.play = function ( target, at ) {
        if (!target.clip || !target.clip.rawData) { return; }

        // create buffer source
        var bufferSource = Fire.nativeAC.createBufferSource();

        // create volume control
        var gain = Fire.nativeAC.createGain();

        // connect
        bufferSource.connect(gain);
        gain.connect(Fire.nativeAC.destination);
        bufferSource.connect(Fire.nativeAC.destination);

        // init parameters
        bufferSource.buffer = target.clip.rawData;
        bufferSource.loop = target.loop;
        bufferSource.playbackRate.value = target.playbackRate;
        bufferSource.onended = target.onPlayEnd.bind(target);
        gain.gain.value = target.mute ? -1 : (target.volume - 1);

        //
        target._buffSource = bufferSource;
        target._volumeGain = gain;
        target._startTime = at || 0;
        target._lastPlay = Fire.nativeAC.currentTime;

        // play
        bufferSource.start( 0, this.getCurrentTime(target) );
    };

    // ===================

    //
    AudioContext.getClipBuffer = function (clip) {
        return clip.rawData;
    };

    //
    AudioContext.getClipLength = function (clip) {
        if (clip.rawData) {
            return clip.rawData.duration;
        }
        return -1;
    };

    //
    AudioContext.getClipSamples = function (clip) {
        if (clip.rawData) {
            return clip.rawData.length;
        }
        return -1;
    };

    //
    AudioContext.getClipChannels = function (clip) {
        if (clip.rawData) {
            return clip.rawData.numberOfChannels;
        }
        return -1;
    };

    //
    AudioContext.getClipFrequency = function (clip) {
        if (clip.rawData) {
            return clip.rawData.sampleRate;
        }
        return -1;
    };


    Fire.AudioContext = AudioContext;
})();

Fire._RFpop();
},{}],"sprite-animation-clip":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation-clip');
// sprite-animation-clip.js

// 动画剪辑

var SpriteAnimationClip = Fire.extend('Fire.SpriteAnimationClip', Fire.CustomAsset, function () {
    this._frameInfoFrames = null; // the array of the end frame of each frame info
});

Fire.addCustomAssetMenu(SpriteAnimationClip, "Create/New Sprite Animation");

SpriteAnimationClip.WrapMode = (function (t) {
    t[t.Default = 0] = 'Default';
    t[t.Once = 1] = 'Once';
    t[t.Loop = 2] = 'Loop';
    t[t.PingPong = 3] = 'PingPong';
    t[t.ClampForever = 4] = 'ClampForever';
    return t;
})({});

SpriteAnimationClip.StopAction = (function (t) {
    t[t.DoNothing = 0] = 'DoNothing';         // do nothing
    t[t.DefaultSprite = 1] = 'DefaultSprite'; // set to default sprite when the sprite animation stopped
    t[t.Hide = 2] = 'Hide';                   // hide the sprite when the sprite animation stopped
    t[t.Destroy = 3] = 'Destroy';             // destroy the entity the sprite belongs to when the sprite animation stopped
    return t;
})({});

// ------------------------------------------------------------------
/// The structure to descrip a frame in the sprite animation clip
// ------------------------------------------------------------------

var FrameInfo = Fire.define('FrameInfo')
                    .prop('sprite', null, Fire.ObjectType(Fire.Sprite))
                    .prop('frames', 0, Fire.Integer);

///< the list of frame info
// to do

// default wrap mode
SpriteAnimationClip.prop('wrapMode', SpriteAnimationClip.WrapMode.Default, Fire.Enum(SpriteAnimationClip.WrapMode));

// the default type of action used when the animation stopped
SpriteAnimationClip.prop('stopAction', SpriteAnimationClip.StopAction.DoNothing, Fire.Enum(SpriteAnimationClip.StopAction));

// the default speed of the animation clip
SpriteAnimationClip.prop('speed', 1);

// the sample rate used in this animation clip
SpriteAnimationClip.prop('_frameRate', 60, Fire.HideInInspector);
SpriteAnimationClip.getset('frameRate',
    function () {
        return this._frameRate;
    },
    function (value) {
        if (value !== this._frameRate) {
            this._frameRate = Math.round(Math.max(value, 1));
        }
    }
);

SpriteAnimationClip.prop('frameInfos', [], Fire.ObjectType(FrameInfo));


SpriteAnimationClip.prototype.getTotalFrames = function () {
    var frames = 0;
    for (var i = 0; i < this.frameInfos.length; ++i) {
        frames += this.frameInfos[i].frames;
    }
    return frames;
};

SpriteAnimationClip.prototype.getFrameInfoFrames = function () {
    if (this._frameInfoFrames === null) {
        this._frameInfoFrames = new Array(this.frameInfos.length);
        var totalFrames = 0;
        for (var i = 0; i < this.frameInfos.length; ++i) {
            totalFrames += this.frameInfos[i].frames;
            this._frameInfoFrames[i] = totalFrames;
        }
    }
    return this._frameInfoFrames;
};

Fire.SpriteAnimationClip = SpriteAnimationClip;

module.exports = SpriteAnimationClip;

Fire._RFpop();
},{}],"sprite-animation-state":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation-state');
// sprite-animation-state.js

var SpriteAnimationClip = require('sprite-animation-clip');

var SpriteAnimationState = function (animClip) {
    if (!animClip) {
// @if DEV
        Fire.error('Unspecified sprite animation clip');
// @endif
        return;
    }
    // the name of the sprite animation state
    this.name = animClip.name;
    // the referenced sprite sprite animation clip
    this.clip = animClip;
    // the wrap mode
    this.wrapMode = animClip.wrapMode;
    // the stop action
    this.stopAction = animClip.stopAction;
    // the speed to play the sprite animation clip
    this.speed = animClip.speed;
    // the array of the end frame of each frame info in the sprite animation clip
    this._frameInfoFrames = animClip.getFrameInfoFrames();
    // the total frame count of the sprite animation clip
    this.totalFrames = this._frameInfoFrames.length > 0 ? this._frameInfoFrames[this._frameInfoFrames.length - 1] : 0;
    // the length of the sprite animation in seconds with speed = 1.0f
    this.length = this.totalFrames / animClip.frameRate;
    // The current index of frame. The value can be larger than totalFrames.
    // If the frame is larger than totalFrames it will be wrapped according to wrapMode. 
    this.frame = -1;
    // the current time in seoncds
    this.time = 0;
    // cache result of GetCurrentIndex
    this._cachedIndex = -1;
};

/**
 * @returns {number} - the current frame info index.
 */
SpriteAnimationState.prototype.getCurrentIndex = function () {
    if (this.totalFrames > 1) {
        //int oldFrame = frame;
        this.frame = Math.floor(this.time * this.clip.frameRate);
        if (this.frame < 0) {
            this.frame = -this.frame;
        }

        var wrappedIndex;
        if (this.wrapMode !== SpriteAnimationClip.WrapMode.PingPong) {
            wrappedIndex = _wrap(this.frame, this.totalFrames - 1, this.wrapMode);
        }
        else {
            wrappedIndex = this.frame;
            var cnt = Math.floor(wrappedIndex / this.totalFrames);
            wrappedIndex %= this.totalFrames;
            if ((cnt & 0x1) === 1) {
                wrappedIndex = this.totalFrames - 1 - wrappedIndex;
            }
        }

        // try to use cached frame info index
        if (this._cachedIndex - 1 >= 0 &&
            wrappedIndex >= this._frameInfoFrames[this._cachedIndex - 1] &&
            wrappedIndex < this._frameInfoFrames[this._cachedIndex]) {
            return this._cachedIndex;
        }

        // search frame info
        var frameInfoIndex = _binarySearch(this._frameInfoFrames, wrappedIndex + 1);
        if (frameInfoIndex < 0) {
            frameInfoIndex = ~frameInfoIndex;
        }
        this._cachedIndex = frameInfoIndex;
        return frameInfoIndex;
    }
    else if (this.totalFrames === 1) {
        return 0;
    }
    else {
        return -1;
    }
};

// ------------------------------------------------------------------ 
/// C# Array.BinarySearch
// ------------------------------------------------------------------ 
function _binarySearch (array, value) {
    var l = 0, h = array.length - 1;
    while (l <= h) {
        var m = ((l + h) >> 1);
        if (array[m] === value) {
            return m;
        }
        if (array[m] > value) {
            h = m - 1;
        }
        else {
            l = m + 1;
        }
    }
    return ~l;
}

function _wrap (_value, _maxValue, _wrapMode) {
    if (_maxValue === 0) {
        return 0;
    }
    if (_value < 0) {
        _value = -_value;
    }
    if (_wrapMode === SpriteAnimationClip.WrapMode.Loop) {
        return _value % (_maxValue + 1);
    }
    else if (_wrapMode === SpriteAnimationClip.WrapMode.PingPong) {
        var cnt = Math.floor(_value / _maxValue);
        _value %= _maxValue;
        if (cnt % 2 === 1) {
            return _maxValue - _value;
        }
    }
    else {
        if (_value < 0) {
            return 0;
        }
        if (_value > _maxValue) {
            return _maxValue;
        }
    }
    return _value;
}

Fire.SpriteAnimationState = SpriteAnimationState;

module.exports = SpriteAnimationState;

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip"}],"sprite-animation":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation');
// sprite-animation.js

var SpriteAnimationClip = require('sprite-animation-clip');
var SpriteAnimationState = require('sprite-animation-state');

// 定义一个名叫Sprite Animation 组件
var SpriteAnimation = Fire.extend('Fire.SpriteAnimation', Fire.Component, function () {
    this.animations = [];
    this._nameToState = null;
    this._curAnimation = null;
    this._spriteRenderer = null;
    this._defaultSprite = null;
    this._lastFrameIndex = -1;
    this._curIndex = -1;
    this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
});

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');

SpriteAnimation.prop('defaultAnimation', null, Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('animations', [], Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('_playAutomatically', true, Fire.HideInInspector);
SpriteAnimation.getset('playAutomatically',
    function () {
        return this._playAutomatically;
    },
    function (value) {
        this._playAutomatically = value;
    }
);

SpriteAnimation.prototype.init = function () {
    var initialized = (this._nameToState !== null);
    if (initialized === false) {
        this._spriteRenderer = this.entity.getComponent(Fire.SpriteRenderer);
        this._defaultSprite = this._spriteRenderer.sprite;

        this._nameToState = {};
        var state = null;
        for (var i = 0; i < this.animations.length; ++i) {
            var clip = this.animations[i];
            if (clip !== null) {
                state = new SpriteAnimationState(clip);
                this._nameToState[state.name] = state;
            }
        }

        if (!this.getAnimState(this.defaultAnimation.name)) {
            state = new SpriteAnimationState(this.defaultAnimation);
            this._nameToState[state.name] = state;
        }
    }
};

SpriteAnimation.prototype.getAnimState = function (name) {
    return this._nameToState && this._nameToState[name];
};

/**
 * indicates whether the animation is playing
 * @param {string} [animName] - The name of the animation
 */
SpriteAnimation.prototype.isPlaying = function (name) {
    var playingAnim = this.enabled && this._curAnimation;
    return !!playingAnim && ( !name || playingAnim.name === name );
};

/**
 * play Animation
 * @param {SpriteAnimationState} [animState] - The animState of the SpriteAnimationState
 * @param {SpriteAnimationState} [animState] - The time of the animation time
 */
SpriteAnimation.prototype.play = function (animState, time) {
    this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
    if (this._curAnimation !== null) {
        this._curIndex = -1;
        this._curAnimation.time = time || 0;
        this._playStartFrame = Fire.Time.frameCount;
        this.sample();
    }
};

SpriteAnimation.prototype.onLoad = function () {
    this.init();
    if (this.enabled) {
        if (this._playAutomatically && this.defaultAnimation) {
            var animState = this.getAnimState(this.defaultAnimation.name);
            this.play(animState, 0);
        }
    }
};

SpriteAnimation.prototype.lateUpdate = function () {
    if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
        var delta = Fire.Time.deltaTime * this._curAnimation.speed;
        this.step(delta);
    }
};

SpriteAnimation.prototype.step = function (deltaTime) {
    if (this._curAnimation !== null) {
        this._curAnimation.time += deltaTime;
        this.sample();
        var stop = false;
        if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Once ||
            this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Default ||
            this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
            if (this._curAnimation.speed > 0 && this._curAnimation.frame >= this._curAnimation.totalFrames) {
                if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                    stop = false;
                    this._curAnimation.frame = this._curAnimation.totalFrames;
                    this._curAnimation.time = this._curAnimation.frame / this._curAnimation.clip.frameRate;
                }
                else {
                    stop = true;
                    this._curAnimation.frame = this._curAnimation.totalFrames;
                }
            }
            else if (this._curAnimation.speed < 0 && this._curAnimation.frame < 0) {
                if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                    stop = false;
                    this._curAnimation.time = 0;
                    this._curAnimation.frame = 0;
                }
                else {
                    stop = true;
                    this._curAnimation.frame = 0;
                }
            }
        }

        // do stop
        if (stop) {
            this.stop(this._curAnimation);
        }
    }
    else {
        this._curIndex = -1;
    }
};

SpriteAnimation.prototype.sample = function () {
    if (this._curAnimation !== null) {
        var newIndex = this._curAnimation.getCurrentIndex();
        if (newIndex >= 0 && newIndex != this._curIndex) {
            this._spriteRenderer.sprite = this._curAnimation.clip.frameInfos[newIndex].sprite;
        }
        this._curIndex = newIndex;
    }
    else {
        this._curIndex = -1;
    }
};

SpriteAnimation.prototype.stop = function (animState) {
    if (animState !== null) {
        if (animState === this._curAnimation) {
            this._curAnimation = null;
        }
        animState.time = 0;

        var stopAction = animState.stopAction;
        switch (stopAction) {
            case SpriteAnimationClip.StopAction.DoNothing:
                break;
            case SpriteAnimationClip.StopAction.DefaultSprite:
                this._spriteRenderer.sprite = this._defaultSprite;
                break;
            case SpriteAnimationClip.StopAction.Hide:
                this._spriteRenderer.enabled = false;
                break;
            case SpriteAnimationClip.StopAction.Destroy:

                this.entity.destroy();
                break;
            default:
                break;
        }
        this._curAnimation = null;
    }
};

Fire.SpriteAnimation = SpriteAnimation;

module.exports = SpriteAnimation;

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["audio-clip","audio-legacy","audio-source","audio-web-audio","sprite-animation-clip","sprite-animation-state","sprite-animation","AudioControl","Collision","Effect","Floor","Game","GameOverWindow","MainMenu","PipeGroup","Sheep"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0F1ZGlvQ29udHJvbC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0NvbGxpc2lvbi5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0VmZmVjdC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0Zsb29yLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvR2FtZU92ZXJXaW5kb3cuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NjcmlwdC9HYW1lLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvTWFpbk1lbnUuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NjcmlwdC9QaXBlR3JvdXAuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NjcmlwdC9TaGVlcC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3JjL2F1ZGlvLWNsaXAuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby1sZWdhY3kuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby1zb3VyY2UuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby13ZWItYXVkaW8uanMiLCIuLi8uLi8uLi9kZXYvYmluL3Nwcml0ZS1hbmltYXRpb24tY2xpcC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3ByaXRlLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdkODA1Yjk0NzUxZWM0ZTc5ODQ4MGZmOGI3MjdiMWQwMycsICdBdWRpb0NvbnRyb2wnKTtcbi8vIHNjcmlwdC9BdWRpb0NvbnRyb2wuanNcblxuLy8gQXVkaW9Db250cm9sXG52YXIgQXVkaW9Db250cm9sID0ge307XG5cbkF1ZGlvQ29udHJvbC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g6Z+z5pWIIO+8iOaSnuWIsO+8ie+8iOW+l+WIhu+8iSjlpLHotKUpXG4gICAgdGhpcy5oaXRBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9zZnhfaGl0JykuZ2V0Q29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuICAgIHRoaXMucG9pbnRBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9zZnhfcG9pbnQnKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5nYW1lQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vR2FtZXBsYXlfTG9vcF8wMycpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbiAgICB0aGlzLmdhbWVPdmVyQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vR2FtZU92ZXInKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5qdW1wQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vVGFnX0JsYWNrJykuZ2V0Q29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuICAgIHRoaXMucmVhZHlBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9TdGFydF9Bbm5vdW5jZScpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbn07XG5cbkF1ZGlvQ29udHJvbC5wbGF5UmVhZHlHYW1lQmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZWFkeUF1aWRvLnBsYXkoKTtcbiAgICB0aGlzLnJlYWR5QXVpZG8ub25FbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBHYW1lID0gcmVxdWlyZSgnR2FtZScpO1xuICAgICAgICBpZihHYW1lLmluc3RhbmNlLmdhbWVTdGF0ZSA9PT0gR2FtZS5HYW1lU3RhdGUub3Zlcil7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nYW1lQXVpZG8ubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2FtZUF1aWRvLnBsYXkoKTtcbiAgICB9LmJpbmQodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1ZGlvQ29udHJvbDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZmVmOTBjZTZmNmJkNGUzOGFiZDY0ZTYwOGJjMTEzYzUnLCAnQ29sbGlzaW9uJyk7XG4vLyBzY3JpcHQvQ29sbGlzaW9uLmpzXG5cbnZhciBDb2xsaXNpb24gPSB7XG4gICAgLy8tLSDmo4DmtYvnorDmkp5cbiAgICBjb2xsaXNpb25EZXRlY3Rpb246IGZ1bmN0aW9uIChzaGVlcCwgcGlwZUdyb3VwTGlzdCkge1xuICAgICAgICBpZiAocGlwZUdyb3VwTGlzdCAmJiBwaXBlR3JvdXBMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwaXBlR3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG5cbiAgICAgICAgICAgICAgICAvLy0tIOe7tee+iueahOWbm+S4qumdoueahOWdkOagh1xuICAgICAgICAgICAgICAgIHZhciBzaGVlcFRvcCA9IChzaGVlcC50cmFuc2Zvcm0ueSArIHNoZWVwLnNoZWVwU3ByaXRSZW5kZXIuaGVpZ2h0IC8gMiApO1xuICAgICAgICAgICAgICAgIHZhciBzaGVlcEJvdHRvbSA9IChzaGVlcC50cmFuc2Zvcm0ueSAtIHNoZWVwLnNoZWVwU3ByaXRSZW5kZXIuaGVpZ2h0IC8gMiApO1xuICAgICAgICAgICAgICAgIHZhciBzaGVlcExlZnQgPSAoc2hlZXAudHJhbnNmb3JtLnggLSBzaGVlcC5zaGVlcFNwcml0UmVuZGVyLndpZHRoIC8gMiApO1xuICAgICAgICAgICAgICAgIHZhciBzaGVlcFJpZ2h0ID0gKHNoZWVwLnRyYW5zZm9ybS54ICsgc2hlZXAuc2hlZXBTcHJpdFJlbmRlci53aWR0aCAvIDIgKTtcblxuICAgICAgICAgICAgICAgIHZhciBwaXBlR3JvdXBFbnRpdHkgPSBwaXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgICAgIHZhciBib3R0b21QaXBlID0gcGlwZUdyb3VwRW50aXR5LmZpbmQoJ2JvdHRvbVBpcGUnKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9wUGlwZSA9IHBpcGVHcm91cEVudGl0eS5maW5kKCd0b3BQaXBlJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGlwZVJlbmRlciwgcGlwZVRvcCwgcGlwZUJvdHRvbSwgcGlwZUxlZnQsIHBpcGVSaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoYm90dG9tUGlwZSkge1xuICAgICAgICAgICAgICAgICAgICBwaXBlUmVuZGVyID0gYm90dG9tUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVUb3AgPSBib3R0b21QaXBlLnRyYW5zZm9ybS55ICsgKHBpcGVSZW5kZXIuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVMZWZ0ID0gcGlwZUdyb3VwRW50aXR5LnRyYW5zZm9ybS54IC0gKHBpcGVSZW5kZXIud2lkdGggLyAyIC0gMzApO1xuICAgICAgICAgICAgICAgICAgICBwaXBlUmlnaHQgPSBwaXBlR3JvdXBFbnRpdHkudHJhbnNmb3JtLnggKyAocGlwZVJlbmRlci53aWR0aCAvIDIgLSAzMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGVlcEJvdHRvbSA8IHBpcGVUb3AgJiYgKChzaGVlcExlZnQgPCBwaXBlUmlnaHQgJiYgc2hlZXBSaWdodCA+IHBpcGVSaWdodCkgfHwgKHNoZWVwUmlnaHQgPiBwaXBlTGVmdCAmJiBzaGVlcFJpZ2h0IDwgcGlwZVJpZ2h0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b3BQaXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVSZW5kZXIgPSB0b3BQaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUJvdHRvbSA9IHRvcFBpcGUudHJhbnNmb3JtLnkgLSAocGlwZVJlbmRlci5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUxlZnQgPSBwaXBlR3JvdXBFbnRpdHkudHJhbnNmb3JtLnggLSAocGlwZVJlbmRlci53aWR0aCAvIDIgLSAzMCk7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVSaWdodCA9IHBpcGVHcm91cEVudGl0eS50cmFuc2Zvcm0ueCArIChwaXBlUmVuZGVyLndpZHRoIC8gMiAtIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoZWVwVG9wID4gcGlwZUJvdHRvbSAmJiAoKHNoZWVwTGVmdCA8IHBpcGVSaWdodCAmJiBzaGVlcFJpZ2h0ID4gcGlwZVJpZ2h0KSB8fCAoc2hlZXBSaWdodCA+IHBpcGVMZWZ0ICYmIHNoZWVwUmlnaHQgPCBwaXBlUmlnaHQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzcyOWFiNjllNTQ5NjRhMDA5MzNmNzY4NzE4MThjODc4JywgJ0VmZmVjdCcpO1xuLy8gc2NyaXB0L0VmZmVjdC5qc1xuXG4vLyBFZmZlY3RcbnZhciBFZmZlY3QgPSB7XG4gICAgdG9ZUG9zICAgICAgICA6IEZpcmUuVmVjMi56ZXJvLFxuICAgIG1hbnVhbGx5ICAgICAgOiBmYWxzZSxcbiAgICB0ZW1wRGlzYXBwZWFyIDogbnVsbCxcbiAgICBtYW51YWxseUVmZmVjdDogbnVsbFxufTtcblxuRWZmZWN0LmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50ZW1wRGlzYXBwZWFyID0gRmlyZS5FbnRpdHkuZmluZCgnL1ByZWZhYnMvZGlzYXBwZWFyJyk7XG59O1xuXG5FZmZlY3QuY3JlYXRlID0gZnVuY3Rpb24gKHRlbXBFbnRpdHksIHBvcykge1xuICAgIHZhciBlZmZlY3QgPSBGaXJlLmluc3RhbnRpYXRlKHRlbXBFbnRpdHkpO1xuICAgIGVmZmVjdC50cmFuc2Zvcm0ucG9zaXRpb24gPSBwb3M7XG4gICAgdmFyIGVmZmVjdEFuaW0gPSBlZmZlY3QuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlQW5pbWF0aW9uKTtcbiAgICBlZmZlY3RBbmltLnBsYXkoKTtcbn07XG5cbkVmZmVjdC5jcmVhdGVNYW51YWxseUVmZmVjdFVwTW92ZSA9IGZ1bmN0aW9uICh0ZW1wRW50aXR5LCBwb3MsIHRvVXBQb3MpIHtcbiAgICB0aGlzLm1hbnVhbGx5RWZmZWN0ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRW50aXR5KTtcbiAgICB0aGlzLm1hbnVhbGx5RWZmZWN0LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICB0aGlzLm1hbnVhbGx5ID0gdHJ1ZTtcbiAgICB0aGlzLnRvWVBvcyA9IHRoaXMubWFudWFsbHlFZmZlY3QudHJhbnNmb3JtLnBvc2l0aW9uLnkgKyB0b1VwUG9zO1xufTtcblxuRWZmZWN0Lm9uUmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5tYW51YWxseSkge1xuICAgICAgICB0aGlzLm1hbnVhbGx5RWZmZWN0LnRyYW5zZm9ybS55ICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiAyMDA7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbGx5RWZmZWN0LnRyYW5zZm9ybS55ID4gdGhpcy50b1lQb3MpIHtcbiAgICAgICAgICAgIHZhciBkaXNhcHBlYXIgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMudGVtcERpc2FwcGVhcik7XG4gICAgICAgICAgICB2YXIgZGlzYXBwZWFyQW5pbSA9IGRpc2FwcGVhci5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVBbmltYXRpb24pO1xuICAgICAgICAgICAgZGlzYXBwZWFyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMubWFudWFsbHlFZmZlY3QudHJhbnNmb3JtLnBvc2l0aW9uO1xuICAgICAgICAgICAgZGlzYXBwZWFyQW5pbS5wbGF5KCk7XG5cbiAgICAgICAgICAgIHRoaXMubWFudWFsbHlFZmZlY3QuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5tYW51YWxseSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tYW51YWxseUVmZmVjdCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnRvWVBvcyA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVmZmVjdDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYjVjN2EyNTMwZjA2NDI3NDhmNWNiZWUyNTI4NDkyODEnLCAnRmxvb3InKTtcbi8vIHNjcmlwdC9GbG9vci5qc1xuXG52YXIgRmxvb3IgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCk7XG4vL3NwZWVkXG5GbG9vci5wcm9wKCdzcGVlZCcsIDMwMCk7XG5cbkZsb29yLnByb3AoJ3gnLCAtODU4KTtcblxuRmxvb3IucHJvdG90eXBlLm9uUmVmcmVzaCA9IGZ1bmN0aW9uIChnYW1lU3BlZWQpIHtcbiAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueCAtPSAoRmlyZS5UaW1lLmRlbHRhVGltZSAqICggdGhpcy5zcGVlZCArIGdhbWVTcGVlZCApKTtcbiAgICBpZiAodGhpcy5lbnRpdHkudHJhbnNmb3JtLnggPCB0aGlzLngpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnggPSAwO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvb3I7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzNmMGJhOGZhMDU3YTQ3ZGFhNWUyMzc0NzQxZjBiOGRmJywgJ0dhbWVPdmVyV2luZG93Jyk7XG4vLyBzY3JpcHQvR2FtZU92ZXJXaW5kb3cuanNcblxudmFyIEdhbWVPdmVyV2luZG93ID0gRmlyZS5leHRlbmQoRmlyZS5Db21wb25lbnQpO1xuXG5HYW1lT3ZlcldpbmRvdy5wcm9wKCd0aXRsZScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLkVudGl0eSkpO1xuXG5HYW1lT3ZlcldpbmRvdy5wcm9wKCdwYW5lbCcsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLkVudGl0eSkpO1xuXG5HYW1lT3ZlcldpbmRvdy5wcm9wKCdidG5fcGxheScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLkVudGl0eSkpO1xuXG5HYW1lT3ZlcldpbmRvdy5wcm9wKCdzY29yZScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLkVudGl0eSkpO1xuXG5HYW1lT3ZlcldpbmRvdy5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBHYW1lID0gcmVxdWlyZSgnR2FtZScpO1xuICAgIHZhciBzY29yZVZhbHVlID0gdGhpcy5zY29yZS5nZXRDb21wb25lbnQoRmlyZS5CaXRtYXBUZXh0KTtcbiAgICBzY29yZVZhbHVlLnRleHQgPSBHYW1lLmluc3RhbmNlLmZyYWN0aW9uO1xuICAgIHRoaXMuYnRuX3BsYXkub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNjb3JlVmFsdWUudGV4dCA9IFwiMFwiO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgR2FtZS5pbnN0YW5jZS5tYXNrLmFjdGl2ZSA9IHRydWU7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnRpdGxlLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgMjUwKTtcbiAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgLTIwMCk7XG59O1xuXG5HYW1lT3ZlcldpbmRvdy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRpdGxlLnRyYW5zZm9ybS55ID4gMTAwKSB7XG4gICAgICAgIHRoaXMudGl0bGUudHJhbnNmb3JtLnkgLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDYwMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUudHJhbnNmb3JtLnkgPSAxMDA7XG4gICAgfVxuICAgIGlmICh0aGlzLnBhbmVsLnRyYW5zZm9ybS55IDwgMCkge1xuICAgICAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS55ICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiA2MDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS55ID0gMDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPdmVyV2luZG93O1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmYzk5MWRkNzAwMzM0YjgwOWQ0MWM4YTg2YTcwMmU1OScsICdHYW1lJyk7XG4vLyBzY3JpcHQvR2FtZS5qc1xuXG52YXIgU2hlZXAgPSByZXF1aXJlKCdTaGVlcCcpO1xudmFyIEZsb29yID0gcmVxdWlyZSgnRmxvb3InKTtcbnZhciBDb2xsaXNpb24gPSByZXF1aXJlKCdDb2xsaXNpb24nKTtcbnZhciBHYW1lT3ZlcldpbmRvdyA9IHJlcXVpcmUoJ0dhbWVPdmVyV2luZG93Jyk7XG52YXIgQXVkaW9Db250cm9sID0gcmVxdWlyZSgnQXVkaW9Db250cm9sJyk7XG52YXIgRWZmZWN0ID0gcmVxdWlyZSgnRWZmZWN0Jyk7XG5cbnZhciBHYW1lU3RhdGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3QucmVhZHkgPSAwXSA9ICdyZWFkeSc7XG4gICAgdFt0LnJ1biA9IDFdID0gJ3J1bic7XG4gICAgdFt0Lm92ZXIgPSAyXSA9ICdvdmVyJztcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxudmFyIEdhbWUgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIEdhbWUuaW5zdGFuY2UgPSB0aGlzO1xufSk7XG5cbkdhbWUuR2FtZVN0YXRlID0gR2FtZVN0YXRlO1xuXG5HYW1lLmluc3RhbmNlID0gbnVsbDtcblxuLy8tLSDnu7XnvorliJ3lp4tY5Z2Q5qCHXG5HYW1lLnByb3AoJ2luaXRTaGVlcFBvcycsIG5ldyBGaXJlLlZlYzIoLTE1MCwgLTE4MCksIEZpcmUuT2JqZWN0VHlwZShGaXJlLlZlYzIpKTtcblxuLy8tLSDliJvlu7rml7bnrqHpgZPliJ3lp4tY5Z2Q5qCHXG5HYW1lLnByb3AoJ2luaXRQaXBlR3JvdXBQb3MnLCBuZXcgRmlyZS5WZWMyKDYwMCwgMCksIEZpcmUuT2JqZWN0VHlwZShGaXJlLlZlYzIpKTtcblxuR2FtZS5wcm9wKCdjcmVhdGVQaXBlVGltZScsIDUpO1xuXG5HYW1lLnByb3AoJ2dhbWVTcGVlZCcsIDApO1xuXG5HYW1lLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmZvZ0p1bXBFZmZlY3QgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9mb2dfMScpO1xuICAgIHRoaXMudGVtcEFkZEZyYWN0aW9uRWZmID0gRmlyZS5FbnRpdHkuZmluZCgnL1ByZWZhYnMvYWRkRnJhY3Rpb24nKTtcbiAgICB0aGlzLnRlbXBNYXNrID0gRmlyZS5FbnRpdHkuZmluZCgnL1ByZWZhYnMvbWFzaycpO1xuXG4gICAgdGhpcy5waXBlR3JvdXAgPSBGaXJlLkVudGl0eS5maW5kKCcvR2FtZS9QaXBlR3JvdXAnKTtcblxuICAgIC8vLS0g5ri45oiP54q25oCBXG4gICAgdGhpcy5nYW1lU3RhdGUgPSBHYW1lU3RhdGUucnVuO1xuXG4gICAgdGhpcy5nYW1lT3ZlcldpbmRvdyA9IEZpcmUuRW50aXR5LmZpbmQoJy9HYW1lT3ZlcldpbmRvdycpO1xuXG4gICAgdGhpcy5iZyA9IEZpcmUuRW50aXR5LmZpbmQoJy9iZycpLmdldENvbXBvbmVudChGbG9vcik7XG4gICAgdGhpcy5mbG9vciA9IEZpcmUuRW50aXR5LmZpbmQoJy9mbG9vcicpLmdldENvbXBvbmVudChGbG9vcik7XG4gICAgdGhpcy5zaGVlcCA9IEZpcmUuRW50aXR5LmZpbmQoJy9zaGVlcCcpLmdldENvbXBvbmVudChTaGVlcCk7XG5cbiAgICB0aGlzLm1hc2sgPSBGaXJlLkVudGl0eS5maW5kKCcvbWFzaycpO1xuICAgIGlmICghdGhpcy5tYXNrKSB7XG4gICAgICAgIHRoaXMubWFzayA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wTWFzayk7XG4gICAgICAgIHRoaXMubWFzay5uYW1lID0gJ21hc2snO1xuICAgICAgICB0aGlzLm1hc2suZG9udERlc3Ryb3lPbkxvYWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLm1hc2tSZW5kZXIgPSB0aGlzLm1hc2suZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuXG5cbiAgICBGaXJlLklucHV0Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZVN0YXRlID09PSBHYW1lU3RhdGUub3Zlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBTaGVlcCA9IHJlcXVpcmUoJ1NoZWVwJyk7XG4gICAgICAgIHRoaXMuc2hlZXAuYW5pbS5wbGF5KHRoaXMuc2hlZXAuanVtcEFuaW1TdGF0ZSwgMCk7XG4gICAgICAgIHRoaXMuc2hlZXAuc2hlZXBTdGF0ZSA9IFNoZWVwLlNoZWVwU3RhdGUuanVtcDtcbiAgICAgICAgdGhpcy5zaGVlcC50ZW1wU3BlZWQgPSB0aGlzLnNoZWVwLnNwZWVkO1xuICAgICAgICBBdWRpb0NvbnRyb2wuanVtcEF1aWRvLnN0b3AoKTtcbiAgICAgICAgQXVkaW9Db250cm9sLmp1bXBBdWlkby5wbGF5KCk7XG5cbiAgICAgICAgdmFyIHBvcyA9IG5ldyBWZWMyKHRoaXMuc2hlZXAudHJhbnNmb3JtLnggLSA4MCwgdGhpcy5zaGVlcC50cmFuc2Zvcm0ueSArIDEwKTtcbiAgICAgICAgRWZmZWN0LmNyZWF0ZSh0aGlzLmZvZ0p1bXBFZmZlY3QsIHBvcyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMubGFzdFRpbWUgPSAxMDtcbiAgICB0aGlzLnBpcGVHcm91cExpc3QgPSBbXTtcbiAgICB0aGlzLmVudGl0eS5vbihcImRlc3Ryb3ktUGlwZUdyb3VwXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5waXBlR3JvdXBMaXN0KSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnBpcGVHcm91cExpc3QuaW5kZXhPZihldmVudC50YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5waXBlR3JvdXBMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8tLSDliIbmlbBcbiAgICB0aGlzLmZyYWN0aW9uID0gMDtcbiAgICB0aGlzLmZyYWN0aW9uQnRtcEZvbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvZnJhY3Rpb24nKS5nZXRDb21wb25lbnQoRmlyZS5CaXRtYXBUZXh0KTtcblxuICAgIC8vLS0g6Z+z5pWIXG4gICAgQXVkaW9Db250cm9sLmluaXQoKTtcblxuICAgIC8vLS0g54m55pWIXG4gICAgRWZmZWN0LmluaXQoKTtcbn07XG5cbkdhbWUucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xufTtcblxuR2FtZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lT3ZlcldpbmRvdy5lbmFibGVkID0gZmFsc2U7XG4gICAgdGhpcy5mcmFjdGlvbiA9IDA7XG4gICAgdGhpcy5mcmFjdGlvbkJ0bXBGb250LnRleHQgPSB0aGlzLmZyYWN0aW9uO1xuICAgIHRoaXMubGFzdFRpbWUgPSBGaXJlLlRpbWUudGltZSArIDEwO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnBpcGVHcm91cExpc3QubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgdmFyIHBpcGVHcm91cEVudGl0eSA9IHRoaXMucGlwZUdyb3VwTGlzdFtpXTtcbiAgICAgICAgaWYgKCFwaXBlR3JvdXBFbnRpdHkgfHwgcGlwZUdyb3VwRW50aXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHBpcGVHcm91cEVudGl0eS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMucGlwZUdyb3VwTGlzdCA9IFtdO1xuICAgIHRoaXMuc2hlZXAuaW5pdCh0aGlzLmluaXRTaGVlcFBvcyk7XG4gICAgdGhpcy5nYW1lU3RhdGUgPSBHYW1lU3RhdGUucmVhZHk7XG4gICAgQXVkaW9Db250cm9sLmdhbWVPdmVyQXVpZG8uc3RvcCgpO1xuICAgIEF1ZGlvQ29udHJvbC5oaXRBdWlkby5zdG9wKCk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLy0tIOe7tee+iueahOabtOaWsFxuICAgIC8vLS0g57u1576K55qE5pu05pawXG4gICAgdGhpcy5zaGVlcC5vblJlZnJlc2goKTtcblxuICAgIHN3aXRjaCAodGhpcy5nYW1lU3RhdGUpIHtcbiAgICAgICAgY2FzZSBHYW1lU3RhdGUucmVhZHk6XG4gICAgICAgICAgICBpZiAodGhpcy5tYXNrLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFza1JlbmRlci5jb2xvci5hIC09IEZpcmUuVGltZS5kZWx0YVRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFza1JlbmRlci5jb2xvci5hIDwgMC4zKSB7XG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvQ29udHJvbC5wbGF5UmVhZHlHYW1lQmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFza1JlbmRlci5jb2xvci5hIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXNrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5ydW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR2FtZVN0YXRlLnJ1bjpcbiAgICAgICAgICAgIHZhciBnYW1lT3ZlciA9IENvbGxpc2lvbi5jb2xsaXNpb25EZXRlY3Rpb24odGhpcy5zaGVlcCwgdGhpcy5waXBlR3JvdXBMaXN0KTtcbiAgICAgICAgICAgIGlmIChnYW1lT3Zlcikge1xuICAgICAgICAgICAgICAgIEF1ZGlvQ29udHJvbC5nYW1lQXVpZG8uc3RvcCgpO1xuICAgICAgICAgICAgICAgIEF1ZGlvQ29udHJvbC5nYW1lT3ZlckF1aWRvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICBBdWRpb0NvbnRyb2wuaGl0QXVpZG8ucGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hlZXAuYW5pbS5wbGF5KHRoaXMuc2hlZXAuZGllQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwLnNoZWVwU3RhdGUgPSBTaGVlcC5TaGVlcFN0YXRlLmRpZTtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5vdmVyO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJXaW5kb3cuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyV2luZG93LmdldENvbXBvbmVudChHYW1lT3ZlcldpbmRvdykub25SZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8tLSDmr4/ov4fkuIDmrrXml7bpl7TliJvlu7rnrqHpgZNcbiAgICAgICAgICAgIHZhciBjdXJUaW1lID0gTWF0aC5hYnMoRmlyZS5UaW1lLnRpbWUgLSB0aGlzLmxhc3RUaW1lKTtcbiAgICAgICAgICAgIGlmIChjdXJUaW1lID49IHRoaXMuY3JlYXRlUGlwZVRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUaW1lID0gRmlyZS5UaW1lLnRpbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVQaXBlR3JvdXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vLS0g6IOM5pmv5Yi35pawXG4gICAgICAgICAgICB0aGlzLmJnLm9uUmVmcmVzaCh0aGlzLmdhbWVTcGVlZCk7XG4gICAgICAgICAgICAvLy0tIOWcsOadv+WIt+aWsFxuICAgICAgICAgICAgdGhpcy5mbG9vci5vblJlZnJlc2godGhpcy5nYW1lU3BlZWQpO1xuICAgICAgICAgICAgLy8tLSDnrqHpgZPliLfmlrBcbiAgICAgICAgICAgIGlmICh0aGlzLnBpcGVHcm91cExpc3QgJiYgdGhpcy5waXBlR3JvdXBMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDAsIGxlbiA9IHRoaXMucGlwZUdyb3VwTGlzdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIHBpcGVHcm91cEVudGl0eSwgcGlwZUdyb3BDb21wO1xuICAgICAgICAgICAgICAgIC8vLS0g566h6YGT5Yi35pawXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVHcm91cEVudGl0eSA9IHRoaXMucGlwZUdyb3VwTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaXBlR3JvdXBFbnRpdHkgfHwgcGlwZUdyb3VwRW50aXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBpcGVHcm9wQ29tcCA9IHBpcGVHcm91cEVudGl0eS5nZXRDb21wb25lbnQoJ1BpcGVHcm91cCcpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlR3JvcENvbXAub25SZWZyZXNoKHRoaXMuZ2FtZVNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8tLSDnu7XnvorpgJrov4fnrqHpgZPnmoTorqHnrpcgJiYg6K6h566X5YiG5pWwXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVHcm91cEVudGl0eSA9IHRoaXMucGlwZUdyb3VwTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaXBlR3JvdXBFbnRpdHkgfHwgcGlwZUdyb3VwRW50aXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBpcGVHcm9wQ29tcCA9IHBpcGVHcm91cEVudGl0eS5nZXRDb21wb25lbnQoJ1BpcGVHcm91cCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2hlZXBYID0gKHRoaXMuc2hlZXAudHJhbnNmb3JtLnggLSB0aGlzLnNoZWVwLnNoZWVwU3ByaXRSZW5kZXIud2lkdGggLyAyICk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwaXBlR3JvdXBYID0gKHBpcGVHcm91cEVudGl0eS50cmFuc2Zvcm0ueCArIHBpcGVHcm9wQ29tcC5waXBlR3JvdXBXaXRoIC8gMiApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBpcGVHcm9wQ29tcC5oYXNQYXNzZWQgJiYgc2hlZXBYID4gcGlwZUdyb3VwWCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3BDb21wLmhhc1Bhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYWN0aW9uKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYWN0aW9uQnRtcEZvbnQudGV4dCA9IHRoaXMuZnJhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5pdFBvcyA9IG5ldyBWZWMyKHRoaXMuc2hlZXAudHJhbnNmb3JtLnggLSAzMCwgdGhpcy5zaGVlcC50cmFuc2Zvcm0ueSArIDUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdC5jcmVhdGVNYW51YWxseUVmZmVjdFVwTW92ZSh0aGlzLnRlbXBBZGRGcmFjdGlvbkVmZiwgaW5pdFBvcywgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEF1ZGlvQ29udHJvbC5wb2ludEF1aWRvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdhbWVTdGF0ZS5vdmVyOlxuICAgICAgICAgICAgaWYgKHRoaXMubWFzay5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgRmlyZS5FbmdpbmUubG9hZFNjZW5lKCdNYWluTWVudScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vLS0g54m55pWI5Yi35pawXG4gICAgRWZmZWN0Lm9uUmVmcmVzaCgpO1xufTtcblxuLy8tLSDliJvlu7rnrqHpgZPnu4RcbkdhbWUucHJvdG90eXBlLmNyZWF0ZVBpcGVHcm91cCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZW50aXR5ID0gbmV3IEZpcmUuRW50aXR5KCk7XG4gICAgdmFyIHBpcGVHcm9wQ29tcCA9IGVudGl0eS5hZGRDb21wb25lbnQoJ1BpcGVHcm91cCcpXG4gICAgZW50aXR5LnBhcmVudCA9IHRoaXMucGlwZUdyb3VwO1xuICAgIGVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLmluaXRQaXBlR3JvdXBQb3M7XG4gICAgcGlwZUdyb3BDb21wLmNyZWF0ZSgpO1xuICAgIHRoaXMucGlwZUdyb3VwTGlzdC5wdXNoKGVudGl0eSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzNkZWI5OWY4MzllZjRlYjg5M2IzODgzNWJkYTk1NTYzJywgJ01haW5NZW51Jyk7XG4vLyBzY3JpcHQvTWFpbk1lbnUuanNcblxudmFyIE1haW5NZW51ID0gRmlyZS5leHRlbmQoRmlyZS5Db21wb25lbnQpO1xuXG5NYWluTWVudS5wcm9wKCd0ZW1wTWFzaycsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLkVudGl0eSkpO1xuXG5NYWluTWVudS5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYmcgPSB0aGlzLmVudGl0eS5maW5kKCdiZycpLmdldENvbXBvbmVudCgnRmxvb3InKTtcbiAgICB0aGlzLmZsb29yID0gdGhpcy5lbnRpdHkuZmluZCgnZmxvb3InKS5nZXRDb21wb25lbnQoJ0Zsb29yJyk7XG4gICAgdGhpcy5idG5fcGxheSA9IHRoaXMuZW50aXR5LmZpbmQoJ2J1dHRvbl9wbGF5Jyk7XG4gICAgdGhpcy5idG5fcGxheS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nb1RvR2FtZSA9IHRydWU7XG4gICAgICAgIHRoaXMubWFzay5hY3RpdmUgPSB0cnVlO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLm1hc2sgPSBGaXJlLkVudGl0eS5maW5kKCcvbWFzaycpO1xuICAgIHRoaXMubWFza1JlbmRlciA9IG51bGw7XG4gICAgaWYoIXRoaXMubWFzayl7XG4gICAgICAgIHRoaXMubWFzayA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wTWFzayk7XG4gICAgICAgIHRoaXMubWFzay5uYW1lID0gJ21hc2snO1xuICAgICAgICB0aGlzLm1hc2suZG9udERlc3Ryb3lPbkxvYWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLm1hc2tSZW5kZXIgPSB0aGlzLm1hc2suZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgIHRoaXMubWFza1JlbmRlci5jb2xvci5hID0gMTtcbiAgICB0aGlzLmdvVG9HYW1lID0gZmFsc2U7XG59O1xuXG5NYWluTWVudS5wcm90b3R5cGUubGF0ZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLy0tIOiDjOaZr+abtOaWsFxuICAgIHRoaXMuYmcub25SZWZyZXNoKDApO1xuICAgIC8vLS0g5Zyw6Z2i5pu05pawXG4gICAgdGhpcy5mbG9vci5vblJlZnJlc2goMCk7XG5cbiAgICBpZiAodGhpcy5tYXNrLmFjdGl2ZSkge1xuICAgICAgICBpZiAodGhpcy5nb1RvR2FtZSkge1xuICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgKz0gRmlyZS5UaW1lLmRlbHRhVGltZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA+IDEpIHtcbiAgICAgICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ0dhbWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWFza1JlbmRlci5jb2xvci5hIC09IEZpcmUuVGltZS5kZWx0YVRpbWU7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMubWFzay5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbk1lbnU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzAwNGNjZGEwOGU5MzQ5Mzg5ZDkwNWIxZjIxYmY5ZjZhJywgJ1BpcGVHcm91cCcpO1xuLy8gc2NyaXB0L1BpcGVHcm91cC5qc1xuXG52YXIgUGlwZUdyb3VwID0gRmlyZS5leHRlbmQoRmlyZS5Db21wb25lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAvLy0tIOWfuuehgOenu+WKqOmAn+W6plxuICAgIHRoaXMuc3BlZWRfID0gMTAwO1xuICAgIC8vLS0gKCBCZXlvbmQgdGhpcyByYW5nZSB3aWxsIGJlIGRlc3Ryb3llZCApIOi2heWHuui/meS4quiMg+WbtOWwseS8muiiq+mUgOavgVxuICAgIHRoaXMucmFuZ2VfID0gLTYwMDtcbiAgICAvLy0tIOacgOWkp+mXtOi3nVxuICAgIHRoaXMubWF4U3BhY2luZyA9IDI1MDsvLzI4MDtcbiAgICAvLy0tIOacgOWwj+mXtOi3nVxuICAgIHRoaXMubWluU3BhY2luZyA9IDIyMjsgLy8yNTA7XG4gICAgLy8tLSDkuIrkuIDmrKHpmo/mnLrliLDnmoTnrqHpgZPnsbvlnotcbiAgICB0aGlzLmxhc3RQaXBlVHlwZSA9IG51bGw7XG4gICAgLy8tLSDnrqHpgZPnmoTlrr3luqZcbiAgICB0aGlzLnBpcGVHcm91cFdpdGggPSAwO1xufSk7XG5cbi8vLS0g566h6YGT55qE57G75Z6LXG52YXIgUGlwZVR5cGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3QuQm90dG9tID0gMF0gPSAnYm90dG9tJzsgICAgICAgIC8vIOS4iuaWueeuoeWtkFxuICAgIHRbdC5Ub3AgPSAxXSA9ICd0b3AnOyAgICAgICAgICAgLy8g5LiK5pa5566h5a2QXG4gICAgdFt0LkRvdWJsZSA9IDJdID0gJ2RvdWJsZSc7ICAgICAgICAvLyDkuIvkuIrmlrnnrqHlrZBcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxuUGlwZUdyb3VwLnByb3AoJ2hhc1Bhc3NlZCcsIGZhbHNlKTtcblxuLy8tLSDnrqHpgZPnsbvlnotcblBpcGVHcm91cC5wcm9wKCdwaXBlVHlwZScsIFBpcGVUeXBlLlRvcCwgRmlyZS5FbnVtKFBpcGVUeXBlKSk7XG5cbi8vLS0g5LiK5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLlRvcFBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoODAwLCA3MTApO1xuXG4vLy0tIOS4i+aWueeuoeWtkOWdkOagh+iMg+WbtCBNYXgg5LiOIE1pblxuUGlwZUdyb3VwLnByb3RvdHlwZS5Cb3R0b21QaXBlUG9zUmFuZ2UgPSBuZXcgRmlyZS5WZWMyKC03NTAsIC04MDApO1xuXG4vLy0tIOWPjOS4quS4iuaWueeuoeWtkOWdkOagh+iMg+WbtCBNYXgg5LiOIE1pblxuUGlwZUdyb3VwLnByb3RvdHlwZS5Eb3VibGVUb3BQaXBlUG9zUmFuZ2UgPSBuZXcgRmlyZS5WZWMyKDEwNTAsIDcxMCk7XG5cbi8vLS0g5Y+M5Liq5LiL5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLkRvdWJsZUJvdHRvbVBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoLTgwMCwgLTk4MCk7XG5cblBpcGVHcm91cC5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGlwZSA9IEZpcmUuRW50aXR5LmZpbmQoJy9QcmVmYWJzL3BpcGUnKTtcbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUucmFuZG9tUGlwZVR5cGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJhbmRvbVZsdWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgMTtcbiAgICBpZiAocmFuZG9tVmx1ZSA+PSAxICYmIHJhbmRvbVZsdWUgPD0gNjApIHtcbiAgICAgICAgcmV0dXJuIFBpcGVUeXBlLkRvdWJsZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmFuZG9tVmx1ZSA+PSA2MCAmJiByYW5kb21WbHVlIDw9IDgwKSB7XG4gICAgICAgIHJldHVybiBQaXBlVHlwZS5Cb3R0b207XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gUGlwZVR5cGUuVG9wO1xuICAgIH1cbn1cblxuUGlwZUdyb3VwLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGFzdFBpcGVUeXBlICE9PSBudWxsICYmIHRoaXMubGFzdFBpcGVUeXBlID09PSBQaXBlVHlwZS5Ub3ApIHtcbiAgICAgICAgd2hpbGUgKHRoaXMubGFzdFBpcGVUeXBlID09PSB0aGlzLnBpcGVUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnBpcGVUeXBlID0gdGhpcy5yYW5kb21QaXBlVHlwZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBpcGVUeXBlID0gdGhpcy5yYW5kb21QaXBlVHlwZSgpO1xuICAgICAgICAvLy0tIOS4uuS6huS9k+mqjO+8jOmYsuatouesrOS4gOasoeWHuueOsOeahOeuoemBk+aYr+S4iuaWueeahFxuICAgIH1cbiAgICB0aGlzLmVudGl0eS5uYW1lID0gUGlwZVR5cGVbdGhpcy5waXBlVHlwZV07XG4gICAgc3dpdGNoICh0aGlzLnBpcGVUeXBlKSB7XG4gICAgICAgIGNhc2UgUGlwZVR5cGUuQm90dG9tOlxuICAgICAgICAgICAgdGhpcy5pbml0Qm90dG9tUGlwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUGlwZVR5cGUuVG9wOlxuICAgICAgICAgICAgdGhpcy5pbml0VG9wUGlwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUGlwZVR5cGUuRG91YmxlOlxuICAgICAgICAgICAgdGhpcy5pbml0RG91YmxlUGlwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5QaXBlR3JvdXAucHJvdG90eXBlLmluaXRUb3BQaXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b3BQaXBlID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnBpcGUpO1xuICAgIHZhciB0b3BQaXBlUmVuZGVyID0gdG9wUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgdmFyIHJhbmRvbVkgPSBNYXRoLnJhbmRvbVJhbmdlKHRoaXMuVG9wUGlwZVBvc1JhbmdlLngsIHRoaXMuVG9wUGlwZVBvc1JhbmdlLnkpO1xuXG4gICAgdG9wUGlwZS5wYXJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICB0b3BQaXBlLnRyYW5zZm9ybS54ID0gMDtcbiAgICB0b3BQaXBlLnRyYW5zZm9ybS55ID0gcmFuZG9tWTtcbiAgICB0b3BQaXBlLnRyYW5zZm9ybS5zY2FsZVkgPSAxO1xuICAgIHRvcFBpcGUubmFtZSA9ICd0b3BQaXBlJztcblxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IHRvcFBpcGVSZW5kZXIud2lkdGg7XG59O1xuXG5QaXBlR3JvdXAucHJvdG90eXBlLmluaXRCb3R0b21QaXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBib3R0b21QaXBlID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnBpcGUpO1xuICAgIHZhciBib3R0b21QaXBlUmVuZGVyID0gYm90dG9tUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgdmFyIHJhbmRvbVkgPSBNYXRoLnJhbmRvbVJhbmdlKHRoaXMuQm90dG9tUGlwZVBvc1JhbmdlLngsIHRoaXMuQm90dG9tUGlwZVBvc1JhbmdlLnkpO1xuXG4gICAgYm90dG9tUGlwZS5wYXJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS54ID0gMDtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS55ID0gcmFuZG9tWTtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS5zY2FsZVkgPSAtMTtcbiAgICBib3R0b21QaXBlLm5hbWUgPSAnYm90dG9tUGlwZSc7XG5cbiAgICB0aGlzLnBpcGVHcm91cFdpdGggPSBib3R0b21QaXBlUmVuZGVyLnNwcml0ZS53aWR0aDtcbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUuaW5pdERvdWJsZVBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvcFBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIGJvdHRvbVBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIHRvcFBpcGVSZW5kZXIgPSB0b3BQaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICB2YXIgYm90dG9tUGlwZVJlbmRlciA9IHRvcFBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuXG4gICAgdmFyIHJhbmRvbVRvcFkgPSAwO1xuICAgIHZhciByYW5kb21Cb3R0b21ZID0gMDtcbiAgICB2YXIgdG9wWSA9IDA7XG4gICAgdmFyIGJvdHRvbVkgPSAwO1xuICAgIHZhciBzcGFjaW5nID0gMDtcblxuICAgIHdoaWxlIChzcGFjaW5nIDwgdGhpcy5taW5TcGFjaW5nIHx8IHNwYWNpbmcgPiB0aGlzLm1heFNwYWNpbmcpIHtcbiAgICAgICAgcmFuZG9tVG9wWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Eb3VibGVUb3BQaXBlUG9zUmFuZ2UueCwgdGhpcy5Eb3VibGVUb3BQaXBlUG9zUmFuZ2UueSk7XG4gICAgICAgIHJhbmRvbUJvdHRvbVkgPSBNYXRoLnJhbmRvbVJhbmdlKHRoaXMuRG91YmxlQm90dG9tUGlwZVBvc1JhbmdlLngsIHRoaXMuRG91YmxlQm90dG9tUGlwZVBvc1JhbmdlLnkpO1xuICAgICAgICB0b3BZID0gcmFuZG9tVG9wWSAtICh0b3BQaXBlUmVuZGVyLnNwcml0ZS5oZWlnaHQgLyAyKTtcbiAgICAgICAgYm90dG9tWSA9IHJhbmRvbUJvdHRvbVkgKyAoYm90dG9tUGlwZVJlbmRlci5zcHJpdGUuaGVpZ2h0IC8gMik7XG4gICAgICAgIGlmICh0b3BZIDwgMCB8fCBib3R0b21ZID4gMCkge1xuICAgICAgICAgICAgc3BhY2luZyA9IE1hdGguYWJzKHRvcFkpIC0gTWF0aC5hYnMoYm90dG9tWSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzcGFjaW5nID0gTWF0aC5hYnModG9wWSkgKyBNYXRoLmFicyhib3R0b21ZKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b3BQaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21Ub3BZO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IDE7XG4gICAgdG9wUGlwZS5uYW1lID0gJ3RvcFBpcGUnO1xuXG4gICAgYm90dG9tUGlwZS5wYXJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS54ID0gMDtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS55ID0gcmFuZG9tQm90dG9tWTtcbiAgICBib3R0b21QaXBlLnRyYW5zZm9ybS5zY2FsZVkgPSAtMTtcbiAgICBib3R0b21QaXBlLm5hbWUgPSAnYm90dG9tUGlwZSc7XG5cbiAgICB0aGlzLnBpcGVHcm91cFdpdGggPSBib3R0b21QaXBlUmVuZGVyLnNwcml0ZS53aWR0aDtcbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKGdhbWVTcGVlZCkge1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS54IC09IEZpcmUuVGltZS5kZWx0YVRpbWUgKiAoIHRoaXMuc3BlZWRfICsgZ2FtZVNwZWVkICk7XG4gICAgaWYgKHRoaXMuZW50aXR5LnRyYW5zZm9ybS54IDwgdGhpcy5yYW5nZV8pIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmVudGl0eS5kaXNwYXRjaEV2ZW50KG5ldyBGaXJlLkV2ZW50KFwiZGVzdHJveS1QaXBlR3JvdXBcIiwgdHJ1ZSkpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGlwZUdyb3VwO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcwNjYzM2MwYWE5MzU0Y2U5YWQ0YWY4NmRiYWRhYWQ1MCcsICdTaGVlcCcpO1xuLy8gc2NyaXB0L1NoZWVwLmpzXG5cbnZhciBFZmZlY3QgPSByZXF1aXJlKCdFZmZlY3QnKTtcblxudmFyIFNoZWVwU3RhdGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3Qubm9uZSA9IDBdID0gJ25vbmUnLFxuICAgIHRbdC5ydW4gPSAwXSA9ICdydW4nO1xuICAgIHRbdC5qdW1wID0gMV0gPSAnanVtcCc7XG4gICAgdFt0LmRyb3AgPSAyXSA9ICdkcm9wJztcbiAgICB0W3QuZG93biA9IDNdID0gJ2Rvd24nO1xuICAgIHRbdC5kaWUgPSA0XSA9ICdkaWUnXG4gICAgcmV0dXJuIHQ7XG59KSh7fSk7XG5cbnZhciBTaGVlcCA9IEZpcmUuZXh0ZW5kKEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5za3lNYXhZID0gMjUwOy8vMTYwO1xuICAgIHRoaXMuYW5pbSA9IG51bGw7XG4gICAgdGhpcy5zaGVlcFNwcml0UmVuZGVyID0gMDtcbiAgICB0aGlzLnJ1bkFuaW1TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5qdW1wQW5pbVN0YXRlID0gbnVsbDtcbiAgICB0aGlzLmRyb3BBbmltU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuZG93bkFuaW1TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5kaWVBbmltU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuc2hlZXBTdGF0ZSA9IFNoZWVwU3RhdGUucnVuO1xuICAgIHRoaXMudGVtcFNwZWVkID0gMDtcbn0pO1xuXG5TaGVlcC5TaGVlcFN0YXRlID0gU2hlZXBTdGF0ZTtcblxuU2hlZXAucHJvcCgnZ3Jhdml0eScsIDkuOCk7XG5cblNoZWVwLnByb3AoJ3NwZWVkJywgMzAwKTtcblxuU2hlZXAucHJvcCgnZkxvb3JDb29yZGluYXRlcycsIC0xODApO1xuXG5TaGVlcC5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbSA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZUFuaW1hdGlvbik7XG4gICAgdGhpcy5ydW5BbmltU3RhdGUgPSB0aGlzLmFuaW0uZ2V0QW5pbVN0YXRlKCdzaGVlcF9ydW4nKTtcbiAgICB0aGlzLmp1bXBBbmltU3RhdGUgPSB0aGlzLmFuaW0uZ2V0QW5pbVN0YXRlKCdzaGVlcF9qdW1wJyk7XG4gICAgdGhpcy5kcm9wQW5pbVN0YXRlID0gdGhpcy5hbmltLmdldEFuaW1TdGF0ZSgnc2hlZXBfZHJvcCcpO1xuICAgIHRoaXMuZG93bkFuaW1TdGF0ZSA9IHRoaXMuYW5pbS5nZXRBbmltU3RhdGUoJ3NoZWVwX2Rvd24nKTtcbiAgICB0aGlzLmRpZUFuaW1TdGF0ZSA9IHRoaXMuYW5pbS5nZXRBbmltU3RhdGUoJ3NoZWVwX2RpZScpO1xuXG4gICAgdGhpcy5zaGVlcFNwcml0UmVuZGVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgIHRoaXMuZGllUm90YXRpb24gPSAtODg7XG5cbiAgICB0aGlzLmZvZ0Rvd25FZmZlY3QgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9mb2dfMicpO1xufTtcblxuU2hlZXAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnJvdGF0aW9uID0gMDtcbiAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBwb3M7XG4gICAgdGhpcy5hbmltLnBsYXkodGhpcy5ydW5BbmltU3RhdGUsIDApO1xuICAgIHRoaXMuc2hlZXBTdGF0ZSA9IFNoZWVwU3RhdGUucnVuO1xufTtcblxuU2hlZXAucHJvdG90eXBlLm9uUmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLnNoZWVwU3RhdGUgIT09IFNoZWVwU3RhdGUucnVuKSB7XG4gICAgICAgIHRoaXMudGVtcFNwZWVkIC09IChGaXJlLlRpbWUuZGVsdGFUaW1lICogMTAwKSAqIHRoaXMuZ3Jhdml0eTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2hlZXBTdGF0ZSkge1xuICAgICAgICBjYXNlIFNoZWVwU3RhdGUucnVuOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU2hlZXBTdGF0ZS5qdW1wOlxuICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMudGVtcFNwZWVkO1xuICAgICAgICAgICAgaWYgKHRoaXMudGVtcFNwZWVkIDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbS5wbGF5KHRoaXMuZHJvcEFuaW1TdGF0ZSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5kcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU2hlZXBTdGF0ZS5kcm9wOlxuICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMudGVtcFNwZWVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuZW50aXR5LnRyYW5zZm9ybS55IDw9IHRoaXMuZkxvb3JDb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS55ID0gdGhpcy5mTG9vckNvb3JkaW5hdGVzO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvcyA9IG5ldyBWZWMyKHRoaXMuZW50aXR5LnRyYW5zZm9ybS54LCB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSAtIDMwKTtcbiAgICAgICAgICAgICAgICBFZmZlY3QuY3JlYXRlKHRoaXMuZm9nRG93bkVmZmVjdCwgcG9zKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbS5wbGF5KHRoaXMuZG93bkFuaW1TdGF0ZSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5kb3duO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU2hlZXBTdGF0ZS5kb3duOlxuICAgICAgICAgICAgaWYgKHRoaXMuZG93bkFuaW1TdGF0ZSAmJiAhdGhpcy5hbmltLmlzUGxheWluZyh0aGlzLmRvd25BbmltU3RhdGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW0ucGxheSh0aGlzLnJ1bkFuaW1TdGF0ZSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5ydW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmRpZTpcbiAgICAgICAgICAgIGlmICh0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSA+IHRoaXMuZkxvb3JDb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS55ICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiB0aGlzLnRlbXBTcGVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIHBvcyA9IG5ldyBWZWMyKHRoaXMuZW50aXR5LnRyYW5zZm9ybS54LCB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSAtIDMwKTtcbiAgICAgICAgICAgICAgICBFZmZlY3QuY3JlYXRlKHRoaXMuZm9nRG93bkVmZmVjdCwgcG9zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLm5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hlZXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWNsaXAnKTtcbi8vIHNyYy9hdWRpby1jbGlwLmpzXG5cbkZpcmUuQXVkaW9DbGlwID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgQXVkaW9DbGlwID0gRmlyZS5leHRlbmQoXCJGaXJlLkF1ZGlvQ2xpcFwiLCBGaXJlLkFzc2V0KTtcblxuICAgIEF1ZGlvQ2xpcC5wcm9wKCdyYXdEYXRhJywgbnVsbCwgRmlyZS5SYXdUeXBlKCdhdWRpbycpKTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoJ2J1ZmZlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBCdWZmZXIodGhpcyk7XG4gICAgfSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImxlbmd0aFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcInNhbXBsZXNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXModGhpcyk7XG4gICAgfSk7XG5cbiAgICBBdWRpb0NsaXAuZ2V0KFwiY2hhbm5lbHNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImZyZXF1ZW5jeVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwRnJlcXVlbmN5KHRoaXMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEF1ZGlvQ2xpcDtcbn0pKCk7XG5cbi8vIGNyZWF0ZSBlbnRpdHkgYWN0aW9uXG4vLyBAaWYgRURJVE9SXG5GaXJlLkF1ZGlvQ2xpcC5wcm90b3R5cGUuY3JlYXRlRW50aXR5ID0gZnVuY3Rpb24gKCBjYiApIHtcbiAgICB2YXIgZW50ID0gbmV3IEZpcmUuRW50aXR5KHRoaXMubmFtZSk7XG5cbiAgICB2YXIgYXVkaW9Tb3VyY2UgPSBlbnQuYWRkQ29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuXG4gICAgYXVkaW9Tb3VyY2UuY2xpcCA9IHRoaXM7XG5cbiAgICBpZiAoIGNiIClcbiAgICAgICAgY2IgKGVudCk7XG59O1xuLy8gQGVuZGlmXG5cbm1vZHVsZS5leHBvcnRzID0gRmlyZS5BdWRpb0NsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWxlZ2FjeScpO1xuLy8gc3JjL2F1ZGlvLWxlZ2FjeS5qc1xuXG4oZnVuY3Rpb24oKXtcbiAgICB2YXIgVXNlV2ViQXVkaW8gPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQpO1xuICAgIGlmIChVc2VXZWJBdWRpbykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBBdWRpb0NvbnRleHQgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGxvYWRlciAodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xuICAgICAgICB2YXIgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XG4gICAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBhdWRpbyk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZSwgbnVsbCk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICBhdWRpby5zcmMgPSB1cmw7XG4gICAgICAgIGF1ZGlvLmxvYWQoKTtcbiAgICB9XG5cbiAgICBGaXJlLkxvYWRNYW5hZ2VyLnJlZ2lzdGVyUmF3VHlwZXMoJ2F1ZGlvJywgbG9hZGVyKTtcblxuICAgIEF1ZGlvQ29udGV4dC5pbml0U291cmNlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuX2F1ZGlvID0gbnVsbDtcbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LmdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5fYXVkaW8gJiYgdGFyZ2V0Ll9wbGF5aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVUaW1lID0gZnVuY3Rpb24gKHRhcmdldCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuX2F1ZGlvKSB7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSB0YXJnZXQuX2F1ZGlvLmR1cmF0aW9uO1xuICAgICAgICAgICAgdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIOmdnOmfs1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVNdXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5tdXRlZCA9IHRhcmdldC5tdXRlO1xuICAgIH07XG5cbiAgICAvLyDorr7nva7pn7Pph4/vvIzpn7Pph4/ojIPlm7TmmK9bMCwgMV1cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlVm9sdW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby52b2x1bWUgPSB0YXJnZXQudm9sdW1lO1xuICAgIH07XG5cbiAgICAvLyDorr7nva7lvqrnjq9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTG9vcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ubG9vcCA9IHRhcmdldC5sb29wO1xuICAgIH07XG5cbiAgICAvLyDlsIbpn7PkuZDmupDoioLngrnnu5HlrprlhbfkvZPnmoTpn7PpopFidWZmZXJcbiAgICBBdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsaXApIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8gPSB0YXJnZXQuY2xpcC5yYXdEYXRhO1xuICAgIH07XG5cbiAgICAvLyDmmqvlgZxcbiAgICBBdWRpb0NvbnRleHQucGF1c2UgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5wYXVzZSgpO1xuICAgIH07XG5cbiAgICAvLyDlgZzmraJcbiAgICBBdWRpb0NvbnRleHQuc3RvcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBhdXNlKCk7XG4gICAgICAgIHRhcmdldC5fYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgIH07XG5cbiAgICAvLyDmkq3mlL5cbiAgICBBdWRpb0NvbnRleHQucGxheSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5jbGlwIHx8ICF0YXJnZXQuY2xpcC5yYXdEYXRhKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodGFyZ2V0Ll9wbGF5aW5nICYmICF0YXJnZXQuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgICAgICAgdGhpcy51cGRhdGVBdWRpb0NsaXAodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVWb2x1bWUodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVMb29wKHRhcmdldCk7XG4gICAgICAgIHRoaXMudXBkYXRlTXV0ZSh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBsYXkoKTtcblxuICAgICAgICAvLyDmkq3mlL7nu5PmnZ/lkI7nmoTlm57osINcbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRhcmdldC5vblBsYXlFbmQuYmluZCh0YXJnZXQpO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vIOiOt+W+l+mfs+mikeWJqui+keeahCBidWZmZXJcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlciA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g5Lul56eS5Li65Y2V5L2NIOiOt+WPlumfs+mikeWJqui+keeahCDplb/luqZcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcExlbmd0aCA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuY2xpcC5yYXdEYXRhLmR1cmF0aW9uO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTplb/luqZcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXMgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE5aOw6YGT5pWwXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTph4fmoLfpopHnjodcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEZyZXF1ZW5jeSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cblxuICAgIEZpcmUuQXVkaW9Db250ZXh0ID0gQXVkaW9Db250ZXh0O1xufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8tc291cmNlJyk7XG4vLyBzcmMvYXVkaW8tc291cmNlLmpzXG5cbnZhciBBdWRpb1NvdXJjZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEF1ZGlvU291cmNlID0gRmlyZS5leHRlbmQoXCJGaXJlLkF1ZGlvU291cmNlXCIsIEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTsgLy8tLSDlo7DmupDmmoLlgZzmiJbogIXlgZzmraLml7blgJnkuLpmYWxzZVxuICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTsvLy0tIOadpeWMuuWIhuWjsOa6kOaYr+aaguWBnOi/mOaYr+WBnOatolxuXG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RQbGF5ID0gMDtcblxuICAgICAgICB0aGlzLl9idWZmU291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdm9sdW1lR2FpbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5vbkVuZCA9IG51bGw7XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEZpcmUuYWRkQ29tcG9uZW50TWVudShBdWRpb1NvdXJjZSwgJ0F1ZGlvU291cmNlJyk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsIFwiaXNQbGF5aW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXVkaW9Tb3VyY2UucHJvdG90eXBlLCBcImlzUGF1c2VkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsICd0aW1lJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUodGhpcywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ19wbGF5YmFja1JhdGUnLCAxLjAsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3BsYXliYWNrUmF0ZScsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wbGF5YmFja1JhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXliYWNrUmF0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5YmFja1JhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy9cbiAgICBBdWRpb1NvdXJjZS5wcm9wKCdfY2xpcCcsIG51bGwsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ2NsaXAnLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xpcDtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBGaXJlLk9iamVjdFR5cGUoRmlyZS5BdWRpb0NsaXApXG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX2xvb3AnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbG9vcCcsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9vcDtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbG9vcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX211dGUnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbXV0ZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbXV0ZTtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbXV0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX211dGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX3ZvbHVtZScsIDEsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3ZvbHVtZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fdm9sdW1lO1xuICAgICAgIH0sXG4gICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgIGlmICh0aGlzLl92b2x1bWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICB0aGlzLl92b2x1bWUgPSBNYXRoLmNsYW1wMDEodmFsdWUpO1xuICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlVm9sdW1lKHRoaXMpO1xuICAgICAgICAgICB9XG4gICAgICAgfSxcbiAgICAgICBGaXJlLlJhbmdlKDAsMSlcbiAgICApO1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgncGxheU9uQXdha2UnLCB0cnVlKTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vblBsYXlFbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5vbkVuZCApIHtcbiAgICAgICAgICAgIHRoaXMub25FbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCB0aGlzLl9wYXVzZWQgKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBhdXNlKHRoaXMpO1xuICAgICAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCB0aGlzLl9wbGF5aW5nICYmICF0aGlzLl9wYXVzZWQgKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGlmICggdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBsYXkodGhpcywgdGhpcy5fc3RhcnRUaW1lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQucGxheSh0aGlzLCAwKTtcblxuICAgICAgICB0aGlzLl9wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoICF0aGlzLl9wbGF5aW5nICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQuc3RvcCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlpbmcgKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUub25TdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9pZiAodGhpcy5wbGF5T25Bd2FrZSkge1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZyhcIm9uU3RhcnRcIik7XG4gICAgICAgIC8vICAgIHRoaXMucGxheSgpO1xuICAgICAgICAvL31cbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uRW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wbGF5T25Bd2FrZSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uRGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBBdWRpb1NvdXJjZTtcbn0pKCk7XG5cbkZpcmUuQXVkaW9Tb3VyY2UgPSBBdWRpb1NvdXJjZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8td2ViLWF1ZGlvJyk7XG4vLyBzcmMvYXVkaW8td2ViLWF1ZGlvLmpzXG5cbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIE5hdGl2ZUF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dCk7XG4gICAgaWYgKCAhTmF0aXZlQXVkaW9Db250ZXh0ICkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZml4IGZpcmViYWxsLXgvZGV2IzM2NVxuICAgIGlmICghRmlyZS5uYXRpdmVBQykge1xuICAgICAgICBGaXJlLm5hdGl2ZUFDID0gbmV3IE5hdGl2ZUF1ZGlvQ29udGV4dCgpO1xuICAgIH1cblxuICAgIC8vIOa3u+WKoHNhZmVEZWNvZGVBdWRpb0RhdGHnmoTljp/lm6DvvJpodHRwczovL2dpdGh1Yi5jb20vZmlyZWJhbGwteC9kZXYvaXNzdWVzLzMxOFxuICAgIGZ1bmN0aW9uIHNhZmVEZWNvZGVBdWRpb0RhdGEoY29udGV4dCwgYnVmZmVyLCB1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aW1lb3V0ID0gZmFsc2U7XG4gICAgICAgIHZhciB0aW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygnVGhlIG9wZXJhdGlvbiBvZiBkZWNvZGluZyBhdWRpbyBkYXRhIGFscmVhZHkgdGltZW91dCEgQXVkaW8gdXJsOiBcIicgKyB1cmwgK1xuICAgICAgICAgICAgICAgICAgICAgJ1wiLiBTZXQgRmlyZS5BdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSB0byBhIGxhcmdlciB2YWx1ZSBpZiB0aGlzIGVycm9yIG9mdGVuIG9jY3VyLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICdTZWUgZmlyZWJhbGwteC9kZXYjMzE4IGZvciBkZXRhaWxzLicsIG51bGwpO1xuICAgICAgICB9LCBBdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSk7XG5cbiAgICAgICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYnVmZmVyLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGRlY29kZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRlY29kZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCAnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZSk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZGVyKHVybCwgY2FsbGJhY2ssIG9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIGNiID0gY2FsbGJhY2sgJiYgZnVuY3Rpb24gKGVycm9yLCB4aHIpIHtcbiAgICAgICAgICAgIGlmICh4aHIpIHtcbiAgICAgICAgICAgICAgICBzYWZlRGVjb2RlQXVkaW9EYXRhKEZpcmUubmF0aXZlQUMsIHhoci5yZXNwb25zZSwgdXJsLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZXJyb3IsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGaXJlLkxvYWRNYW5hZ2VyLl9sb2FkRnJvbVhIUih1cmwsIGNiLCBvblByb2dyZXNzLCAnYXJyYXlidWZmZXInKTtcbiAgICB9XG5cbiAgICBGaXJlLkxvYWRNYW5hZ2VyLnJlZ2lzdGVyUmF3VHlwZXMoJ2F1ZGlvJywgbG9hZGVyKTtcblxuICAgIHZhciBBdWRpb0NvbnRleHQgPSB7fTtcblxuICAgIEF1ZGlvQ29udGV4dC5NYXhEZWNvZGVUaW1lID0gNDAwMDtcblxuICAgIEF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCB0YXJnZXQuX3BhdXNlZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX3N0YXJ0VGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdGFyZ2V0Ll9wbGF5aW5nICkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5fc3RhcnRUaW1lICsgdGhpcy5nZXRQbGF5ZWRUaW1lKHRhcmdldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LmdldFBsYXllZFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiAoRmlyZS5uYXRpdmVBQy5jdXJyZW50VGltZSAtIHRhcmdldC5fbGFzdFBsYXkpICogdGFyZ2V0Ll9wbGF5YmFja1JhdGU7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0LCB0aW1lKSB7XG4gICAgICAgIHRhcmdldC5fbGFzdFBsYXkgPSBGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lO1xuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSA9IHRpbWU7XG5cbiAgICAgICAgaWYgKCB0YXJnZXQuaXNQbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5wYXVzZSh0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTXV0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX3ZvbHVtZUdhaW4pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fdm9sdW1lR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0Lm11dGUgPyAtMSA6ICh0YXJnZXQudm9sdW1lIC0gMSk7XG4gICAgfTtcblxuICAgIC8vIHJhbmdlIFswLDFdXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX3ZvbHVtZUdhaW4pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fdm9sdW1lR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0LnZvbHVtZSAtIDE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9idWZmU291cmNlKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2UubG9vcCA9IHRhcmdldC5sb29wO1xuICAgIH07XG5cbiAgICAvLyBiaW5kIGJ1ZmZlciBzb3VyY2VcbiAgICBBdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIHRhcmdldC5pc1BsYXlpbmcgKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AodGFyZ2V0LGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVBsYXliYWNrUmF0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5pc1BhdXNlZCApIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2UodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnBhdXNlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYnVmZlNvdXJjZSkgeyByZXR1cm47IH1cblxuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSArPSB0aGlzLmdldFBsYXllZFRpbWUodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uuc3RvcCgpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5zdG9wID0gZnVuY3Rpb24gKCB0YXJnZXQsIGVuZGVkICkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYnVmZlNvdXJjZSkgeyByZXR1cm47IH1cblxuICAgICAgICBpZiAoICFlbmRlZCApIHtcbiAgICAgICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uuc3RvcCgpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5wbGF5ID0gZnVuY3Rpb24gKCB0YXJnZXQsIGF0ICkge1xuICAgICAgICBpZiAoIXRhcmdldC5jbGlwIHx8ICF0YXJnZXQuY2xpcC5yYXdEYXRhKSB7IHJldHVybjsgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSBidWZmZXIgc291cmNlXG4gICAgICAgIHZhciBidWZmZXJTb3VyY2UgPSBGaXJlLm5hdGl2ZUFDLmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB2b2x1bWUgY29udHJvbFxuICAgICAgICB2YXIgZ2FpbiA9IEZpcmUubmF0aXZlQUMuY3JlYXRlR2FpbigpO1xuXG4gICAgICAgIC8vIGNvbm5lY3RcbiAgICAgICAgYnVmZmVyU291cmNlLmNvbm5lY3QoZ2Fpbik7XG4gICAgICAgIGdhaW4uY29ubmVjdChGaXJlLm5hdGl2ZUFDLmRlc3RpbmF0aW9uKTtcbiAgICAgICAgYnVmZmVyU291cmNlLmNvbm5lY3QoRmlyZS5uYXRpdmVBQy5kZXN0aW5hdGlvbik7XG5cbiAgICAgICAgLy8gaW5pdCBwYXJhbWV0ZXJzXG4gICAgICAgIGJ1ZmZlclNvdXJjZS5idWZmZXIgPSB0YXJnZXQuY2xpcC5yYXdEYXRhO1xuICAgICAgICBidWZmZXJTb3VyY2UubG9vcCA9IHRhcmdldC5sb29wO1xuICAgICAgICBidWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gdGFyZ2V0LnBsYXliYWNrUmF0ZTtcbiAgICAgICAgYnVmZmVyU291cmNlLm9uZW5kZWQgPSB0YXJnZXQub25QbGF5RW5kLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0Lm11dGUgPyAtMSA6ICh0YXJnZXQudm9sdW1lIC0gMSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlID0gYnVmZmVyU291cmNlO1xuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4gPSBnYWluO1xuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSA9IGF0IHx8IDA7XG4gICAgICAgIHRhcmdldC5fbGFzdFBsYXkgPSBGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIC8vIHBsYXlcbiAgICAgICAgYnVmZmVyU291cmNlLnN0YXJ0KCAwLCB0aGlzLmdldEN1cnJlbnRUaW1lKHRhcmdldCkgKTtcbiAgICB9O1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlciA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBMZW5ndGggPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmR1cmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXMgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEubnVtYmVyT2ZDaGFubmVscztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLnNhbXBsZVJhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cblxuICAgIEZpcmUuQXVkaW9Db250ZXh0ID0gQXVkaW9Db250ZXh0O1xufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuLy8g5Yqo55S75Ymq6L6RXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gRmlyZS5leHRlbmQoJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCcsIEZpcmUuQ3VzdG9tQXNzZXQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBudWxsOyAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm9cbn0pO1xuXG5GaXJlLmFkZEN1c3RvbUFzc2V0TWVudShTcHJpdGVBbmltYXRpb25DbGlwLCBcIkNyZWF0ZS9OZXcgU3ByaXRlIEFuaW1hdGlvblwiKTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5EZWZhdWx0ID0gMF0gPSAnRGVmYXVsdCc7XG4gICAgdFt0Lk9uY2UgPSAxXSA9ICdPbmNlJztcbiAgICB0W3QuTG9vcCA9IDJdID0gJ0xvb3AnO1xuICAgIHRbdC5QaW5nUG9uZyA9IDNdID0gJ1BpbmdQb25nJztcbiAgICB0W3QuQ2xhbXBGb3JldmVyID0gNF0gPSAnQ2xhbXBGb3JldmVyJztcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uID0gKGZ1bmN0aW9uICh0KSB7XG4gICAgdFt0LkRvTm90aGluZyA9IDBdID0gJ0RvTm90aGluZyc7ICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIHRbdC5EZWZhdWx0U3ByaXRlID0gMV0gPSAnRGVmYXVsdFNwcml0ZSc7IC8vIHNldCB0byBkZWZhdWx0IHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICB0W3QuSGlkZSA9IDJdID0gJ0hpZGUnOyAgICAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXG4gICAgdFt0LkRlc3Ryb3kgPSAzXSA9ICdEZXN0cm95JzsgICAgICAgICAgICAgLy8gZGVzdHJveSB0aGUgZW50aXR5IHRoZSBzcHJpdGUgYmVsb25ncyB0byB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLy8gVGhlIHN0cnVjdHVyZSB0byBkZXNjcmlwIGEgZnJhbWUgaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBGcmFtZUluZm8gPSBGaXJlLmRlZmluZSgnRnJhbWVJbmZvJylcbiAgICAgICAgICAgICAgICAgICAgLnByb3AoJ3Nwcml0ZScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpXG4gICAgICAgICAgICAgICAgICAgIC5wcm9wKCdmcmFtZXMnLCAwLCBGaXJlLkludGVnZXIpO1xuXG4vLy88IHRoZSBsaXN0IG9mIGZyYW1lIGluZm9cbi8vIHRvIGRvXG5cbi8vIGRlZmF1bHQgd3JhcCBtb2RlXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ3dyYXBNb2RlJywgU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5EZWZhdWx0LCBGaXJlLkVudW0oU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSkpO1xuXG4vLyB0aGUgZGVmYXVsdCB0eXBlIG9mIGFjdGlvbiB1c2VkIHdoZW4gdGhlIGFuaW1hdGlvbiBzdG9wcGVkXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ3N0b3BBY3Rpb24nLCBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nLCBGaXJlLkVudW0oU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uKSk7XG5cbi8vIHRoZSBkZWZhdWx0IHNwZWVkIG9mIHRoZSBhbmltYXRpb24gY2xpcFxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCdzcGVlZCcsIDEpO1xuXG4vLyB0aGUgc2FtcGxlIHJhdGUgdXNlZCBpbiB0aGlzIGFuaW1hdGlvbiBjbGlwXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ19mcmFtZVJhdGUnLCA2MCwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuU3ByaXRlQW5pbWF0aW9uQ2xpcC5nZXRzZXQoJ2ZyYW1lUmF0ZScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVSYXRlO1xuICAgIH0sXG4gICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZnJhbWVSYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9mcmFtZVJhdGUgPSBNYXRoLnJvdW5kKE1hdGgubWF4KHZhbHVlLCAxKSk7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ2ZyYW1lSW5mb3MnLCBbXSwgRmlyZS5PYmplY3RUeXBlKEZyYW1lSW5mbykpO1xuXG5cblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvdG90eXBlLmdldFRvdGFsRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmcmFtZXMgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVzO1xufTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm90b3R5cGUuZ2V0RnJhbWVJbmZvRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9mcmFtZUluZm9GcmFtZXMgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbmV3IEFycmF5KHRoaXMuZnJhbWVJbmZvcy5sZW5ndGgpO1xuICAgICAgICB2YXIgdG90YWxGcmFtZXMgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVJbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdG90YWxGcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcbiAgICAgICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1tpXSA9IHRvdGFsRnJhbWVzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9mcmFtZUluZm9GcmFtZXM7XG59O1xuXG5GaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvbkNsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ3Nwcml0ZS1hbmltYXRpb24tc3RhdGUnKTtcbi8vIHNwcml0ZS1hbmltYXRpb24tc3RhdGUuanNcblxudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcblxudmFyIFNwcml0ZUFuaW1hdGlvblN0YXRlID0gZnVuY3Rpb24gKGFuaW1DbGlwKSB7XG4gICAgaWYgKCFhbmltQ2xpcCkge1xuLy8gQGlmIERFVlxuICAgICAgICBGaXJlLmVycm9yKCdVbnNwZWNpZmllZCBzcHJpdGUgYW5pbWF0aW9uIGNsaXAnKTtcbi8vIEBlbmRpZlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHRoZSBuYW1lIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0YXRlXG4gICAgdGhpcy5uYW1lID0gYW5pbUNsaXAubmFtZTtcbiAgICAvLyB0aGUgcmVmZXJlbmNlZCBzcHJpdGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy5jbGlwID0gYW5pbUNsaXA7XG4gICAgLy8gdGhlIHdyYXAgbW9kZVxuICAgIHRoaXMud3JhcE1vZGUgPSBhbmltQ2xpcC53cmFwTW9kZTtcbiAgICAvLyB0aGUgc3RvcCBhY3Rpb25cbiAgICB0aGlzLnN0b3BBY3Rpb24gPSBhbmltQ2xpcC5zdG9wQWN0aW9uO1xuICAgIC8vIHRoZSBzcGVlZCB0byBwbGF5IHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICB0aGlzLnNwZWVkID0gYW5pbUNsaXAuc3BlZWQ7XG4gICAgLy8gdGhlIGFycmF5IG9mIHRoZSBlbmQgZnJhbWUgb2YgZWFjaCBmcmFtZSBpbmZvIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBhbmltQ2xpcC5nZXRGcmFtZUluZm9GcmFtZXMoKTtcbiAgICAvLyB0aGUgdG90YWwgZnJhbWUgY291bnQgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMudG90YWxGcmFtZXMgPSB0aGlzLl9mcmFtZUluZm9GcmFtZXMubGVuZ3RoID4gMCA/IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1t0aGlzLl9mcmFtZUluZm9GcmFtZXMubGVuZ3RoIC0gMV0gOiAwO1xuICAgIC8vIHRoZSBsZW5ndGggb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gaW4gc2Vjb25kcyB3aXRoIHNwZWVkID0gMS4wZlxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy50b3RhbEZyYW1lcyAvIGFuaW1DbGlwLmZyYW1lUmF0ZTtcbiAgICAvLyBUaGUgY3VycmVudCBpbmRleCBvZiBmcmFtZS4gVGhlIHZhbHVlIGNhbiBiZSBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcy5cbiAgICAvLyBJZiB0aGUgZnJhbWUgaXMgbGFyZ2VyIHRoYW4gdG90YWxGcmFtZXMgaXQgd2lsbCBiZSB3cmFwcGVkIGFjY29yZGluZyB0byB3cmFwTW9kZS4gXG4gICAgdGhpcy5mcmFtZSA9IC0xO1xuICAgIC8vIHRoZSBjdXJyZW50IHRpbWUgaW4gc2VvbmNkc1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgLy8gY2FjaGUgcmVzdWx0IG9mIEdldEN1cnJlbnRJbmRleFxuICAgIHRoaXMuX2NhY2hlZEluZGV4ID0gLTE7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdGhlIGN1cnJlbnQgZnJhbWUgaW5mbyBpbmRleC5cbiAqL1xuU3ByaXRlQW5pbWF0aW9uU3RhdGUucHJvdG90eXBlLmdldEN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50b3RhbEZyYW1lcyA+IDEpIHtcbiAgICAgICAgLy9pbnQgb2xkRnJhbWUgPSBmcmFtZTtcbiAgICAgICAgdGhpcy5mcmFtZSA9IE1hdGguZmxvb3IodGhpcy50aW1lICogdGhpcy5jbGlwLmZyYW1lUmF0ZSk7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IC10aGlzLmZyYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdyYXBwZWRJbmRleDtcbiAgICAgICAgaWYgKHRoaXMud3JhcE1vZGUgIT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuUGluZ1BvbmcpIHtcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IF93cmFwKHRoaXMuZnJhbWUsIHRoaXMudG90YWxGcmFtZXMgLSAxLCB0aGlzLndyYXBNb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMuZnJhbWU7XG4gICAgICAgICAgICB2YXIgY250ID0gTWF0aC5mbG9vcih3cmFwcGVkSW5kZXggLyB0aGlzLnRvdGFsRnJhbWVzKTtcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCAlPSB0aGlzLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgaWYgKChjbnQgJiAweDEpID09PSAxKSB7XG4gICAgICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gdGhpcy50b3RhbEZyYW1lcyAtIDEgLSB3cmFwcGVkSW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0cnkgdG8gdXNlIGNhY2hlZCBmcmFtZSBpbmZvIGluZGV4XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWRJbmRleCAtIDEgPj0gMCAmJlxuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID49IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1t0aGlzLl9jYWNoZWRJbmRleCAtIDFdICYmXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPCB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fY2FjaGVkSW5kZXhdKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZWFyY2ggZnJhbWUgaW5mb1xuICAgICAgICB2YXIgZnJhbWVJbmZvSW5kZXggPSBfYmluYXJ5U2VhcmNoKHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcywgd3JhcHBlZEluZGV4ICsgMSk7XG4gICAgICAgIGlmIChmcmFtZUluZm9JbmRleCA8IDApIHtcbiAgICAgICAgICAgIGZyYW1lSW5mb0luZGV4ID0gfmZyYW1lSW5mb0luZGV4O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhY2hlZEluZGV4ID0gZnJhbWVJbmZvSW5kZXg7XG4gICAgICAgIHJldHVybiBmcmFtZUluZm9JbmRleDtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy50b3RhbEZyYW1lcyA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gXG4vLy8gQyMgQXJyYXkuQmluYXJ5U2VhcmNoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gXG5mdW5jdGlvbiBfYmluYXJ5U2VhcmNoIChhcnJheSwgdmFsdWUpIHtcbiAgICB2YXIgbCA9IDAsIGggPSBhcnJheS5sZW5ndGggLSAxO1xuICAgIHdoaWxlIChsIDw9IGgpIHtcbiAgICAgICAgdmFyIG0gPSAoKGwgKyBoKSA+PiAxKTtcbiAgICAgICAgaWYgKGFycmF5W21dID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFycmF5W21dID4gdmFsdWUpIHtcbiAgICAgICAgICAgIGggPSBtIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBtICsgMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gfmw7XG59XG5cbmZ1bmN0aW9uIF93cmFwIChfdmFsdWUsIF9tYXhWYWx1ZSwgX3dyYXBNb2RlKSB7XG4gICAgaWYgKF9tYXhWYWx1ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKF92YWx1ZSA8IDApIHtcbiAgICAgICAgX3ZhbHVlID0gLV92YWx1ZTtcbiAgICB9XG4gICAgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5Mb29wKSB7XG4gICAgICAgIHJldHVybiBfdmFsdWUgJSAoX21heFZhbHVlICsgMSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5QaW5nUG9uZykge1xuICAgICAgICB2YXIgY250ID0gTWF0aC5mbG9vcihfdmFsdWUgLyBfbWF4VmFsdWUpO1xuICAgICAgICBfdmFsdWUgJT0gX21heFZhbHVlO1xuICAgICAgICBpZiAoY250ICUgMiA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIF9tYXhWYWx1ZSAtIF92YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKF92YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfdmFsdWUgPiBfbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF92YWx1ZTtcbn1cblxuRmlyZS5TcHJpdGVBbmltYXRpb25TdGF0ZSA9IFNwcml0ZUFuaW1hdGlvblN0YXRlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvblN0YXRlO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLmpzXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG52YXIgU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG5cbi8vIOWumuS5ieS4gOS4quWQjeWPq1Nwcml0ZSBBbmltYXRpb24g57uE5Lu2XG52YXIgU3ByaXRlQW5pbWF0aW9uID0gRmlyZS5leHRlbmQoJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uJywgRmlyZS5Db21wb25lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IG51bGw7XG4gICAgdGhpcy5fZGVmYXVsdFNwcml0ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdEZyYW1lSW5kZXggPSAtMTtcbiAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xuICAgIHRoaXMuX3BsYXlTdGFydEZyYW1lID0gMDsvLyDlnKjosIPnlKhQbGF555qE5b2T5bin55qETGF0ZVVwZGF0ZeS4jei/m+ihjHN0ZXBcbn0pO1xuXG5GaXJlLmFkZENvbXBvbmVudE1lbnUoU3ByaXRlQW5pbWF0aW9uLCAnU3ByaXRlIEFuaW1hdGlvbicpO1xuXG5TcHJpdGVBbmltYXRpb24ucHJvcCgnZGVmYXVsdEFuaW1hdGlvbicsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShTcHJpdGVBbmltYXRpb25DbGlwKSk7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm9wKCdhbmltYXRpb25zJywgW10sIEZpcmUuT2JqZWN0VHlwZShTcHJpdGVBbmltYXRpb25DbGlwKSk7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm9wKCdfcGxheUF1dG9tYXRpY2FsbHknLCB0cnVlLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG5TcHJpdGVBbmltYXRpb24uZ2V0c2V0KCdwbGF5QXV0b21hdGljYWxseScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxheUF1dG9tYXRpY2FsbHk7XG4gICAgfSxcbiAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcGxheUF1dG9tYXRpY2FsbHkgPSB2YWx1ZTtcbiAgICB9XG4pO1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGluaXRpYWxpemVkID0gKHRoaXMuX25hbWVUb1N0YXRlICE9PSBudWxsKTtcbiAgICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlO1xuXG4gICAgICAgIHRoaXMuX25hbWVUb1N0YXRlID0ge307XG4gICAgICAgIHZhciBzdGF0ZSA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltYXRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgY2xpcCA9IHRoaXMuYW5pbWF0aW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChjbGlwICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUoY2xpcCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5nZXRBbmltU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uLm5hbWUpKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24pO1xuICAgICAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuZ2V0QW5pbVN0YXRlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZVRvU3RhdGUgJiYgdGhpcy5fbmFtZVRvU3RhdGVbbmFtZV07XG59O1xuXG4vKipcbiAqIGluZGljYXRlcyB3aGV0aGVyIHRoZSBhbmltYXRpb24gaXMgcGxheWluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFthbmltTmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXG4gKi9cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuaXNQbGF5aW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgcGxheWluZ0FuaW0gPSB0aGlzLmVuYWJsZWQgJiYgdGhpcy5fY3VyQW5pbWF0aW9uO1xuICAgIHJldHVybiAhIXBsYXlpbmdBbmltICYmICggIW5hbWUgfHwgcGxheWluZ0FuaW0ubmFtZSA9PT0gbmFtZSApO1xufTtcblxuLyoqXG4gKiBwbGF5IEFuaW1hdGlvblxuICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgYW5pbVN0YXRlIG9mIHRoZSBTcHJpdGVBbmltYXRpb25TdGF0ZVxuICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgdGltZSBvZiB0aGUgYW5pbWF0aW9uIHRpbWVcbiAqL1xuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKGFuaW1TdGF0ZSwgdGltZSkge1xuICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IGFuaW1TdGF0ZSB8fCBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gdGltZSB8fCAwO1xuICAgICAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IEZpcmUuVGltZS5mcmFtZUNvdW50O1xuICAgICAgICB0aGlzLnNhbXBsZSgpO1xuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ICYmIHRoaXMuZGVmYXVsdEFuaW1hdGlvbikge1xuICAgICAgICAgICAgdmFyIGFuaW1TdGF0ZSA9IHRoaXMuZ2V0QW5pbVN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbi5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMucGxheShhbmltU3RhdGUsIDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5sYXRlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwgJiYgRmlyZS5UaW1lLmZyYW1lQ291bnQgPiB0aGlzLl9wbGF5U3RhcnRGcmFtZSkge1xuICAgICAgICB2YXIgZGVsdGEgPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICB0aGlzLnN0ZXAoZGVsdGEpO1xuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uIChkZWx0YVRpbWUpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lICs9IGRlbHRhVGltZTtcbiAgICAgICAgdGhpcy5zYW1wbGUoKTtcbiAgICAgICAgdmFyIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5PbmNlIHx8XG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdCB8fFxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA+IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID49IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSAvIHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lUmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkIDwgMCAmJiB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkbyBzdG9wXG4gICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AodGhpcy5fY3VyQW5pbWF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnNhbXBsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX2N1ckFuaW1hdGlvbi5nZXRDdXJyZW50SW5kZXgoKTtcbiAgICAgICAgaWYgKG5ld0luZGV4ID49IDAgJiYgbmV3SW5kZXggIT0gdGhpcy5fY3VySW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLnNwcml0ZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lSW5mb3NbbmV3SW5kZXhdLnNwcml0ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IG5ld0luZGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoYW5pbVN0YXRlKSB7XG4gICAgaWYgKGFuaW1TdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoYW5pbVN0YXRlID09PSB0aGlzLl9jdXJBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYW5pbVN0YXRlLnRpbWUgPSAwO1xuXG4gICAgICAgIHZhciBzdG9wQWN0aW9uID0gYW5pbVN0YXRlLnN0b3BBY3Rpb247XG4gICAgICAgIHN3aXRjaCAoc3RvcEFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRGVmYXVsdFNwcml0ZTpcbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9kZWZhdWx0U3ByaXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uSGlkZTpcbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZXN0cm95OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xuICAgIH1cbn07XG5cbkZpcmUuU3ByaXRlQW5pbWF0aW9uID0gU3ByaXRlQW5pbWF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvbjtcblxuRmlyZS5fUkZwb3AoKTsiXX0=
