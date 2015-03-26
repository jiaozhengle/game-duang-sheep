require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AudioControl":[function(require,module,exports){
Fire._RFpush(module, 'd805blHUexOeYSA/4tyex0D', 'AudioControl');
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
Fire._RFpush(module, 'fef90zm9r1OOKvWTmCLwRPF', 'Collision');
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
Fire._RFpush(module, '729abaeVJZKAJM/docYGMh4', 'Effect');
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
Fire._RFpush(module, 'b5c7aJTDwZCdI9cvuJShJKB', 'Floor');
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
Fire._RFpush(module, '3f0baj6BXpH2qXiN0dB8Ljf', 'GameOverWindow');
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
Fire._RFpush(module, 'fc9913XADNLgJ1ByKhqcC5Z', 'Game');
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
Fire._RFpush(module, '3deb9n4Oe9OuJOziDW9qVVj', 'MainMenu');
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
Fire._RFpush(module, '004cc2gjpNJOJ2QWx8hv59q', 'PipeGroup');
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
Fire._RFpush(module, '06633wKqTVM6a1K+G262q1Q', 'Sheep');
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

    AudioClip.prop('rawData', null, Fire.RawType('audio'), Fire.HideInInspector);

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
                    '" seems to be unreachable or the file is empty. InnerMessage: ' + e + '\n This may caused by fireball-x/dev#267', null);
        }, false);

        audio.src = url;
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
        Fire.error("Audio does not contain the <Buffer> attribute!");
        return null;
    };

    // 以秒为单位 获取音频剪辑的 长度
    AudioContext.getClipLength = function (clip) {
        return clip.rawData.duration;
    };

    // 音频剪辑的长度
    AudioContext.getClipSamples = function (target) {
        Fire.error("Audio does not contain the <Samples> attribute!");
        return null;
    };

    // 音频剪辑的声道数
    AudioContext.getClipChannels = function (target) {
        Fire.error("Audio does not contain the <Channels> attribute!");
        return null;
    };

    // 音频剪辑的采样频率
    AudioContext.getClipFrequency = function (target) {
        Fire.error("Audio does not contain the <Frequency> attribute!");
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
        target._buffSource.stop(0);
    };

    //
    AudioContext.stop = function ( target, ended ) {
        if (!target._buffSource) { return; }

        if ( !ended ) {
            target._buffSource.onended = null;
        }
        target._buffSource.stop(0);
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

Fire.addCustomAssetMenu(SpriteAnimationClip, "New Sprite Animation");

SpriteAnimationClip.WrapMode = Fire.defineEnum({
    Default: -1,
    Once: -1,
    Loop: -1,
    PingPong: -1,
    ClampForever: -1
});

SpriteAnimationClip.StopAction = Fire.defineEnum({
    DoNothing: -1,    // do nothing
    DefaultSprite: 1, // set to default sprite when the sprite animation stopped
    Hide: -1,         // hide the sprite when the sprite animation stopped
    Destroy: -1       // destroy the entity the sprite belongs to when the sprite animation stopped
});

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
 * @param {SpriteAnimationState} [animState|animName] - The animState of the SpriteAnimationState
 * @param {SpriteAnimationState} [animState] - The time of the animation time
 */
SpriteAnimation.prototype.play = function (animState, time) {
    if (typeof animState === 'string') {
        this._curAnimation = this.getAnimState(animState);
    }
    else {
        this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
    }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvQXVkaW9Db250cm9sLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9Db2xsaXNpb24uanMiLCIuLi8uLi8uLi9kZXYvc2NyaXB0L0VmZmVjdC5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvRmxvb3IuanMiLCIuLi8uLi8uLi9kZXYvc2NyaXB0L0dhbWVPdmVyV2luZG93LmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9HYW1lLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9NYWluTWVudS5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvUGlwZUdyb3VwLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9TaGVlcC5qcyIsIi4uLy4uLy4uL2Rldi9zcmMvYXVkaW8tY2xpcC5qcyIsIi4uLy4uLy4uL2Rldi9zcmMvYXVkaW8tbGVnYWN5LmpzIiwiLi4vLi4vLi4vZGV2L3NyYy9hdWRpby1zb3VyY2UuanMiLCIuLi8uLi8uLi9kZXYvc3JjL2F1ZGlvLXdlYi1hdWRpby5qcyIsIi4uLy4uLy4uL2Rldi9zcHJpdGUtYW5pbWF0aW9uLWNsaXAuanMiLCIuLi8uLi8uLi9kZXYvc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsIi4uLy4uLy4uL2Rldi9zcHJpdGUtYW5pbWF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2Q4MDVibEhVZXhPZVlTQS80dHlleDBEJywgJ0F1ZGlvQ29udHJvbCcpO1xuLy8gc2NyaXB0L0F1ZGlvQ29udHJvbC5qc1xuXG4vLyBBdWRpb0NvbnRyb2xcbnZhciBBdWRpb0NvbnRyb2wgPSB7fTtcblxuQXVkaW9Db250cm9sLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8tLSDpn7PmlYgg77yI5pKe5Yiw77yJ77yI5b6X5YiG77yJKOWksei0pSlcbiAgICB0aGlzLmhpdEF1aWRvID0gRmlyZS5FbnRpdHkuZmluZCgnL0F1ZGlvL3NmeF9oaXQnKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5wb2ludEF1aWRvID0gRmlyZS5FbnRpdHkuZmluZCgnL0F1ZGlvL3NmeF9wb2ludCcpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbiAgICB0aGlzLmdhbWVBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9HYW1lcGxheV9Mb29wXzAzJykuZ2V0Q29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuICAgIHRoaXMuZ2FtZU92ZXJBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9HYW1lT3ZlcicpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbiAgICB0aGlzLmp1bXBBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9UYWdfQmxhY2snKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5yZWFkeUF1aWRvID0gRmlyZS5FbnRpdHkuZmluZCgnL0F1ZGlvL1N0YXJ0X0Fubm91bmNlJykuZ2V0Q29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xufTtcblxuQXVkaW9Db250cm9sLnBsYXlSZWFkeUdhbWVCZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlYWR5QXVpZG8ucGxheSgpO1xuICAgIHRoaXMucmVhZHlBdWlkby5vbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIEdhbWUgPSByZXF1aXJlKCdHYW1lJyk7XG4gICAgICAgIGlmKEdhbWUuaW5zdGFuY2UuZ2FtZVN0YXRlID09PSBHYW1lLkdhbWVTdGF0ZS5vdmVyKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhbWVBdWlkby5sb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nYW1lQXVpZG8ucGxheSgpO1xuICAgIH0uYmluZCh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXVkaW9Db250cm9sO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmZWY5MHptOXIxT09LdldUbUNMd1JQRicsICdDb2xsaXNpb24nKTtcbi8vIHNjcmlwdC9Db2xsaXNpb24uanNcblxudmFyIENvbGxpc2lvbiA9IHtcbiAgICAvLy0tIOajgOa1i+eisOaSnlxuICAgIGNvbGxpc2lvbkRldGVjdGlvbjogZnVuY3Rpb24gKHNoZWVwLCBwaXBlR3JvdXBMaXN0KSB7XG4gICAgICAgIGlmIChwaXBlR3JvdXBMaXN0ICYmIHBpcGVHcm91cExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBpcGVHcm91cExpc3QubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcblxuICAgICAgICAgICAgICAgIC8vLS0g57u1576K55qE5Zub5Liq6Z2i55qE5Z2Q5qCHXG4gICAgICAgICAgICAgICAgdmFyIHNoZWVwVG9wID0gKHNoZWVwLnRyYW5zZm9ybS55ICsgc2hlZXAuc2hlZXBTcHJpdFJlbmRlci5oZWlnaHQgLyAyICk7XG4gICAgICAgICAgICAgICAgdmFyIHNoZWVwQm90dG9tID0gKHNoZWVwLnRyYW5zZm9ybS55IC0gc2hlZXAuc2hlZXBTcHJpdFJlbmRlci5oZWlnaHQgLyAyICk7XG4gICAgICAgICAgICAgICAgdmFyIHNoZWVwTGVmdCA9IChzaGVlcC50cmFuc2Zvcm0ueCAtIHNoZWVwLnNoZWVwU3ByaXRSZW5kZXIud2lkdGggLyAyICk7XG4gICAgICAgICAgICAgICAgdmFyIHNoZWVwUmlnaHQgPSAoc2hlZXAudHJhbnNmb3JtLnggKyBzaGVlcC5zaGVlcFNwcml0UmVuZGVyLndpZHRoIC8gMiApO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBpcGVHcm91cEVudGl0eSA9IHBpcGVHcm91cExpc3RbaV07XG4gICAgICAgICAgICAgICAgdmFyIGJvdHRvbVBpcGUgPSBwaXBlR3JvdXBFbnRpdHkuZmluZCgnYm90dG9tUGlwZScpO1xuICAgICAgICAgICAgICAgIHZhciB0b3BQaXBlID0gcGlwZUdyb3VwRW50aXR5LmZpbmQoJ3RvcFBpcGUnKTtcblxuICAgICAgICAgICAgICAgIHZhciBwaXBlUmVuZGVyLCBwaXBlVG9wLCBwaXBlQm90dG9tLCBwaXBlTGVmdCwgcGlwZVJpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChib3R0b21QaXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVSZW5kZXIgPSBib3R0b21QaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZVRvcCA9IGJvdHRvbVBpcGUudHJhbnNmb3JtLnkgKyAocGlwZVJlbmRlci5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUxlZnQgPSBwaXBlR3JvdXBFbnRpdHkudHJhbnNmb3JtLnggLSAocGlwZVJlbmRlci53aWR0aCAvIDIgLSAzMCk7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVSaWdodCA9IHBpcGVHcm91cEVudGl0eS50cmFuc2Zvcm0ueCArIChwaXBlUmVuZGVyLndpZHRoIC8gMiAtIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoZWVwQm90dG9tIDwgcGlwZVRvcCAmJiAoKHNoZWVwTGVmdCA8IHBpcGVSaWdodCAmJiBzaGVlcFJpZ2h0ID4gcGlwZVJpZ2h0KSB8fCAoc2hlZXBSaWdodCA+IHBpcGVMZWZ0ICYmIHNoZWVwUmlnaHQgPCBwaXBlUmlnaHQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRvcFBpcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGlwZVJlbmRlciA9IHRvcFBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlQm90dG9tID0gdG9wUGlwZS50cmFuc2Zvcm0ueSAtIChwaXBlUmVuZGVyLmhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlTGVmdCA9IHBpcGVHcm91cEVudGl0eS50cmFuc2Zvcm0ueCAtIChwaXBlUmVuZGVyLndpZHRoIC8gMiAtIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZVJpZ2h0ID0gcGlwZUdyb3VwRW50aXR5LnRyYW5zZm9ybS54ICsgKHBpcGVSZW5kZXIud2lkdGggLyAyIC0gMzApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hlZXBUb3AgPiBwaXBlQm90dG9tICYmICgoc2hlZXBMZWZ0IDwgcGlwZVJpZ2h0ICYmIHNoZWVwUmlnaHQgPiBwaXBlUmlnaHQpIHx8IChzaGVlcFJpZ2h0ID4gcGlwZUxlZnQgJiYgc2hlZXBSaWdodCA8IHBpcGVSaWdodCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbjtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNzI5YWJhZVZKWktBSk0vZG9jWUdNaDQnLCAnRWZmZWN0Jyk7XG4vLyBzY3JpcHQvRWZmZWN0LmpzXG5cbi8vIEVmZmVjdFxudmFyIEVmZmVjdCA9IHtcbiAgICB0b1lQb3MgICAgICAgIDogRmlyZS5WZWMyLnplcm8sXG4gICAgbWFudWFsbHkgICAgICA6IGZhbHNlLFxuICAgIHRlbXBEaXNhcHBlYXIgOiBudWxsLFxuICAgIG1hbnVhbGx5RWZmZWN0OiBudWxsXG59O1xuXG5FZmZlY3QuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnRlbXBEaXNhcHBlYXIgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9kaXNhcHBlYXInKTtcbn07XG5cbkVmZmVjdC5jcmVhdGUgPSBmdW5jdGlvbiAodGVtcEVudGl0eSwgcG9zKSB7XG4gICAgdmFyIGVmZmVjdCA9IEZpcmUuaW5zdGFudGlhdGUodGVtcEVudGl0eSk7XG4gICAgZWZmZWN0LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICB2YXIgZWZmZWN0QW5pbSA9IGVmZmVjdC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVBbmltYXRpb24pO1xuICAgIGVmZmVjdEFuaW0ucGxheSgpO1xufTtcblxuRWZmZWN0LmNyZWF0ZU1hbnVhbGx5RWZmZWN0VXBNb3ZlID0gZnVuY3Rpb24gKHRlbXBFbnRpdHksIHBvcywgdG9VcFBvcykge1xuICAgIHRoaXMubWFudWFsbHlFZmZlY3QgPSBGaXJlLmluc3RhbnRpYXRlKHRlbXBFbnRpdHkpO1xuICAgIHRoaXMubWFudWFsbHlFZmZlY3QudHJhbnNmb3JtLnBvc2l0aW9uID0gcG9zO1xuICAgIHRoaXMubWFudWFsbHkgPSB0cnVlO1xuICAgIHRoaXMudG9ZUG9zID0gdGhpcy5tYW51YWxseUVmZmVjdC50cmFuc2Zvcm0ucG9zaXRpb24ueSArIHRvVXBQb3M7XG59O1xuXG5FZmZlY3Qub25SZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm1hbnVhbGx5KSB7XG4gICAgICAgIHRoaXMubWFudWFsbHlFZmZlY3QudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDIwMDtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsbHlFZmZlY3QudHJhbnNmb3JtLnkgPiB0aGlzLnRvWVBvcykge1xuICAgICAgICAgICAgdmFyIGRpc2FwcGVhciA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wRGlzYXBwZWFyKTtcbiAgICAgICAgICAgIHZhciBkaXNhcHBlYXJBbmltID0gZGlzYXBwZWFyLmdldENvbXBvbmVudChGaXJlLlNwcml0ZUFuaW1hdGlvbik7XG4gICAgICAgICAgICBkaXNhcHBlYXIudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy5tYW51YWxseUVmZmVjdC50cmFuc2Zvcm0ucG9zaXRpb247XG4gICAgICAgICAgICBkaXNhcHBlYXJBbmltLnBsYXkoKTtcblxuICAgICAgICAgICAgdGhpcy5tYW51YWxseUVmZmVjdC5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLm1hbnVhbGx5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1hbnVhbGx5RWZmZWN0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudG9ZUG9zID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWZmZWN0O1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdiNWM3YUpURHdaQ2RJOWN2dUpTaEpLQicsICdGbG9vcicpO1xuLy8gc2NyaXB0L0Zsb29yLmpzXG5cbnZhciBGbG9vciA9IEZpcmUuZXh0ZW5kKEZpcmUuQ29tcG9uZW50KTtcbi8vc3BlZWRcbkZsb29yLnByb3AoJ3NwZWVkJywgMzAwKTtcblxuRmxvb3IucHJvcCgneCcsIC04NTgpO1xuXG5GbG9vci5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKGdhbWVTcGVlZCkge1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS54IC09IChGaXJlLlRpbWUuZGVsdGFUaW1lICogKCB0aGlzLnNwZWVkICsgZ2FtZVNwZWVkICkpO1xuICAgIGlmICh0aGlzLmVudGl0eS50cmFuc2Zvcm0ueCA8IHRoaXMueCkge1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueCA9IDA7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vcjtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnM2YwYmFqNkJYcEgycVhpTjBkQjhMamYnLCAnR2FtZU92ZXJXaW5kb3cnKTtcbi8vIHNjcmlwdC9HYW1lT3ZlcldpbmRvdy5qc1xuXG52YXIgR2FtZU92ZXJXaW5kb3cgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3RpdGxlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3BhbmVsJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ2J0bl9wbGF5JywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3Njb3JlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3RvdHlwZS5vblJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEdhbWUgPSByZXF1aXJlKCdHYW1lJyk7XG4gICAgdmFyIHNjb3JlVmFsdWUgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xuICAgIHNjb3JlVmFsdWUudGV4dCA9IEdhbWUuaW5zdGFuY2UuZnJhY3Rpb247XG4gICAgdGhpcy5idG5fcGxheS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2NvcmVWYWx1ZS50ZXh0ID0gXCIwXCI7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBHYW1lLmluc3RhbmNlLm1hc2suYWN0aXZlID0gdHJ1ZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMudGl0bGUudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAyNTApO1xuICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAtMjAwKTtcbn07XG5cbkdhbWVPdmVyV2luZG93LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUudHJhbnNmb3JtLnkgPiAxMDApIHtcbiAgICAgICAgdGhpcy50aXRsZS50cmFuc2Zvcm0ueSAtPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogNjAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZS50cmFuc2Zvcm0ueSA9IDEwMDtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFuZWwudHJhbnNmb3JtLnkgPCAwKSB7XG4gICAgICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDYwMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnkgPSAwO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU92ZXJXaW5kb3c7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2ZjOTkxM1hBRE5MZ0oxQnlLaHFjQzVaJywgJ0dhbWUnKTtcbi8vIHNjcmlwdC9HYW1lLmpzXG5cbnZhciBTaGVlcCA9IHJlcXVpcmUoJ1NoZWVwJyk7XG52YXIgRmxvb3IgPSByZXF1aXJlKCdGbG9vcicpO1xudmFyIENvbGxpc2lvbiA9IHJlcXVpcmUoJ0NvbGxpc2lvbicpO1xudmFyIEdhbWVPdmVyV2luZG93ID0gcmVxdWlyZSgnR2FtZU92ZXJXaW5kb3cnKTtcbnZhciBBdWRpb0NvbnRyb2wgPSByZXF1aXJlKCdBdWRpb0NvbnRyb2wnKTtcbnZhciBFZmZlY3QgPSByZXF1aXJlKCdFZmZlY3QnKTtcblxudmFyIEdhbWVTdGF0ZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5yZWFkeSA9IDBdID0gJ3JlYWR5JztcbiAgICB0W3QucnVuID0gMV0gPSAncnVuJztcbiAgICB0W3Qub3ZlciA9IDJdID0gJ292ZXInO1xuICAgIHJldHVybiB0O1xufSkoe30pO1xuXG52YXIgR2FtZSA9IEZpcmUuZXh0ZW5kKEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgR2FtZS5pbnN0YW5jZSA9IHRoaXM7XG59KTtcblxuR2FtZS5HYW1lU3RhdGUgPSBHYW1lU3RhdGU7XG5cbkdhbWUuaW5zdGFuY2UgPSBudWxsO1xuXG4vLy0tIOe7tee+iuWIneWni1jlnZDmoIdcbkdhbWUucHJvcCgnaW5pdFNoZWVwUG9zJywgbmV3IEZpcmUuVmVjMigtMTUwLCAtMTgwKSwgRmlyZS5PYmplY3RUeXBlKEZpcmUuVmVjMikpO1xuXG4vLy0tIOWIm+W7uuaXtueuoemBk+WIneWni1jlnZDmoIdcbkdhbWUucHJvcCgnaW5pdFBpcGVHcm91cFBvcycsIG5ldyBGaXJlLlZlYzIoNjAwLCAwKSwgRmlyZS5PYmplY3RUeXBlKEZpcmUuVmVjMikpO1xuXG5HYW1lLnByb3AoJ2NyZWF0ZVBpcGVUaW1lJywgNSk7XG5cbkdhbWUucHJvcCgnZ2FtZVNwZWVkJywgMCk7XG5cbkdhbWUucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuZm9nSnVtcEVmZmVjdCA9IEZpcmUuRW50aXR5LmZpbmQoJy9QcmVmYWJzL2ZvZ18xJyk7XG4gICAgdGhpcy50ZW1wQWRkRnJhY3Rpb25FZmYgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9hZGRGcmFjdGlvbicpO1xuICAgIHRoaXMudGVtcE1hc2sgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9tYXNrJyk7XG5cbiAgICB0aGlzLnBpcGVHcm91cCA9IEZpcmUuRW50aXR5LmZpbmQoJy9HYW1lL1BpcGVHcm91cCcpO1xuXG4gICAgLy8tLSDmuLjmiI/nirbmgIFcbiAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5ydW47XG5cbiAgICB0aGlzLmdhbWVPdmVyV2luZG93ID0gRmlyZS5FbnRpdHkuZmluZCgnL0dhbWVPdmVyV2luZG93Jyk7XG5cbiAgICB0aGlzLmJnID0gRmlyZS5FbnRpdHkuZmluZCgnL2JnJykuZ2V0Q29tcG9uZW50KEZsb29yKTtcbiAgICB0aGlzLmZsb29yID0gRmlyZS5FbnRpdHkuZmluZCgnL2Zsb29yJykuZ2V0Q29tcG9uZW50KEZsb29yKTtcbiAgICB0aGlzLnNoZWVwID0gRmlyZS5FbnRpdHkuZmluZCgnL3NoZWVwJykuZ2V0Q29tcG9uZW50KFNoZWVwKTtcblxuICAgIHRoaXMubWFzayA9IEZpcmUuRW50aXR5LmZpbmQoJy9tYXNrJyk7XG4gICAgaWYgKCF0aGlzLm1hc2spIHtcbiAgICAgICAgdGhpcy5tYXNrID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnRlbXBNYXNrKTtcbiAgICAgICAgdGhpcy5tYXNrLm5hbWUgPSAnbWFzayc7XG4gICAgICAgIHRoaXMubWFzay5kb250RGVzdHJveU9uTG9hZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMubWFza1JlbmRlciA9IHRoaXMubWFzay5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG5cblxuICAgIEZpcmUuSW5wdXQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5vdmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIFNoZWVwID0gcmVxdWlyZSgnU2hlZXAnKTtcbiAgICAgICAgdGhpcy5zaGVlcC5hbmltLnBsYXkodGhpcy5zaGVlcC5qdW1wQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgdGhpcy5zaGVlcC5zaGVlcFN0YXRlID0gU2hlZXAuU2hlZXBTdGF0ZS5qdW1wO1xuICAgICAgICB0aGlzLnNoZWVwLnRlbXBTcGVlZCA9IHRoaXMuc2hlZXAuc3BlZWQ7XG4gICAgICAgIEF1ZGlvQ29udHJvbC5qdW1wQXVpZG8uc3RvcCgpO1xuICAgICAgICBBdWRpb0NvbnRyb2wuanVtcEF1aWRvLnBsYXkoKTtcblxuICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy5zaGVlcC50cmFuc2Zvcm0ueCAtIDgwLCB0aGlzLnNoZWVwLnRyYW5zZm9ybS55ICsgMTApO1xuICAgICAgICBFZmZlY3QuY3JlYXRlKHRoaXMuZm9nSnVtcEVmZmVjdCwgcG9zKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5sYXN0VGltZSA9IDEwO1xuICAgIHRoaXMucGlwZUdyb3VwTGlzdCA9IFtdO1xuICAgIHRoaXMuZW50aXR5Lm9uKFwiZGVzdHJveS1QaXBlR3JvdXBcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnBpcGVHcm91cExpc3QpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMucGlwZUdyb3VwTGlzdC5pbmRleE9mKGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnBpcGVHcm91cExpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLy0tIOWIhuaVsFxuICAgIHRoaXMuZnJhY3Rpb24gPSAwO1xuICAgIHRoaXMuZnJhY3Rpb25CdG1wRm9udCA9IEZpcmUuRW50aXR5LmZpbmQoJy9mcmFjdGlvbicpLmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xuXG4gICAgLy8tLSDpn7PmlYhcbiAgICBBdWRpb0NvbnRyb2wuaW5pdCgpO1xuXG4gICAgLy8tLSDnibnmlYhcbiAgICBFZmZlY3QuaW5pdCgpO1xufTtcblxuR2FtZS5wcm90b3R5cGUub25TdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWVPdmVyV2luZG93LmVuYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmZyYWN0aW9uID0gMDtcbiAgICB0aGlzLmZyYWN0aW9uQnRtcEZvbnQudGV4dCA9IHRoaXMuZnJhY3Rpb247XG4gICAgdGhpcy5sYXN0VGltZSA9IEZpcmUuVGltZS50aW1lICsgMTA7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucGlwZUdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICBpZiAoIXBpcGVHcm91cEVudGl0eSB8fCBwaXBlR3JvdXBFbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcGlwZUdyb3VwRW50aXR5LmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5waXBlR3JvdXBMaXN0ID0gW107XG4gICAgdGhpcy5zaGVlcC5pbml0KHRoaXMuaW5pdFNoZWVwUG9zKTtcbiAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5yZWFkeTtcbiAgICBBdWRpb0NvbnRyb2wuZ2FtZU92ZXJBdWlkby5zdG9wKCk7XG4gICAgQXVkaW9Db250cm9sLmhpdEF1aWRvLnN0b3AoKTtcbn07XG5cbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vLS0g57u1576K55qE5pu05pawXG4gICAgLy8tLSDnu7XnvornmoTmm7TmlrBcbiAgICB0aGlzLnNoZWVwLm9uUmVmcmVzaCgpO1xuXG4gICAgc3dpdGNoICh0aGlzLmdhbWVTdGF0ZSkge1xuICAgICAgICBjYXNlIEdhbWVTdGF0ZS5yZWFkeTpcbiAgICAgICAgICAgIGlmICh0aGlzLm1hc2suYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgLT0gRmlyZS5UaW1lLmRlbHRhVGltZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPCAwLjMpIHtcbiAgICAgICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLnBsYXlSZWFkeUdhbWVCZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLnJ1bjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHYW1lU3RhdGUucnVuOlxuICAgICAgICAgICAgdmFyIGdhbWVPdmVyID0gQ29sbGlzaW9uLmNvbGxpc2lvbkRldGVjdGlvbih0aGlzLnNoZWVwLCB0aGlzLnBpcGVHcm91cExpc3QpO1xuICAgICAgICAgICAgaWYgKGdhbWVPdmVyKSB7XG4gICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLmdhbWVBdWlkby5zdG9wKCk7XG4gICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLmdhbWVPdmVyQXVpZG8ucGxheSgpO1xuICAgICAgICAgICAgICAgIEF1ZGlvQ29udHJvbC5oaXRBdWlkby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVlcC5hbmltLnBsYXkodGhpcy5zaGVlcC5kaWVBbmltU3RhdGUsIDApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hlZXAuc2hlZXBTdGF0ZSA9IFNoZWVwLlNoZWVwU3RhdGUuZGllO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLm92ZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcldpbmRvdy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJXaW5kb3cuZ2V0Q29tcG9uZW50KEdhbWVPdmVyV2luZG93KS5vblJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLy0tIOavj+i/h+S4gOauteaXtumXtOWIm+W7uueuoemBk1xuICAgICAgICAgICAgdmFyIGN1clRpbWUgPSBNYXRoLmFicyhGaXJlLlRpbWUudGltZSAtIHRoaXMubGFzdFRpbWUpO1xuICAgICAgICAgICAgaWYgKGN1clRpbWUgPj0gdGhpcy5jcmVhdGVQaXBlVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRpbWUgPSBGaXJlLlRpbWUudGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVBpcGVHcm91cCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8tLSDog4zmma/liLfmlrBcbiAgICAgICAgICAgIHRoaXMuYmcub25SZWZyZXNoKHRoaXMuZ2FtZVNwZWVkKTtcbiAgICAgICAgICAgIC8vLS0g5Zyw5p2/5Yi35pawXG4gICAgICAgICAgICB0aGlzLmZsb29yLm9uUmVmcmVzaCh0aGlzLmdhbWVTcGVlZCk7XG4gICAgICAgICAgICAvLy0tIOeuoemBk+WIt+aWsFxuICAgICAgICAgICAgaWYgKHRoaXMucGlwZUdyb3VwTGlzdCAmJiB0aGlzLnBpcGVHcm91cExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBpID0gMCwgbGVuID0gdGhpcy5waXBlR3JvdXBMaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5LCBwaXBlR3JvcENvbXA7XG4gICAgICAgICAgICAgICAgLy8tLSDnrqHpgZPliLfmlrBcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBpcGVHcm91cEVudGl0eSB8fCBwaXBlR3JvdXBFbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3BDb21wID0gcGlwZUdyb3VwRW50aXR5LmdldENvbXBvbmVudCgnUGlwZUdyb3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVHcm9wQ29tcC5vblJlZnJlc2godGhpcy5nYW1lU3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLy0tIOe7tee+iumAmui/h+euoemBk+eahOiuoeeulyAmJiDorqHnrpfliIbmlbBcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBpcGVHcm91cEVudGl0eSB8fCBwaXBlR3JvdXBFbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3BDb21wID0gcGlwZUdyb3VwRW50aXR5LmdldENvbXBvbmVudCgnUGlwZUdyb3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGVlcFggPSAodGhpcy5zaGVlcC50cmFuc2Zvcm0ueCAtIHRoaXMuc2hlZXAuc2hlZXBTcHJpdFJlbmRlci53aWR0aCAvIDIgKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBpcGVHcm91cFggPSAocGlwZUdyb3VwRW50aXR5LnRyYW5zZm9ybS54ICsgcGlwZUdyb3BDb21wLnBpcGVHcm91cFdpdGggLyAyICk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGlwZUdyb3BDb21wLmhhc1Bhc3NlZCAmJiBzaGVlcFggPiBwaXBlR3JvdXBYKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBlR3JvcENvbXAuaGFzUGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhY3Rpb24rKztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhY3Rpb25CdG1wRm9udC50ZXh0ID0gdGhpcy5mcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbml0UG9zID0gbmV3IFZlYzIodGhpcy5zaGVlcC50cmFuc2Zvcm0ueCAtIDMwLCB0aGlzLnNoZWVwLnRyYW5zZm9ybS55ICsgNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgRWZmZWN0LmNyZWF0ZU1hbnVhbGx5RWZmZWN0VXBNb3ZlKHRoaXMudGVtcEFkZEZyYWN0aW9uRWZmLCBpbml0UG9zLCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLnBvaW50QXVpZG8ucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR2FtZVN0YXRlLm92ZXI6XG4gICAgICAgICAgICBpZiAodGhpcy5tYXNrLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFza1JlbmRlci5jb2xvci5hICs9IEZpcmUuVGltZS5kZWx0YVRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFza1JlbmRlci5jb2xvci5hID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ01haW5NZW51Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8tLSDnibnmlYjliLfmlrBcbiAgICBFZmZlY3Qub25SZWZyZXNoKCk7XG59O1xuXG4vLy0tIOWIm+W7uueuoemBk+e7hFxuR2FtZS5wcm90b3R5cGUuY3JlYXRlUGlwZUdyb3VwID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbnRpdHkgPSBuZXcgRmlyZS5FbnRpdHkoKTtcbiAgICB2YXIgcGlwZUdyb3BDb21wID0gZW50aXR5LmFkZENvbXBvbmVudCgnUGlwZUdyb3VwJylcbiAgICBlbnRpdHkucGFyZW50ID0gdGhpcy5waXBlR3JvdXA7XG4gICAgZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuaW5pdFBpcGVHcm91cFBvcztcbiAgICBwaXBlR3JvcENvbXAuY3JlYXRlKCk7XG4gICAgdGhpcy5waXBlR3JvdXBMaXN0LnB1c2goZW50aXR5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnM2RlYjluNE9lOU91Sk96aURXOXFWVmonLCAnTWFpbk1lbnUnKTtcbi8vIHNjcmlwdC9NYWluTWVudS5qc1xuXG52YXIgTWFpbk1lbnUgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCk7XG5cbk1haW5NZW51LnByb3AoJ3RlbXBNYXNrJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbk1haW5NZW51LnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5iZyA9IHRoaXMuZW50aXR5LmZpbmQoJ2JnJykuZ2V0Q29tcG9uZW50KCdGbG9vcicpO1xuICAgIHRoaXMuZmxvb3IgPSB0aGlzLmVudGl0eS5maW5kKCdmbG9vcicpLmdldENvbXBvbmVudCgnRmxvb3InKTtcbiAgICB0aGlzLmJ0bl9wbGF5ID0gdGhpcy5lbnRpdHkuZmluZCgnYnV0dG9uX3BsYXknKTtcbiAgICB0aGlzLmJ0bl9wbGF5Lm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdvVG9HYW1lID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXNrLmFjdGl2ZSA9IHRydWU7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMubWFzayA9IEZpcmUuRW50aXR5LmZpbmQoJy9tYXNrJyk7XG4gICAgdGhpcy5tYXNrUmVuZGVyID0gbnVsbDtcbiAgICBpZighdGhpcy5tYXNrKXtcbiAgICAgICAgdGhpcy5tYXNrID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnRlbXBNYXNrKTtcbiAgICAgICAgdGhpcy5tYXNrLm5hbWUgPSAnbWFzayc7XG4gICAgICAgIHRoaXMubWFzay5kb250RGVzdHJveU9uTG9hZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMubWFza1JlbmRlciA9IHRoaXMubWFzay5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPSAxO1xuICAgIHRoaXMuZ29Ub0dhbWUgPSBmYWxzZTtcbn07XG5cbk1haW5NZW51LnByb3RvdHlwZS5sYXRlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g6IOM5pmv5pu05pawXG4gICAgdGhpcy5iZy5vblJlZnJlc2goMCk7XG4gICAgLy8tLSDlnLDpnaLmm7TmlrBcbiAgICB0aGlzLmZsb29yLm9uUmVmcmVzaCgwKTtcblxuICAgIGlmICh0aGlzLm1hc2suYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLmdvVG9HYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lO1xuICAgICAgICAgICAgaWYgKHRoaXMubWFza1JlbmRlci5jb2xvci5hID4gMSkge1xuICAgICAgICAgICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnR2FtZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgLT0gRmlyZS5UaW1lLmRlbHRhVGltZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluTWVudTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMDA0Y2MyZ2pwTkpPSjJRV3g4aHY1OXEnLCAnUGlwZUdyb3VwJyk7XG4vLyBzY3JpcHQvUGlwZUdyb3VwLmpzXG5cbnZhciBQaXBlR3JvdXAgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g5Z+656GA56e75Yqo6YCf5bqmXG4gICAgdGhpcy5zcGVlZF8gPSAxMDA7XG4gICAgLy8tLSAoIEJleW9uZCB0aGlzIHJhbmdlIHdpbGwgYmUgZGVzdHJveWVkICkg6LaF5Ye66L+Z5Liq6IyD5Zu05bCx5Lya6KKr6ZSA5q+BXG4gICAgdGhpcy5yYW5nZV8gPSAtNjAwO1xuICAgIC8vLS0g5pyA5aSn6Ze06LedXG4gICAgdGhpcy5tYXhTcGFjaW5nID0gMjUwOy8vMjgwO1xuICAgIC8vLS0g5pyA5bCP6Ze06LedXG4gICAgdGhpcy5taW5TcGFjaW5nID0gMjIyOyAvLzI1MDtcbiAgICAvLy0tIOS4iuS4gOasoemaj+acuuWIsOeahOeuoemBk+exu+Wei1xuICAgIHRoaXMubGFzdFBpcGVUeXBlID0gbnVsbDtcbiAgICAvLy0tIOeuoemBk+eahOWuveW6plxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IDA7XG59KTtcblxuLy8tLSDnrqHpgZPnmoTnsbvlnotcbnZhciBQaXBlVHlwZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5Cb3R0b20gPSAwXSA9ICdib3R0b20nOyAgICAgICAgLy8g5LiK5pa5566h5a2QXG4gICAgdFt0LlRvcCA9IDFdID0gJ3RvcCc7ICAgICAgICAgICAvLyDkuIrmlrnnrqHlrZBcbiAgICB0W3QuRG91YmxlID0gMl0gPSAnZG91YmxlJzsgICAgICAgIC8vIOS4i+S4iuaWueeuoeWtkFxuICAgIHJldHVybiB0O1xufSkoe30pO1xuXG5QaXBlR3JvdXAucHJvcCgnaGFzUGFzc2VkJywgZmFsc2UpO1xuXG4vLy0tIOeuoemBk+exu+Wei1xuUGlwZUdyb3VwLnByb3AoJ3BpcGVUeXBlJywgUGlwZVR5cGUuVG9wLCBGaXJlLkVudW0oUGlwZVR5cGUpKTtcblxuLy8tLSDkuIrmlrnnrqHlrZDlnZDmoIfojIPlm7QgTWF4IOS4jiBNaW5cblBpcGVHcm91cC5wcm90b3R5cGUuVG9wUGlwZVBvc1JhbmdlID0gbmV3IEZpcmUuVmVjMig4MDAsIDcxMCk7XG5cbi8vLS0g5LiL5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLkJvdHRvbVBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoLTc1MCwgLTgwMCk7XG5cbi8vLS0g5Y+M5Liq5LiK5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLkRvdWJsZVRvcFBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoMTA1MCwgNzEwKTtcblxuLy8tLSDlj4zkuKrkuIvmlrnnrqHlrZDlnZDmoIfojIPlm7QgTWF4IOS4jiBNaW5cblBpcGVHcm91cC5wcm90b3R5cGUuRG91YmxlQm90dG9tUGlwZVBvc1JhbmdlID0gbmV3IEZpcmUuVmVjMigtODAwLCAtOTgwKTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5waXBlID0gRmlyZS5FbnRpdHkuZmluZCgnL1ByZWZhYnMvcGlwZScpO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5yYW5kb21QaXBlVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmFuZG9tVmx1ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAxO1xuICAgIGlmIChyYW5kb21WbHVlID49IDEgJiYgcmFuZG9tVmx1ZSA8PSA2MCkge1xuICAgICAgICByZXR1cm4gUGlwZVR5cGUuRG91YmxlO1xuICAgIH1cbiAgICBlbHNlIGlmIChyYW5kb21WbHVlID49IDYwICYmIHJhbmRvbVZsdWUgPD0gODApIHtcbiAgICAgICAgcmV0dXJuIFBpcGVUeXBlLkJvdHRvbTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBQaXBlVHlwZS5Ub3A7XG4gICAgfVxufVxuXG5QaXBlR3JvdXAucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sYXN0UGlwZVR5cGUgIT09IG51bGwgJiYgdGhpcy5sYXN0UGlwZVR5cGUgPT09IFBpcGVUeXBlLlRvcCkge1xuICAgICAgICB3aGlsZSAodGhpcy5sYXN0UGlwZVR5cGUgPT09IHRoaXMucGlwZVR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMucGlwZVR5cGUgPSB0aGlzLnJhbmRvbVBpcGVUeXBlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGlwZVR5cGUgPSB0aGlzLnJhbmRvbVBpcGVUeXBlKCk7XG4gICAgICAgIC8vLS0g5Li65LqG5L2T6aqM77yM6Ziy5q2i56ys5LiA5qyh5Ye6546w55qE566h6YGT5piv5LiK5pa555qEXG4gICAgfVxuICAgIHRoaXMuZW50aXR5Lm5hbWUgPSBQaXBlVHlwZVt0aGlzLnBpcGVUeXBlXTtcbiAgICBzd2l0Y2ggKHRoaXMucGlwZVR5cGUpIHtcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Cb3R0b206XG4gICAgICAgICAgICB0aGlzLmluaXRCb3R0b21QaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Ub3A6XG4gICAgICAgICAgICB0aGlzLmluaXRUb3BQaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Eb3VibGU6XG4gICAgICAgICAgICB0aGlzLmluaXREb3VibGVQaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUuaW5pdFRvcFBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvcFBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIHRvcFBpcGVSZW5kZXIgPSB0b3BQaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICB2YXIgcmFuZG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Ub3BQaXBlUG9zUmFuZ2UueCwgdGhpcy5Ub3BQaXBlUG9zUmFuZ2UueSk7XG5cbiAgICB0b3BQaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21ZO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IDE7XG4gICAgdG9wUGlwZS5uYW1lID0gJ3RvcFBpcGUnO1xuXG4gICAgdGhpcy5waXBlR3JvdXBXaXRoID0gdG9wUGlwZVJlbmRlci53aWR0aDtcbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUuaW5pdEJvdHRvbVBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJvdHRvbVBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIGJvdHRvbVBpcGVSZW5kZXIgPSBib3R0b21QaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICB2YXIgcmFuZG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Cb3R0b21QaXBlUG9zUmFuZ2UueCwgdGhpcy5Cb3R0b21QaXBlUG9zUmFuZ2UueSk7XG5cbiAgICBib3R0b21QaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21ZO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IC0xO1xuICAgIGJvdHRvbVBpcGUubmFtZSA9ICdib3R0b21QaXBlJztcblxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IGJvdHRvbVBpcGVSZW5kZXIuc3ByaXRlLndpZHRoO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5pbml0RG91YmxlUGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9wUGlwZSA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5waXBlKTtcbiAgICB2YXIgYm90dG9tUGlwZSA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5waXBlKTtcbiAgICB2YXIgdG9wUGlwZVJlbmRlciA9IHRvcFBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgIHZhciBib3R0b21QaXBlUmVuZGVyID0gdG9wUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG5cbiAgICB2YXIgcmFuZG9tVG9wWSA9IDA7XG4gICAgdmFyIHJhbmRvbUJvdHRvbVkgPSAwO1xuICAgIHZhciB0b3BZID0gMDtcbiAgICB2YXIgYm90dG9tWSA9IDA7XG4gICAgdmFyIHNwYWNpbmcgPSAwO1xuXG4gICAgd2hpbGUgKHNwYWNpbmcgPCB0aGlzLm1pblNwYWNpbmcgfHwgc3BhY2luZyA+IHRoaXMubWF4U3BhY2luZykge1xuICAgICAgICByYW5kb21Ub3BZID0gTWF0aC5yYW5kb21SYW5nZSh0aGlzLkRvdWJsZVRvcFBpcGVQb3NSYW5nZS54LCB0aGlzLkRvdWJsZVRvcFBpcGVQb3NSYW5nZS55KTtcbiAgICAgICAgcmFuZG9tQm90dG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Eb3VibGVCb3R0b21QaXBlUG9zUmFuZ2UueCwgdGhpcy5Eb3VibGVCb3R0b21QaXBlUG9zUmFuZ2UueSk7XG4gICAgICAgIHRvcFkgPSByYW5kb21Ub3BZIC0gKHRvcFBpcGVSZW5kZXIuc3ByaXRlLmhlaWdodCAvIDIpO1xuICAgICAgICBib3R0b21ZID0gcmFuZG9tQm90dG9tWSArIChib3R0b21QaXBlUmVuZGVyLnNwcml0ZS5oZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKHRvcFkgPCAwIHx8IGJvdHRvbVkgPiAwKSB7XG4gICAgICAgICAgICBzcGFjaW5nID0gTWF0aC5hYnModG9wWSkgLSBNYXRoLmFicyhib3R0b21ZKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNwYWNpbmcgPSBNYXRoLmFicyh0b3BZKSArIE1hdGguYWJzKGJvdHRvbVkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvcFBpcGUucGFyZW50ID0gdGhpcy5lbnRpdHk7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0ueCA9IDA7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0ueSA9IHJhbmRvbVRvcFk7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0uc2NhbGVZID0gMTtcbiAgICB0b3BQaXBlLm5hbWUgPSAndG9wUGlwZSc7XG5cbiAgICBib3R0b21QaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21Cb3R0b21ZO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IC0xO1xuICAgIGJvdHRvbVBpcGUubmFtZSA9ICdib3R0b21QaXBlJztcblxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IGJvdHRvbVBpcGVSZW5kZXIuc3ByaXRlLndpZHRoO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5vblJlZnJlc2ggPSBmdW5jdGlvbiAoZ2FtZVNwZWVkKSB7XG4gICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnggLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqICggdGhpcy5zcGVlZF8gKyBnYW1lU3BlZWQgKTtcbiAgICBpZiAodGhpcy5lbnRpdHkudHJhbnNmb3JtLnggPCB0aGlzLnJhbmdlXykge1xuICAgICAgICB0aGlzLmVudGl0eS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuZW50aXR5LmRpc3BhdGNoRXZlbnQobmV3IEZpcmUuRXZlbnQoXCJkZXN0cm95LVBpcGVHcm91cFwiLCB0cnVlKSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXBlR3JvdXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzA2NjMzd0txVFZNNmExSytHMjYycTFRJywgJ1NoZWVwJyk7XG4vLyBzY3JpcHQvU2hlZXAuanNcblxudmFyIEVmZmVjdCA9IHJlcXVpcmUoJ0VmZmVjdCcpO1xuXG52YXIgU2hlZXBTdGF0ZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5ub25lID0gMF0gPSAnbm9uZScsXG4gICAgdFt0LnJ1biA9IDBdID0gJ3J1bic7XG4gICAgdFt0Lmp1bXAgPSAxXSA9ICdqdW1wJztcbiAgICB0W3QuZHJvcCA9IDJdID0gJ2Ryb3AnO1xuICAgIHRbdC5kb3duID0gM10gPSAnZG93bic7XG4gICAgdFt0LmRpZSA9IDRdID0gJ2RpZSdcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxudmFyIFNoZWVwID0gRmlyZS5leHRlbmQoRmlyZS5Db21wb25lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNreU1heFkgPSAyNTA7Ly8xNjA7XG4gICAgdGhpcy5hbmltID0gbnVsbDtcbiAgICB0aGlzLnNoZWVwU3ByaXRSZW5kZXIgPSAwO1xuICAgIHRoaXMucnVuQW5pbVN0YXRlID0gbnVsbDtcbiAgICB0aGlzLmp1bXBBbmltU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuZHJvcEFuaW1TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5kb3duQW5pbVN0YXRlID0gbnVsbDtcbiAgICB0aGlzLmRpZUFuaW1TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5ydW47XG4gICAgdGhpcy50ZW1wU3BlZWQgPSAwO1xufSk7XG5cblNoZWVwLlNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlO1xuXG5TaGVlcC5wcm9wKCdncmF2aXR5JywgOS44KTtcblxuU2hlZXAucHJvcCgnc3BlZWQnLCAzMDApO1xuXG5TaGVlcC5wcm9wKCdmTG9vckNvb3JkaW5hdGVzJywgLTE4MCk7XG5cblNoZWVwLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlQW5pbWF0aW9uKTtcbiAgICB0aGlzLnJ1bkFuaW1TdGF0ZSA9IHRoaXMuYW5pbS5nZXRBbmltU3RhdGUoJ3NoZWVwX3J1bicpO1xuICAgIHRoaXMuanVtcEFuaW1TdGF0ZSA9IHRoaXMuYW5pbS5nZXRBbmltU3RhdGUoJ3NoZWVwX2p1bXAnKTtcbiAgICB0aGlzLmRyb3BBbmltU3RhdGUgPSB0aGlzLmFuaW0uZ2V0QW5pbVN0YXRlKCdzaGVlcF9kcm9wJyk7XG4gICAgdGhpcy5kb3duQW5pbVN0YXRlID0gdGhpcy5hbmltLmdldEFuaW1TdGF0ZSgnc2hlZXBfZG93bicpO1xuICAgIHRoaXMuZGllQW5pbVN0YXRlID0gdGhpcy5hbmltLmdldEFuaW1TdGF0ZSgnc2hlZXBfZGllJyk7XG5cbiAgICB0aGlzLnNoZWVwU3ByaXRSZW5kZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgdGhpcy5kaWVSb3RhdGlvbiA9IC04ODtcblxuICAgIHRoaXMuZm9nRG93bkVmZmVjdCA9IEZpcmUuRW50aXR5LmZpbmQoJy9QcmVmYWJzL2ZvZ18yJyk7XG59O1xuXG5TaGVlcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24gPSAwO1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICB0aGlzLmFuaW0ucGxheSh0aGlzLnJ1bkFuaW1TdGF0ZSwgMCk7XG4gICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5ydW47XG59O1xuXG5TaGVlcC5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMuc2hlZXBTdGF0ZSAhPT0gU2hlZXBTdGF0ZS5ydW4pIHtcbiAgICAgICAgdGhpcy50ZW1wU3BlZWQgLT0gKEZpcmUuVGltZS5kZWx0YVRpbWUgKiAxMDApICogdGhpcy5ncmF2aXR5O1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5zaGVlcFN0YXRlKSB7XG4gICAgICAgIGNhc2UgU2hlZXBTdGF0ZS5ydW46XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmp1bXA6XG4gICAgICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy50ZW1wU3BlZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy50ZW1wU3BlZWQgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltLnBsYXkodGhpcy5kcm9wQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLmRyb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmRyb3A6XG4gICAgICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy50ZW1wU3BlZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgPD0gdGhpcy5mTG9vckNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgPSB0aGlzLmZMb29yQ29vcmRpbmF0ZXM7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy5lbnRpdHkudHJhbnNmb3JtLngsIHRoaXMuZW50aXR5LnRyYW5zZm9ybS55IC0gMzApO1xuICAgICAgICAgICAgICAgIEVmZmVjdC5jcmVhdGUodGhpcy5mb2dEb3duRWZmZWN0LCBwb3MpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltLnBsYXkodGhpcy5kb3duQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLmRvd247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmRvd246XG4gICAgICAgICAgICBpZiAodGhpcy5kb3duQW5pbVN0YXRlICYmICF0aGlzLmFuaW0uaXNQbGF5aW5nKHRoaXMuZG93bkFuaW1TdGF0ZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbS5wbGF5KHRoaXMucnVuQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLnJ1bjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNoZWVwU3RhdGUuZGllOlxuICAgICAgICAgICAgaWYgKHRoaXMuZW50aXR5LnRyYW5zZm9ybS55ID4gdGhpcy5mTG9vckNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMudGVtcFNwZWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy5lbnRpdHkudHJhbnNmb3JtLngsIHRoaXMuZW50aXR5LnRyYW5zZm9ybS55IC0gMzApO1xuICAgICAgICAgICAgICAgIEVmZmVjdC5jcmVhdGUodGhpcy5mb2dEb3duRWZmZWN0LCBwb3MpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hlZXBTdGF0ZSA9IFNoZWVwU3RhdGUubm9uZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGVlcDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8tY2xpcCcpO1xuLy8gc3JjL2F1ZGlvLWNsaXAuanNcblxuRmlyZS5BdWRpb0NsaXAgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBBdWRpb0NsaXAgPSBGaXJlLmV4dGVuZChcIkZpcmUuQXVkaW9DbGlwXCIsIEZpcmUuQXNzZXQpO1xuXG4gICAgQXVkaW9DbGlwLnByb3AoJ3Jhd0RhdGEnLCBudWxsLCBGaXJlLlJhd1R5cGUoJ2F1ZGlvJyksIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoJ2J1ZmZlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBCdWZmZXIodGhpcyk7XG4gICAgfSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImxlbmd0aFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcInNhbXBsZXNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXModGhpcyk7XG4gICAgfSk7XG5cbiAgICBBdWRpb0NsaXAuZ2V0KFwiY2hhbm5lbHNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImZyZXF1ZW5jeVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwRnJlcXVlbmN5KHRoaXMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEF1ZGlvQ2xpcDtcbn0pKCk7XG5cbi8vIGNyZWF0ZSBlbnRpdHkgYWN0aW9uXG4vLyBAaWYgRURJVE9SXG5GaXJlLkF1ZGlvQ2xpcC5wcm90b3R5cGUuY3JlYXRlRW50aXR5ID0gZnVuY3Rpb24gKCBjYiApIHtcbiAgICB2YXIgZW50ID0gbmV3IEZpcmUuRW50aXR5KHRoaXMubmFtZSk7XG5cbiAgICB2YXIgYXVkaW9Tb3VyY2UgPSBlbnQuYWRkQ29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuXG4gICAgYXVkaW9Tb3VyY2UuY2xpcCA9IHRoaXM7XG5cbiAgICBpZiAoIGNiIClcbiAgICAgICAgY2IgKGVudCk7XG59O1xuLy8gQGVuZGlmXG5cbm1vZHVsZS5leHBvcnRzID0gRmlyZS5BdWRpb0NsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWxlZ2FjeScpO1xuLy8gc3JjL2F1ZGlvLWxlZ2FjeS5qc1xuXG4oZnVuY3Rpb24oKXtcbiAgICB2YXIgVXNlV2ViQXVkaW8gPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQpO1xuICAgIGlmIChVc2VXZWJBdWRpbykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBBdWRpb0NvbnRleHQgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGxvYWRlciAodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xuICAgICAgICB2YXIgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XG4gICAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBhdWRpbyk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZSArICdcXG4gVGhpcyBtYXkgY2F1c2VkIGJ5IGZpcmViYWxsLXgvZGV2IzI2NycsIG51bGwpO1xuICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgYXVkaW8uc3JjID0gdXJsO1xuICAgIH1cblxuICAgIEZpcmUuTG9hZE1hbmFnZXIucmVnaXN0ZXJSYXdUeXBlcygnYXVkaW8nLCBsb2FkZXIpO1xuXG4gICAgQXVkaW9Db250ZXh0LmluaXRTb3VyY2UgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5fYXVkaW8gPSBudWxsO1xuICAgIH07XG5cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Ll9hdWRpbyAmJiB0YXJnZXQuX3BsYXlpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX2F1ZGlvLmN1cnJlbnRUaW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5fYXVkaW8pIHtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHRhcmdldC5fYXVkaW8uZHVyYXRpb247XG4gICAgICAgICAgICB0YXJnZXQuX2F1ZGlvLmN1cnJlbnRUaW1lID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8g6Z2c6Z+zXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLm11dGVkID0gdGFyZ2V0Lm11dGU7XG4gICAgfTtcblxuICAgIC8vIOiuvue9rumfs+mHj++8jOmfs+mHj+iMg+WbtOaYr1swLCAxXVxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVWb2x1bWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnZvbHVtZSA9IHRhcmdldC52b2x1bWU7XG4gICAgfTtcblxuICAgIC8vIOiuvue9ruW+queOr1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVMb29wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5sb29wID0gdGFyZ2V0Lmxvb3A7XG4gICAgfTtcblxuICAgIC8vIOWwhumfs+S5kOa6kOiKgueCuee7keWumuWFt+S9k+eahOmfs+mikWJ1ZmZlclxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVBdWRpb0NsaXAgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2xpcCkgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpbyA9IHRhcmdldC5jbGlwLnJhd0RhdGE7XG4gICAgfTtcblxuICAgIC8vIOaaq+WBnFxuICAgIEF1ZGlvQ29udGV4dC5wYXVzZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBhdXNlKCk7XG4gICAgfTtcblxuICAgIC8vIOWBnOatolxuICAgIEF1ZGlvQ29udGV4dC5zdG9wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZSA9IDA7XG4gICAgfTtcblxuICAgIC8vIOaSreaUvlxuICAgIEF1ZGlvQ29udGV4dC5wbGF5ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsaXAgfHwgIXRhcmdldC5jbGlwLnJhd0RhdGEpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICh0YXJnZXQuX3BsYXlpbmcgJiYgIXRhcmdldC5fcGF1c2VkKSB7IHJldHVybjsgfVxuICAgICAgICB0aGlzLnVwZGF0ZUF1ZGlvQ2xpcCh0YXJnZXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVZvbHVtZSh0YXJnZXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZUxvb3AodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVNdXRlKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5fYXVkaW8ucGxheSgpO1xuXG4gICAgICAgIC8vIOaSreaUvue7k+adn+WQjueahOWbnuiwg1xuICAgICAgICB0YXJnZXQuX2F1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGFyZ2V0Lm9uUGxheUVuZC5iaW5kKHRhcmdldCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy8g6I635b6X6Z+z6aKR5Ymq6L6R55qEIGJ1ZmZlclxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwQnVmZmVyID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIDxCdWZmZXI+IGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDku6Xnp5LkuLrljZXkvY0g6I635Y+W6Z+z6aKR5Ymq6L6R55qEIOmVv+W6plxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5kdXJhdGlvbjtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE6ZW/5bqmXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBTYW1wbGVzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgPFNhbXBsZXM+IGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTlo7DpgZPmlbBcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgPENoYW5uZWxzPiBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE6YeH5qC36aKR546HXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSA8RnJlcXVlbmN5PiBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG5cbiAgICBGaXJlLkF1ZGlvQ29udGV4dCA9IEF1ZGlvQ29udGV4dDtcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLXNvdXJjZScpO1xuLy8gc3JjL2F1ZGlvLXNvdXJjZS5qc1xuXG52YXIgQXVkaW9Tb3VyY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBBdWRpb1NvdXJjZSA9IEZpcmUuZXh0ZW5kKFwiRmlyZS5BdWRpb1NvdXJjZVwiLCBGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2U7IC8vLS0g5aOw5rqQ5pqC5YGc5oiW6ICF5YGc5q2i5pe25YCZ5Li6ZmFsc2VcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7Ly8tLSDmnaXljLrliIblo7DmupDmmK/mmoLlgZzov5jmmK/lgZzmraJcblxuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSAwO1xuICAgICAgICB0aGlzLl9sYXN0UGxheSA9IDA7XG5cbiAgICAgICAgdGhpcy5fYnVmZlNvdXJjZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3ZvbHVtZUdhaW4gPSBudWxsO1xuXG4gICAgICAgIHRoaXMub25FbmQgPSBudWxsO1xuICAgIH0pO1xuXG4gICAgLy9cbiAgICBGaXJlLmFkZENvbXBvbmVudE1lbnUoQXVkaW9Tb3VyY2UsICdBdWRpb1NvdXJjZScpO1xuXG4gICAgLy9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXVkaW9Tb3VyY2UucHJvdG90eXBlLCBcImlzUGxheWluZ1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BsYXlpbmcgJiYgIXRoaXMuX3BhdXNlZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEF1ZGlvU291cmNlLnByb3RvdHlwZSwgXCJpc1BhdXNlZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhdXNlZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXVkaW9Tb3VyY2UucHJvdG90eXBlLCAndGltZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVUaW1lKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBBdWRpb1NvdXJjZS5wcm9wKCdfcGxheWJhY2tSYXRlJywgMS4wLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG4gICAgQXVkaW9Tb3VyY2UuZ2V0c2V0KCdwbGF5YmFja1JhdGUnLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheWJhY2tSYXRlO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGF5YmFja1JhdGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheWJhY2tSYXRlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlUGxheWJhY2tSYXRlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX2NsaXAnLCBudWxsLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG4gICAgQXVkaW9Tb3VyY2UuZ2V0c2V0KCdjbGlwJyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NsaXA7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaXAgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZUF1ZGlvQ2xpcCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgRmlyZS5PYmplY3RUeXBlKEZpcmUuQXVkaW9DbGlwKVxuICAgICk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ19sb29wJywgZmFsc2UsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ2xvb3AnLFxuICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvb3A7XG4gICAgICAgfSxcbiAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgaWYgKHRoaXMuX2xvb3AgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICB0aGlzLl9sb29wID0gdmFsdWU7XG4gICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVMb29wKHRoaXMpO1xuICAgICAgICAgICB9XG4gICAgICAgfVxuICAgICk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ19tdXRlJywgZmFsc2UsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ211dGUnLFxuICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX211dGU7XG4gICAgICAgfSxcbiAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgaWYgKHRoaXMuX211dGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICB0aGlzLl9tdXRlID0gdmFsdWU7XG4gICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVNdXRlKHRoaXMpO1xuICAgICAgICAgICB9XG4gICAgICAgfVxuICAgICk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ192b2x1bWUnLCAxLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG4gICAgQXVkaW9Tb3VyY2UuZ2V0c2V0KCd2b2x1bWUnLFxuICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZvbHVtZTtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fdm9sdW1lICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgdGhpcy5fdm9sdW1lID0gTWF0aC5jbGFtcDAxKHZhbHVlKTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSh0aGlzKTtcbiAgICAgICAgICAgfVxuICAgICAgIH0sXG4gICAgICAgRmlyZS5SYW5nZSgwLDEpXG4gICAgKTtcblxuICAgIEF1ZGlvU291cmNlLnByb3AoJ3BsYXlPbkF3YWtlJywgdHJ1ZSk7XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUub25QbGF5RW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHRoaXMub25FbmQgKSB7XG4gICAgICAgICAgICB0aGlzLm9uRW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wYXVzZSh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAoIHRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wbGF5KHRoaXMsIHRoaXMuX3N0YXJ0VGltZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBsYXkodGhpcywgMCk7XG5cbiAgICAgICAgdGhpcy5fcGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5fcGxheWluZyApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnN0b3AodGhpcyk7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coXCJvblN0YXJ0XCIpO1xuICAgICAgICAvLyAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgLy99XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXVkaW9Tb3VyY2U7XG59KSgpO1xuXG5GaXJlLkF1ZGlvU291cmNlID0gQXVkaW9Tb3VyY2U7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLXdlYi1hdWRpbycpO1xuLy8gc3JjL2F1ZGlvLXdlYi1hdWRpby5qc1xuXG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBOYXRpdmVBdWRpb0NvbnRleHQgPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQpO1xuICAgIGlmICggIU5hdGl2ZUF1ZGlvQ29udGV4dCApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpeCBmaXJlYmFsbC14L2RldiMzNjVcbiAgICBpZiAoIUZpcmUubmF0aXZlQUMpIHtcbiAgICAgICAgRmlyZS5uYXRpdmVBQyA9IG5ldyBOYXRpdmVBdWRpb0NvbnRleHQoKTtcbiAgICB9XG5cbiAgICAvLyDmt7vliqBzYWZlRGVjb2RlQXVkaW9EYXRh55qE5Y6f5Zug77yaaHR0cHM6Ly9naXRodWIuY29tL2ZpcmViYWxsLXgvZGV2L2lzc3Vlcy8zMThcbiAgICBmdW5jdGlvbiBzYWZlRGVjb2RlQXVkaW9EYXRhKGNvbnRleHQsIGJ1ZmZlciwgdXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGltZW91dCA9IGZhbHNlO1xuICAgICAgICB2YXIgdGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soJ1RoZSBvcGVyYXRpb24gb2YgZGVjb2RpbmcgYXVkaW8gZGF0YSBhbHJlYWR5IHRpbWVvdXQhIEF1ZGlvIHVybDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgICdcIi4gU2V0IEZpcmUuQXVkaW9Db250ZXh0Lk1heERlY29kZVRpbWUgdG8gYSBsYXJnZXIgdmFsdWUgaWYgdGhpcyBlcnJvciBvZnRlbiBvY2N1ci4gJyArXG4gICAgICAgICAgICAgICAgICAgICAnU2VlIGZpcmViYWxsLXgvZGV2IzMxOCBmb3IgZGV0YWlscy4nLCBudWxsKTtcbiAgICAgICAgfSwgQXVkaW9Db250ZXh0Lk1heERlY29kZVRpbWUpO1xuXG4gICAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGJ1ZmZlcixcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkZWNvZGVkRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkZWNvZGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXCIgc2VlbXMgdG8gYmUgdW5yZWFjaGFibGUgb3IgdGhlIGZpbGUgaXMgZW1wdHkuIElubmVyTWVzc2FnZTogJyArIGUpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRlcih1cmwsIGNhbGxiYWNrLCBvblByb2dyZXNzKSB7XG4gICAgICAgIHZhciBjYiA9IGNhbGxiYWNrICYmIGZ1bmN0aW9uIChlcnJvciwgeGhyKSB7XG4gICAgICAgICAgICBpZiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgc2FmZURlY29kZUF1ZGlvRGF0YShGaXJlLm5hdGl2ZUFDLCB4aHIucmVzcG9uc2UsIHVybCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAnXCIgc2VlbXMgdG8gYmUgdW5yZWFjaGFibGUgb3IgdGhlIGZpbGUgaXMgZW1wdHkuIElubmVyTWVzc2FnZTogJyArIGVycm9yLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRmlyZS5Mb2FkTWFuYWdlci5fbG9hZEZyb21YSFIodXJsLCBjYiwgb25Qcm9ncmVzcywgJ2FycmF5YnVmZmVyJyk7XG4gICAgfVxuXG4gICAgRmlyZS5Mb2FkTWFuYWdlci5yZWdpc3RlclJhd1R5cGVzKCdhdWRpbycsIGxvYWRlcik7XG5cbiAgICB2YXIgQXVkaW9Db250ZXh0ID0ge307XG5cbiAgICBBdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSA9IDQwMDA7XG5cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICggdGFyZ2V0Ll9wYXVzZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9zdGFydFRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRhcmdldC5fcGxheWluZyApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX3N0YXJ0VGltZSArIHRoaXMuZ2V0UGxheWVkVGltZSh0YXJnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfTtcblxuICAgIEF1ZGlvQ29udGV4dC5nZXRQbGF5ZWRUaW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gKEZpcmUubmF0aXZlQUMuY3VycmVudFRpbWUgLSB0YXJnZXQuX2xhc3RQbGF5KSAqIHRhcmdldC5fcGxheWJhY2tSYXRlO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVUaW1lID0gZnVuY3Rpb24gKHRhcmdldCwgdGltZSkge1xuICAgICAgICB0YXJnZXQuX2xhc3RQbGF5ID0gRmlyZS5uYXRpdmVBQy5jdXJyZW50VGltZTtcbiAgICAgICAgdGFyZ2V0Ll9zdGFydFRpbWUgPSB0aW1lO1xuXG4gICAgICAgIGlmICggdGFyZ2V0LmlzUGxheWluZyApIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2UodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll92b2x1bWVHYWluKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldC5tdXRlID8gLTEgOiAodGFyZ2V0LnZvbHVtZSAtIDEpO1xuICAgIH07XG5cbiAgICAvLyByYW5nZSBbMCwxXVxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVWb2x1bWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll92b2x1bWVHYWluKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldC52b2x1bWUgLSAxO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVMb29wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYnVmZlNvdXJjZSkgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLmxvb3AgPSB0YXJnZXQubG9vcDtcbiAgICB9O1xuXG4gICAgLy8gYmluZCBidWZmZXIgc291cmNlXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUF1ZGlvQ2xpcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCB0YXJnZXQuaXNQbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKHRhcmdldCxmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICggIXRoaXMuaXNQYXVzZWQgKSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5wYXVzZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2J1ZmZTb3VyY2UpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgdGFyZ2V0Ll9zdGFydFRpbWUgKz0gdGhpcy5nZXRQbGF5ZWRUaW1lKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLnN0b3AoMCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnN0b3AgPSBmdW5jdGlvbiAoIHRhcmdldCwgZW5kZWQgKSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9idWZmU291cmNlKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGlmICggIWVuZGVkICkge1xuICAgICAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5zdG9wKDApO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5wbGF5ID0gZnVuY3Rpb24gKCB0YXJnZXQsIGF0ICkge1xuICAgICAgICBpZiAoIXRhcmdldC5jbGlwIHx8ICF0YXJnZXQuY2xpcC5yYXdEYXRhKSB7IHJldHVybjsgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSBidWZmZXIgc291cmNlXG4gICAgICAgIHZhciBidWZmZXJTb3VyY2UgPSBGaXJlLm5hdGl2ZUFDLmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB2b2x1bWUgY29udHJvbFxuICAgICAgICB2YXIgZ2FpbiA9IEZpcmUubmF0aXZlQUMuY3JlYXRlR2FpbigpO1xuXG4gICAgICAgIC8vIGNvbm5lY3RcbiAgICAgICAgYnVmZmVyU291cmNlLmNvbm5lY3QoZ2Fpbik7XG4gICAgICAgIGdhaW4uY29ubmVjdChGaXJlLm5hdGl2ZUFDLmRlc3RpbmF0aW9uKTtcbiAgICAgICAgYnVmZmVyU291cmNlLmNvbm5lY3QoRmlyZS5uYXRpdmVBQy5kZXN0aW5hdGlvbik7XG5cbiAgICAgICAgLy8gaW5pdCBwYXJhbWV0ZXJzXG4gICAgICAgIGJ1ZmZlclNvdXJjZS5idWZmZXIgPSB0YXJnZXQuY2xpcC5yYXdEYXRhO1xuICAgICAgICBidWZmZXJTb3VyY2UubG9vcCA9IHRhcmdldC5sb29wO1xuICAgICAgICBidWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gdGFyZ2V0LnBsYXliYWNrUmF0ZTtcbiAgICAgICAgYnVmZmVyU291cmNlLm9uZW5kZWQgPSB0YXJnZXQub25QbGF5RW5kLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0Lm11dGUgPyAtMSA6ICh0YXJnZXQudm9sdW1lIC0gMSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlID0gYnVmZmVyU291cmNlO1xuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4gPSBnYWluO1xuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSA9IGF0IHx8IDA7XG4gICAgICAgIHRhcmdldC5fbGFzdFBsYXkgPSBGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIC8vIHBsYXlcbiAgICAgICAgYnVmZmVyU291cmNlLnN0YXJ0KCAwLCB0aGlzLmdldEN1cnJlbnRUaW1lKHRhcmdldCkgKTtcbiAgICB9O1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlciA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBMZW5ndGggPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmR1cmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXMgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEubnVtYmVyT2ZDaGFubmVscztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLnNhbXBsZVJhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cblxuICAgIEZpcmUuQXVkaW9Db250ZXh0ID0gQXVkaW9Db250ZXh0O1xufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuLy8g5Yqo55S75Ymq6L6RXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gRmlyZS5leHRlbmQoJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCcsIEZpcmUuQ3VzdG9tQXNzZXQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBudWxsOyAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm9cbn0pO1xuXG5GaXJlLmFkZEN1c3RvbUFzc2V0TWVudShTcHJpdGVBbmltYXRpb25DbGlwLCBcIk5ldyBTcHJpdGUgQW5pbWF0aW9uXCIpO1xuXG5TcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlID0gRmlyZS5kZWZpbmVFbnVtKHtcbiAgICBEZWZhdWx0OiAtMSxcbiAgICBPbmNlOiAtMSxcbiAgICBMb29wOiAtMSxcbiAgICBQaW5nUG9uZzogLTEsXG4gICAgQ2xhbXBGb3JldmVyOiAtMVxufSk7XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbiA9IEZpcmUuZGVmaW5lRW51bSh7XG4gICAgRG9Ob3RoaW5nOiAtMSwgICAgLy8gZG8gbm90aGluZ1xuICAgIERlZmF1bHRTcHJpdGU6IDEsIC8vIHNldCB0byBkZWZhdWx0IHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICBIaWRlOiAtMSwgICAgICAgICAvLyBoaWRlIHRoZSBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXG4gICAgRGVzdHJveTogLTEgICAgICAgLy8gZGVzdHJveSB0aGUgZW50aXR5IHRoZSBzcHJpdGUgYmVsb25ncyB0byB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbn0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vLyBUaGUgc3RydWN0dXJlIHRvIGRlc2NyaXAgYSBmcmFtZSBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIEZyYW1lSW5mbyA9IEZpcmUuZGVmaW5lKCdGcmFtZUluZm8nKVxuICAgICAgICAgICAgICAgICAgICAucHJvcCgnc3ByaXRlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuU3ByaXRlKSlcbiAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2ZyYW1lcycsIDAsIEZpcmUuSW50ZWdlcik7XG5cbi8vLzwgdGhlIGxpc3Qgb2YgZnJhbWUgaW5mb1xuLy8gdG8gZG9cblxuLy8gZGVmYXVsdCB3cmFwIG1vZGVcblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvcCgnd3JhcE1vZGUnLCBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHQsIEZpcmUuRW51bShTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlKSk7XG5cbi8vIHRoZSBkZWZhdWx0IHR5cGUgb2YgYWN0aW9uIHVzZWQgd2hlbiB0aGUgYW5pbWF0aW9uIHN0b3BwZWRcblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvcCgnc3RvcEFjdGlvbicsIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5Eb05vdGhpbmcsIEZpcmUuRW51bShTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24pKTtcblxuLy8gdGhlIGRlZmF1bHQgc3BlZWQgb2YgdGhlIGFuaW1hdGlvbiBjbGlwXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ3NwZWVkJywgMSk7XG5cbi8vIHRoZSBzYW1wbGUgcmF0ZSB1c2VkIGluIHRoaXMgYW5pbWF0aW9uIGNsaXBcblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvcCgnX2ZyYW1lUmF0ZScsIDYwLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG5TcHJpdGVBbmltYXRpb25DbGlwLmdldHNldCgnZnJhbWVSYXRlJyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZVJhdGU7XG4gICAgfSxcbiAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZyYW1lUmF0ZSA9IE1hdGgucm91bmQoTWF0aC5tYXgodmFsdWUsIDEpKTtcbiAgICAgICAgfVxuICAgIH1cbik7XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvcCgnZnJhbWVJbmZvcycsIFtdLCBGaXJlLk9iamVjdFR5cGUoRnJhbWVJbmZvKSk7XG5cblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm90b3R5cGUuZ2V0VG90YWxGcmFtZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZyYW1lcyA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZyYW1lSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgZnJhbWVzICs9IHRoaXMuZnJhbWVJbmZvc1tpXS5mcmFtZXM7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZXM7XG59O1xuXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3RvdHlwZS5nZXRGcmFtZUluZm9GcmFtZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBuZXcgQXJyYXkodGhpcy5mcmFtZUluZm9zLmxlbmd0aCk7XG4gICAgICAgIHZhciB0b3RhbEZyYW1lcyA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0b3RhbEZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xuICAgICAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW2ldID0gdG90YWxGcmFtZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcztcbn07XG5cbkZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IFNwcml0ZUFuaW1hdGlvbkNsaXA7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbWF0aW9uQ2xpcDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZScpO1xuLy8gc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qc1xuXG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xuXG52YXIgU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSBmdW5jdGlvbiAoYW5pbUNsaXApIHtcbiAgICBpZiAoIWFuaW1DbGlwKSB7XG4vLyBAaWYgREVWXG4gICAgICAgIEZpcmUuZXJyb3IoJ1Vuc3BlY2lmaWVkIHNwcml0ZSBhbmltYXRpb24gY2xpcCcpO1xuLy8gQGVuZGlmXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdGhlIG5hbWUgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGVcbiAgICB0aGlzLm5hbWUgPSBhbmltQ2xpcC5uYW1lO1xuICAgIC8vIHRoZSByZWZlcmVuY2VkIHNwcml0ZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICB0aGlzLmNsaXAgPSBhbmltQ2xpcDtcbiAgICAvLyB0aGUgd3JhcCBtb2RlXG4gICAgdGhpcy53cmFwTW9kZSA9IGFuaW1DbGlwLndyYXBNb2RlO1xuICAgIC8vIHRoZSBzdG9wIGFjdGlvblxuICAgIHRoaXMuc3RvcEFjdGlvbiA9IGFuaW1DbGlwLnN0b3BBY3Rpb247XG4gICAgLy8gdGhlIHNwZWVkIHRvIHBsYXkgdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMuc3BlZWQgPSBhbmltQ2xpcC5zcGVlZDtcbiAgICAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm8gaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IGFuaW1DbGlwLmdldEZyYW1lSW5mb0ZyYW1lcygpO1xuICAgIC8vIHRoZSB0b3RhbCBmcmFtZSBjb3VudCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy50b3RhbEZyYW1lcyA9IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcy5sZW5ndGggPiAwID8gdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2ZyYW1lSW5mb0ZyYW1lcy5sZW5ndGggLSAxXSA6IDA7XG4gICAgLy8gdGhlIGxlbmd0aCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBpbiBzZWNvbmRzIHdpdGggc3BlZWQgPSAxLjBmXG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLnRvdGFsRnJhbWVzIC8gYW5pbUNsaXAuZnJhbWVSYXRlO1xuICAgIC8vIFRoZSBjdXJyZW50IGluZGV4IG9mIGZyYW1lLiBUaGUgdmFsdWUgY2FuIGJlIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzLlxuICAgIC8vIElmIHRoZSBmcmFtZSBpcyBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcyBpdCB3aWxsIGJlIHdyYXBwZWQgYWNjb3JkaW5nIHRvIHdyYXBNb2RlLiBcbiAgICB0aGlzLmZyYW1lID0gLTE7XG4gICAgLy8gdGhlIGN1cnJlbnQgdGltZSBpbiBzZW9uY2RzXG4gICAgdGhpcy50aW1lID0gMDtcbiAgICAvLyBjYWNoZSByZXN1bHQgb2YgR2V0Q3VycmVudEluZGV4XG4gICAgdGhpcy5fY2FjaGVkSW5kZXggPSAtMTtcbn07XG5cbi8qKlxuICogQHJldHVybnMge251bWJlcn0gLSB0aGUgY3VycmVudCBmcmFtZSBpbmZvIGluZGV4LlxuICovXG5TcHJpdGVBbmltYXRpb25TdGF0ZS5wcm90b3R5cGUuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRvdGFsRnJhbWVzID4gMSkge1xuICAgICAgICAvL2ludCBvbGRGcmFtZSA9IGZyYW1lO1xuICAgICAgICB0aGlzLmZyYW1lID0gTWF0aC5mbG9vcih0aGlzLnRpbWUgKiB0aGlzLmNsaXAuZnJhbWVSYXRlKTtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gLXRoaXMuZnJhbWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd3JhcHBlZEluZGV4O1xuICAgICAgICBpZiAodGhpcy53cmFwTW9kZSAhPT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5QaW5nUG9uZykge1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gX3dyYXAodGhpcy5mcmFtZSwgdGhpcy50b3RhbEZyYW1lcyAtIDEsIHRoaXMud3JhcE1vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gdGhpcy5mcmFtZTtcbiAgICAgICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKHdyYXBwZWRJbmRleCAvIHRoaXMudG90YWxGcmFtZXMpO1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ICU9IHRoaXMudG90YWxGcmFtZXM7XG4gICAgICAgICAgICBpZiAoKGNudCAmIDB4MSkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLnRvdGFsRnJhbWVzIC0gMSAtIHdyYXBwZWRJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyeSB0byB1c2UgY2FjaGVkIGZyYW1lIGluZm8gaW5kZXhcbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlZEluZGV4IC0gMSA+PSAwICYmXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPj0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4IC0gMV0gJiZcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA8IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1t0aGlzLl9jYWNoZWRJbmRleF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlYXJjaCBmcmFtZSBpbmZvXG4gICAgICAgIHZhciBmcmFtZUluZm9JbmRleCA9IF9iaW5hcnlTZWFyY2godGhpcy5fZnJhbWVJbmZvRnJhbWVzLCB3cmFwcGVkSW5kZXggKyAxKTtcbiAgICAgICAgaWYgKGZyYW1lSW5mb0luZGV4IDwgMCkge1xuICAgICAgICAgICAgZnJhbWVJbmZvSW5kZXggPSB+ZnJhbWVJbmZvSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FjaGVkSW5kZXggPSBmcmFtZUluZm9JbmRleDtcbiAgICAgICAgcmV0dXJuIGZyYW1lSW5mb0luZGV4O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLnRvdGFsRnJhbWVzID09PSAxKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBcbi8vLyBDIyBBcnJheS5CaW5hcnlTZWFyY2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBcbmZ1bmN0aW9uIF9iaW5hcnlTZWFyY2ggKGFycmF5LCB2YWx1ZSkge1xuICAgIHZhciBsID0gMCwgaCA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKGwgPD0gaCkge1xuICAgICAgICB2YXIgbSA9ICgobCArIGgpID4+IDEpO1xuICAgICAgICBpZiAoYXJyYXlbbV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJyYXlbbV0gPiB2YWx1ZSkge1xuICAgICAgICAgICAgaCA9IG0gLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbCA9IG0gKyAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB+bDtcbn1cblxuZnVuY3Rpb24gX3dyYXAgKF92YWx1ZSwgX21heFZhbHVlLCBfd3JhcE1vZGUpIHtcbiAgICBpZiAoX21heFZhbHVlID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoX3ZhbHVlIDwgMCkge1xuICAgICAgICBfdmFsdWUgPSAtX3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkxvb3ApIHtcbiAgICAgICAgcmV0dXJuIF92YWx1ZSAlIChfbWF4VmFsdWUgKyAxKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XG4gICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKF92YWx1ZSAvIF9tYXhWYWx1ZSk7XG4gICAgICAgIF92YWx1ZSAlPSBfbWF4VmFsdWU7XG4gICAgICAgIGlmIChjbnQgJSAyID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlIC0gX3ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoX3ZhbHVlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF92YWx1ZSA+IF9tYXhWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9tYXhWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3ZhbHVlO1xufVxuXG5GaXJlLlNwcml0ZUFuaW1hdGlvblN0YXRlID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ3Nwcml0ZS1hbmltYXRpb24nKTtcbi8vIHNwcml0ZS1hbmltYXRpb24uanNcblxudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tc3RhdGUnKTtcblxuLy8g5a6a5LmJ5LiA5Liq5ZCN5Y+rU3ByaXRlIEFuaW1hdGlvbiDnu4Tku7ZcbnZhciBTcHJpdGVBbmltYXRpb24gPSBGaXJlLmV4dGVuZCgnRmlyZS5TcHJpdGVBbmltYXRpb24nLCBGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgIHRoaXMuX25hbWVUb1N0YXRlID0gbnVsbDtcbiAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xuICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyID0gbnVsbDtcbiAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0RnJhbWVJbmRleCA9IC0xO1xuICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgdGhpcy5fcGxheVN0YXJ0RnJhbWUgPSAwOy8vIOWcqOiwg+eUqFBsYXnnmoTlvZPluKfnmoRMYXRlVXBkYXRl5LiN6L+b6KGMc3RlcFxufSk7XG5cbkZpcmUuYWRkQ29tcG9uZW50TWVudShTcHJpdGVBbmltYXRpb24sICdTcHJpdGUgQW5pbWF0aW9uJyk7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm9wKCdkZWZhdWx0QW5pbWF0aW9uJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ2FuaW1hdGlvbnMnLCBbXSwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ19wbGF5QXV0b21hdGljYWxseScsIHRydWUsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblNwcml0ZUFuaW1hdGlvbi5nZXRzZXQoJ3BsYXlBdXRvbWF0aWNhbGx5JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5QXV0b21hdGljYWxseTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wbGF5QXV0b21hdGljYWxseSA9IHZhbHVlO1xuICAgIH1cbik7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5pdGlhbGl6ZWQgPSAodGhpcy5fbmFtZVRvU3RhdGUgIT09IG51bGwpO1xuICAgIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGU7XG5cbiAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGUgPSB7fTtcbiAgICAgICAgdmFyIHN0YXRlID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1hdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjbGlwID0gdGhpcy5hbmltYXRpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGNsaXAgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZShjbGlwKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZVtzdGF0ZS5uYW1lXSA9IHN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdldEFuaW1TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24ubmFtZSkpIHtcbiAgICAgICAgICAgIHN0YXRlID0gbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZVtzdGF0ZS5uYW1lXSA9IHN0YXRlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5nZXRBbmltU3RhdGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lVG9TdGF0ZSAmJiB0aGlzLl9uYW1lVG9TdGF0ZVtuYW1lXTtcbn07XG5cbi8qKlxuICogaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW2FuaW1OYW1lXSAtIFRoZSBuYW1lIG9mIHRoZSBhbmltYXRpb25cbiAqL1xuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5pc1BsYXlpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwbGF5aW5nQW5pbSA9IHRoaXMuZW5hYmxlZCAmJiB0aGlzLl9jdXJBbmltYXRpb247XG4gICAgcmV0dXJuICEhcGxheWluZ0FuaW0gJiYgKCAhbmFtZSB8fCBwbGF5aW5nQW5pbS5uYW1lID09PSBuYW1lICk7XG59O1xuXG4vKipcbiAqIHBsYXkgQW5pbWF0aW9uXG4gKiBAcGFyYW0ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfSBbYW5pbVN0YXRlfGFuaW1OYW1lXSAtIFRoZSBhbmltU3RhdGUgb2YgdGhlIFNwcml0ZUFuaW1hdGlvblN0YXRlXG4gKiBAcGFyYW0ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfSBbYW5pbVN0YXRlXSAtIFRoZSB0aW1lIG9mIHRoZSBhbmltYXRpb24gdGltZVxuICovXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoYW5pbVN0YXRlLCB0aW1lKSB7XG4gICAgaWYgKHR5cGVvZiBhbmltU3RhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbVN0YXRlKGFuaW1TdGF0ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBhbmltU3RhdGUgfHwgbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRpbWUgfHwgMDtcbiAgICAgICAgdGhpcy5fcGxheVN0YXJ0RnJhbWUgPSBGaXJlLlRpbWUuZnJhbWVDb3VudDtcbiAgICAgICAgdGhpcy5zYW1wbGUoKTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5QXV0b21hdGljYWxseSAmJiB0aGlzLmRlZmF1bHRBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBhbmltU3RhdGUgPSB0aGlzLmdldEFuaW1TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24ubmFtZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXkoYW5pbVN0YXRlLCAwKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUubGF0ZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsICYmIEZpcmUuVGltZS5mcmFtZUNvdW50ID4gdGhpcy5fcGxheVN0YXJ0RnJhbWUpIHtcbiAgICAgICAgdmFyIGRlbHRhID0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgdGhpcy5zdGVwKGRlbHRhKTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbiAoZGVsdGFUaW1lKSB7XG4gICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSArPSBkZWx0YVRpbWU7XG4gICAgICAgIHRoaXMuc2FtcGxlKCk7XG4gICAgICAgIHZhciBzdG9wID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuT25jZSB8fFxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHQgfHxcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQgPiAwICYmIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA+PSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgLyB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZVJhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA8IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG8gc3RvcFxuICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKHRoaXMuX2N1ckFuaW1hdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5zYW1wbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9jdXJBbmltYXRpb24uZ2V0Q3VycmVudEluZGV4KCk7XG4gICAgICAgIGlmIChuZXdJbmRleCA+PSAwICYmIG5ld0luZGV4ICE9IHRoaXMuX2N1ckluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZUluZm9zW25ld0luZGV4XS5zcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSBuZXdJbmRleDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGFuaW1TdGF0ZSkge1xuICAgIGlmIChhbmltU3RhdGUgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKGFuaW1TdGF0ZSA9PT0gdGhpcy5fY3VyQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGFuaW1TdGF0ZS50aW1lID0gMDtcblxuICAgICAgICB2YXIgc3RvcEFjdGlvbiA9IGFuaW1TdGF0ZS5zdG9wQWN0aW9uO1xuICAgICAgICBzd2l0Y2ggKHN0b3BBY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRvTm90aGluZzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlZmF1bHRTcHJpdGU6XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlID0gdGhpcy5fZGVmYXVsdFNwcml0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkhpZGU6XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRGVzdHJveTpcblxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcbiAgICB9XG59O1xuXG5GaXJlLlNwcml0ZUFuaW1hdGlvbiA9IFNwcml0ZUFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb247XG5cbkZpcmUuX1JGcG9wKCk7Il19
