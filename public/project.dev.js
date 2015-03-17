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
    this.jumpAuido = Fire.Entity.find('/Audio/Jump_Fever').getComponent(Fire.AudioSource);
    this.readyAuido = Fire.Entity.find('/Audio/Start_Announce').getComponent(Fire.AudioSource);
};

AudioControl.playJump = function () {
    this.jumpAuido.play();
};

AudioControl.playReadyGameBg = function () {
    this.readyAuido.play();
    this.readyAuido.onEnd = function () {
        this.gameAuido.loop = true;
        this.gameAuido.play();
    }.bind(this);
};

AudioControl.playHit = function () {
    this.hitAuido.play();
};

AudioControl.playPoint = function () {
    this.pointAuido.play();
};

AudioControl.playDie = function () {
    this.dieAuido.play();
};

module.exports = AudioControl;

Fire._RFpop();
},{}],"Collision":[function(require,module,exports){
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
        Game.instance.reset();
        scoreValue.text = "0";
        this.entity.active = false;
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

    this.bg = Fire.Entity.find('/bg').getComponent(Floor);
    this.floor = Fire.Entity.find('/floor').getComponent(Floor);
    this.sheep = Fire.Entity.find('/sheep').getComponent(Sheep);

    Fire.Input.on('mousedown', function (event) {
        if (this.gameState === GameState.over) {
            return;
        }
        var Sheep = require('Sheep');
        this.sheep.anim.play(this.sheep.jumpAnimState, 0);
        this.sheep.sheepState = Sheep.SheepState.jump;
        this.sheep.tempSpeed = this.sheep.speed;
        AudioControl.playJump();
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
    this.gameState = GameState.run;
    AudioControl.playReadyGameBg();
    AudioControl.gameOverAuido.stop();
    AudioControl.hitAuido.stop();
};

Game.prototype.update = function () {

    //-- 绵羊的更新
    this.sheep.onRefresh();

    switch (this.gameState) {
        case GameState.ready:
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

Fire._RFpop();
},{"AudioControl":"AudioControl","Collision":"Collision","Floor":"Floor","GameOverWindow":"GameOverWindow","Sheep":"Sheep"}],"PipeGroup":[function(require,module,exports){
Fire._RFpush(module, '004ccda08e9349389d905b1f21bf9f6a', 'PipeGroup');
// script/PipeGroup.js

var PipeGroup = Fire.extend(Fire.Component, function () {
    //-- 基础移动速度
    this.speed_ = 100;
    //-- ( Beyond this range will be destroyed ) 超出这个范围就会被销毁
    this.range_ = -600;
    //-- 最大间距
    this.maxSpacing = 300;
    //-- 最小间距
    this.minSpacing = 210; //250;
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

var SheepState = (function (t) {
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

                if(this.entity.transform.y > 0){
                    this.entity.transform.rotation = this.dieRotation;
                }
            }
            break;
        default:
            break;
    }
};

module.exports = Sheep;

Fire._RFpop();
},{}],"audio-clip":[function(require,module,exports){
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
               this._volume = Math.clamp(value);
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

SpriteAnimation.prop('defaultAnimation', null , Fire.ObjectType(SpriteAnimationClip));

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

SpriteAnimation.prototype.getAnimState = function ( name ){
    return this._nameToState && this._nameToState[name];
};

/**
 * indicates whether the animation is playing
 * @param {string} [animName] - The name of the animation
 */
SpriteAnimation.prototype.isPlaying = function ( name ) {
    var playingAnim = this.enabled && this._curAnimation;
    return !!playingAnim && ( !name || playingAnim.name === name );
};

SpriteAnimation.prototype.play = function (animState, time) {
    this._curAnimation = animState;
    if (this._curAnimation !== null) {
        this._curIndex = -1;
        this._curAnimation.time = time;
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
    if ( animState !== null ) {
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
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["audio-clip","audio-legacy","audio-source","audio-web-audio","sprite-animation-clip","sprite-animation-state","sprite-animation","AudioControl","Collision","Floor","Game","GameOverWindow","PipeGroup","Sheep"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0F1ZGlvQ29udHJvbC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0NvbGxpc2lvbi5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0Zsb29yLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvR2FtZU92ZXJXaW5kb3cuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NjcmlwdC9HYW1lLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvUGlwZUdyb3VwLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvU2hlZXAuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby1jbGlwLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zcmMvYXVkaW8tbGVnYWN5LmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zcmMvYXVkaW8tc291cmNlLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zcmMvYXVkaW8td2ViLWF1ZGlvLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zcHJpdGUtYW5pbWF0aW9uLWNsaXAuanMiLCIuLi8uLi8uLi9kZXYvYmluL3Nwcml0ZS1hbmltYXRpb24tc3RhdGUuanMiLCIuLi8uLi8uLi9kZXYvYmluL3Nwcml0ZS1hbmltYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdkODA1Yjk0NzUxZWM0ZTc5ODQ4MGZmOGI3MjdiMWQwMycsICdBdWRpb0NvbnRyb2wnKTtcbi8vIHNjcmlwdC9BdWRpb0NvbnRyb2wuanNcblxuLy8gQXVkaW9Db250cm9sXG52YXIgQXVkaW9Db250cm9sID0ge307XG5cbkF1ZGlvQ29udHJvbC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g6Z+z5pWIIO+8iOaSnuWIsO+8ie+8iOW+l+WIhu+8iSjlpLHotKUpXG4gICAgdGhpcy5oaXRBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9zZnhfaGl0JykuZ2V0Q29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuICAgIHRoaXMucG9pbnRBdWlkbyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9zZnhfcG9pbnQnKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5nYW1lQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vR2FtZXBsYXlfTG9vcF8wMycpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbiAgICB0aGlzLmdhbWVPdmVyQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vR2FtZU92ZXInKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgdGhpcy5qdW1wQXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vSnVtcF9GZXZlcicpLmdldENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcbiAgICB0aGlzLnJlYWR5QXVpZG8gPSBGaXJlLkVudGl0eS5maW5kKCcvQXVkaW8vU3RhcnRfQW5ub3VuY2UnKS5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG59O1xuXG5BdWRpb0NvbnRyb2wucGxheUp1bXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5qdW1wQXVpZG8ucGxheSgpO1xufTtcblxuQXVkaW9Db250cm9sLnBsYXlSZWFkeUdhbWVCZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlYWR5QXVpZG8ucGxheSgpO1xuICAgIHRoaXMucmVhZHlBdWlkby5vbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nYW1lQXVpZG8ubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2FtZUF1aWRvLnBsYXkoKTtcbiAgICB9LmJpbmQodGhpcyk7XG59O1xuXG5BdWRpb0NvbnRyb2wucGxheUhpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmhpdEF1aWRvLnBsYXkoKTtcbn07XG5cbkF1ZGlvQ29udHJvbC5wbGF5UG9pbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wb2ludEF1aWRvLnBsYXkoKTtcbn07XG5cbkF1ZGlvQ29udHJvbC5wbGF5RGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGllQXVpZG8ucGxheSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0NvbnRyb2w7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2ZlZjkwY2U2ZjZiZDRlMzhhYmQ2NGU2MDhiYzExM2M1JywgJ0NvbGxpc2lvbicpO1xuLy8gc2NyaXB0L0NvbGxpc2lvbi5qc1xuXG52YXIgQ29sbGlzaW9uID0ge1xuICAgIC8vLS0g5qOA5rWL56Kw5pKeXG4gICAgY29sbGlzaW9uRGV0ZWN0aW9uOiBmdW5jdGlvbiAoc2hlZXAsIHBpcGVHcm91cExpc3QpIHtcbiAgICAgICAgaWYgKHBpcGVHcm91cExpc3QgJiYgcGlwZUdyb3VwTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGlwZUdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuXG4gICAgICAgICAgICAgICAgLy8tLSDnu7XnvornmoTlm5vkuKrpnaLnmoTlnZDmoIdcbiAgICAgICAgICAgICAgICB2YXIgc2hlZXBUb3AgPSAoc2hlZXAudHJhbnNmb3JtLnkgKyBzaGVlcC5zaGVlcFNwcml0UmVuZGVyLmhlaWdodCAvIDIgKTtcbiAgICAgICAgICAgICAgICB2YXIgc2hlZXBCb3R0b20gPSAoc2hlZXAudHJhbnNmb3JtLnkgLSBzaGVlcC5zaGVlcFNwcml0UmVuZGVyLmhlaWdodCAvIDIgKTtcbiAgICAgICAgICAgICAgICB2YXIgc2hlZXBMZWZ0ID0gKHNoZWVwLnRyYW5zZm9ybS54IC0gc2hlZXAuc2hlZXBTcHJpdFJlbmRlci53aWR0aCAvIDIgKTtcbiAgICAgICAgICAgICAgICB2YXIgc2hlZXBSaWdodCA9IChzaGVlcC50cmFuc2Zvcm0ueCArIHNoZWVwLnNoZWVwU3ByaXRSZW5kZXIud2lkdGggLyAyICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5ID0gcGlwZUdyb3VwTGlzdFtpXTtcbiAgICAgICAgICAgICAgICB2YXIgYm90dG9tUGlwZSA9IHBpcGVHcm91cEVudGl0eS5maW5kKCdib3R0b21QaXBlJyk7XG4gICAgICAgICAgICAgICAgdmFyIHRvcFBpcGUgPSBwaXBlR3JvdXBFbnRpdHkuZmluZCgndG9wUGlwZScpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBpcGVSZW5kZXIsIHBpcGVUb3AsIHBpcGVCb3R0b20sIHBpcGVMZWZ0LCBwaXBlUmlnaHQ7XG4gICAgICAgICAgICAgICAgaWYgKGJvdHRvbVBpcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGlwZVJlbmRlciA9IGJvdHRvbVBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlVG9wID0gYm90dG9tUGlwZS50cmFuc2Zvcm0ueSArIChwaXBlUmVuZGVyLmhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICBwaXBlTGVmdCA9IHBpcGVHcm91cEVudGl0eS50cmFuc2Zvcm0ueCAtIChwaXBlUmVuZGVyLndpZHRoIC8gMiAtIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZVJpZ2h0ID0gcGlwZUdyb3VwRW50aXR5LnRyYW5zZm9ybS54ICsgKHBpcGVSZW5kZXIud2lkdGggLyAyIC0gMzApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hlZXBCb3R0b20gPCBwaXBlVG9wICYmICgoc2hlZXBMZWZ0IDwgcGlwZVJpZ2h0ICYmIHNoZWVwUmlnaHQgPiBwaXBlUmlnaHQpIHx8IChzaGVlcFJpZ2h0ID4gcGlwZUxlZnQgJiYgc2hlZXBSaWdodCA8IHBpcGVSaWdodCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodG9wUGlwZSkge1xuICAgICAgICAgICAgICAgICAgICBwaXBlUmVuZGVyID0gdG9wUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVCb3R0b20gPSB0b3BQaXBlLnRyYW5zZm9ybS55IC0gKHBpcGVSZW5kZXIuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVMZWZ0ID0gcGlwZUdyb3VwRW50aXR5LnRyYW5zZm9ybS54IC0gKHBpcGVSZW5kZXIud2lkdGggLyAyIC0gMzApO1xuICAgICAgICAgICAgICAgICAgICBwaXBlUmlnaHQgPSBwaXBlR3JvdXBFbnRpdHkudHJhbnNmb3JtLnggKyAocGlwZVJlbmRlci53aWR0aCAvIDIgLSAzMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGVlcFRvcCA+IHBpcGVCb3R0b20gJiYgKChzaGVlcExlZnQgPCBwaXBlUmlnaHQgJiYgc2hlZXBSaWdodCA+IHBpcGVSaWdodCkgfHwgKHNoZWVwUmlnaHQgPiBwaXBlTGVmdCAmJiBzaGVlcFJpZ2h0IDwgcGlwZVJpZ2h0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdiNWM3YTI1MzBmMDY0Mjc0OGY1Y2JlZTI1Mjg0OTI4MScsICdGbG9vcicpO1xuLy8gc2NyaXB0L0Zsb29yLmpzXG5cbnZhciBGbG9vciA9IEZpcmUuZXh0ZW5kKEZpcmUuQ29tcG9uZW50KTtcbi8vc3BlZWRcbkZsb29yLnByb3AoJ3NwZWVkJywgMzAwKTtcblxuRmxvb3IucHJvcCgneCcsIC04NTgpO1xuXG5GbG9vci5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKGdhbWVTcGVlZCkge1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS54IC09IChGaXJlLlRpbWUuZGVsdGFUaW1lICogKCB0aGlzLnNwZWVkICsgZ2FtZVNwZWVkICkpO1xuICAgIGlmICh0aGlzLmVudGl0eS50cmFuc2Zvcm0ueCA8IHRoaXMueCkge1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueCA9IDA7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vcjtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnM2YwYmE4ZmEwNTdhNDdkYWE1ZTIzNzQ3NDFmMGI4ZGYnLCAnR2FtZU92ZXJXaW5kb3cnKTtcbi8vIHNjcmlwdC9HYW1lT3ZlcldpbmRvdy5qc1xuXG52YXIgR2FtZU92ZXJXaW5kb3cgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3RpdGxlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3BhbmVsJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ2J0bl9wbGF5JywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3AoJ3Njb3JlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWVPdmVyV2luZG93LnByb3RvdHlwZS5vblJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEdhbWUgPSByZXF1aXJlKCdHYW1lJyk7XG4gICAgdmFyIHNjb3JlVmFsdWUgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xuICAgIHNjb3JlVmFsdWUudGV4dCA9IEdhbWUuaW5zdGFuY2UuZnJhY3Rpb247XG4gICAgdGhpcy5idG5fcGxheS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgR2FtZS5pbnN0YW5jZS5yZXNldCgpO1xuICAgICAgICBzY29yZVZhbHVlLnRleHQgPSBcIjBcIjtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnRpdGxlLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgMjUwKTtcbiAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgLTIwMCk7XG59O1xuXG5HYW1lT3ZlcldpbmRvdy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRpdGxlLnRyYW5zZm9ybS55ID4gMTAwKSB7XG4gICAgICAgIHRoaXMudGl0bGUudHJhbnNmb3JtLnkgLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDYwMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUudHJhbnNmb3JtLnkgPSAxMDA7XG4gICAgfVxuICAgIGlmICh0aGlzLnBhbmVsLnRyYW5zZm9ybS55IDwgMCkge1xuICAgICAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS55ICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiA2MDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBhbmVsLnRyYW5zZm9ybS55ID0gMDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPdmVyV2luZG93O1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmYzk5MWRkNzAwMzM0YjgwOWQ0MWM4YTg2YTcwMmU1OScsICdHYW1lJyk7XG4vLyBzY3JpcHQvR2FtZS5qc1xuXG52YXIgU2hlZXAgPSByZXF1aXJlKCdTaGVlcCcpO1xudmFyIEZsb29yID0gcmVxdWlyZSgnRmxvb3InKTtcbnZhciBDb2xsaXNpb24gPSByZXF1aXJlKCdDb2xsaXNpb24nKTtcbnZhciBHYW1lT3ZlcldpbmRvdyA9IHJlcXVpcmUoJ0dhbWVPdmVyV2luZG93Jyk7XG52YXIgQXVkaW9Db250cm9sID0gcmVxdWlyZSgnQXVkaW9Db250cm9sJyk7XG5cbnZhciBHYW1lU3RhdGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3QucmVhZHkgPSAwXSA9ICdyZWFkeSc7XG4gICAgdFt0LnJ1biA9IDFdID0gJ3J1bic7XG4gICAgdFt0Lm92ZXIgPSAyXSA9ICdvdmVyJztcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxudmFyIEdhbWUgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIEdhbWUuaW5zdGFuY2UgPSB0aGlzO1xufSk7XG5cbkdhbWUuR2FtZVN0YXRlID0gR2FtZVN0YXRlO1xuXG5HYW1lLmluc3RhbmNlID0gbnVsbDtcblxuR2FtZS5wcm9wKCdjcmVhdGVQaXBlVGltZScsIDUpO1xuXG5HYW1lLnByb3AoJ2dhbWVTcGVlZCcsIDApO1xuXG4vLy0tIOe7tee+iuWIneWni1jlnZDmoIdcbkdhbWUucHJvcCgnaW5pdFNoZWVwUG9zJywgbmV3IEZpcmUuVmVjMig2MDAsIDApLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5WZWMyKSk7XG5cbi8vLS0g5Yib5bu65pe2566h6YGT5Yid5aeLWOWdkOagh1xuR2FtZS5wcm9wKCdpbml0UGlwZUdyb3VwUG9zJywgbmV3IEZpcmUuVmVjMig2MDAsIDApLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5WZWMyKSk7XG5cbkdhbWUucHJvcCgncGlwZUdyb3VwJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuRW50aXR5KSk7XG5cbkdhbWUucHJvcCgnYnRuX2NyZVBpcGUnLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5FbnRpdHkpKTtcblxuR2FtZS5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g5ri45oiP54q25oCBXG4gICAgdGhpcy5nYW1lU3RhdGUgPSBHYW1lU3RhdGUucnVuO1xuXG4gICAgdGhpcy5nYW1lT3ZlcldpbmRvdyA9IEZpcmUuRW50aXR5LmZpbmQoJy9HYW1lT3ZlcldpbmRvdycpO1xuXG4gICAgdGhpcy5iZyA9IEZpcmUuRW50aXR5LmZpbmQoJy9iZycpLmdldENvbXBvbmVudChGbG9vcik7XG4gICAgdGhpcy5mbG9vciA9IEZpcmUuRW50aXR5LmZpbmQoJy9mbG9vcicpLmdldENvbXBvbmVudChGbG9vcik7XG4gICAgdGhpcy5zaGVlcCA9IEZpcmUuRW50aXR5LmZpbmQoJy9zaGVlcCcpLmdldENvbXBvbmVudChTaGVlcCk7XG5cbiAgICBGaXJlLklucHV0Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZVN0YXRlID09PSBHYW1lU3RhdGUub3Zlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBTaGVlcCA9IHJlcXVpcmUoJ1NoZWVwJyk7XG4gICAgICAgIHRoaXMuc2hlZXAuYW5pbS5wbGF5KHRoaXMuc2hlZXAuanVtcEFuaW1TdGF0ZSwgMCk7XG4gICAgICAgIHRoaXMuc2hlZXAuc2hlZXBTdGF0ZSA9IFNoZWVwLlNoZWVwU3RhdGUuanVtcDtcbiAgICAgICAgdGhpcy5zaGVlcC50ZW1wU3BlZWQgPSB0aGlzLnNoZWVwLnNwZWVkO1xuICAgICAgICBBdWRpb0NvbnRyb2wucGxheUp1bXAoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5sYXN0VGltZSA9IDEwO1xuICAgIHRoaXMucGlwZUdyb3VwTGlzdCA9IFtdO1xuICAgIHRoaXMuZW50aXR5Lm9uKFwiZGVzdHJveS1QaXBlR3JvdXBcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnBpcGVHcm91cExpc3QpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMucGlwZUdyb3VwTGlzdC5pbmRleE9mKGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnBpcGVHcm91cExpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLy0tIOWIhuaVsFxuICAgIHRoaXMuZnJhY3Rpb24gPSAwO1xuICAgIHRoaXMuZnJhY3Rpb25CdG1wRm9udCA9IEZpcmUuRW50aXR5LmZpbmQoJy9mcmFjdGlvbicpLmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xuXG4gICAgLy8tLSDpn7PmlYhcbiAgICBBdWRpb0NvbnRyb2wuaW5pdCgpO1xufTtcblxuR2FtZS5wcm90b3R5cGUub25TdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWVPdmVyV2luZG93LmVuYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmZyYWN0aW9uID0gMDtcbiAgICB0aGlzLmZyYWN0aW9uQnRtcEZvbnQudGV4dCA9IHRoaXMuZnJhY3Rpb247XG4gICAgdGhpcy5sYXN0VGltZSA9IEZpcmUuVGltZS50aW1lICsgMTA7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucGlwZUdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICBpZiAoIXBpcGVHcm91cEVudGl0eSB8fCBwaXBlR3JvdXBFbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcGlwZUdyb3VwRW50aXR5LmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5waXBlR3JvdXBMaXN0ID0gW107XG4gICAgdGhpcy5zaGVlcC5pbml0KHRoaXMuaW5pdFNoZWVwUG9zKTtcbiAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5ydW47XG4gICAgQXVkaW9Db250cm9sLnBsYXlSZWFkeUdhbWVCZygpO1xuICAgIEF1ZGlvQ29udHJvbC5nYW1lT3ZlckF1aWRvLnN0b3AoKTtcbiAgICBBdWRpb0NvbnRyb2wuaGl0QXVpZG8uc3RvcCgpO1xufTtcblxuR2FtZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgLy8tLSDnu7XnvornmoTmm7TmlrBcbiAgICB0aGlzLnNoZWVwLm9uUmVmcmVzaCgpO1xuXG4gICAgc3dpdGNoICh0aGlzLmdhbWVTdGF0ZSkge1xuICAgICAgICBjYXNlIEdhbWVTdGF0ZS5yZWFkeTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdhbWVTdGF0ZS5ydW46XG4gICAgICAgICAgICB2YXIgZ2FtZU92ZXIgPSBDb2xsaXNpb24uY29sbGlzaW9uRGV0ZWN0aW9uKHRoaXMuc2hlZXAsIHRoaXMucGlwZUdyb3VwTGlzdCk7XG4gICAgICAgICAgICBpZiAoZ2FtZU92ZXIpIHtcbiAgICAgICAgICAgICAgICBBdWRpb0NvbnRyb2wuZ2FtZUF1aWRvLnN0b3AoKTtcbiAgICAgICAgICAgICAgICBBdWRpb0NvbnRyb2wuZ2FtZU92ZXJBdWlkby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLnBsYXlIaXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwLmFuaW0ucGxheSh0aGlzLnNoZWVwLmRpZUFuaW1TdGF0ZSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVlcC5zaGVlcFN0YXRlID0gU2hlZXAuU2hlZXBTdGF0ZS5kaWU7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lU3RhdGUgPSBHYW1lU3RhdGUub3ZlcjtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyV2luZG93LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcldpbmRvdy5nZXRDb21wb25lbnQoR2FtZU92ZXJXaW5kb3cpLm9uUmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vLS0g5q+P6L+H5LiA5q615pe26Ze05Yib5bu6566h6YGTXG4gICAgICAgICAgICB2YXIgY3VyVGltZSA9IE1hdGguYWJzKEZpcmUuVGltZS50aW1lIC0gdGhpcy5sYXN0VGltZSk7XG4gICAgICAgICAgICBpZiAoY3VyVGltZSA+PSB0aGlzLmNyZWF0ZVBpcGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGltZSA9IEZpcmUuVGltZS50aW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUGlwZUdyb3VwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLy0tIOiDjOaZr+WIt+aWsFxuICAgICAgICAgICAgdGhpcy5iZy5vblJlZnJlc2godGhpcy5nYW1lU3BlZWQpO1xuICAgICAgICAgICAgLy8tLSDlnLDmnb/liLfmlrBcbiAgICAgICAgICAgIHRoaXMuZmxvb3Iub25SZWZyZXNoKHRoaXMuZ2FtZVNwZWVkKTtcbiAgICAgICAgICAgIC8vLS0g566h6YGT5Yi35pawXG4gICAgICAgICAgICBpZiAodGhpcy5waXBlR3JvdXBMaXN0ICYmIHRoaXMucGlwZUdyb3VwTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLCBsZW4gPSB0aGlzLnBpcGVHcm91cExpc3QubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBwaXBlR3JvdXBFbnRpdHksIHBpcGVHcm9wQ29tcDtcbiAgICAgICAgICAgICAgICAvLy0tIOeuoemBk+WIt+aWsFxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBwaXBlR3JvdXBFbnRpdHkgPSB0aGlzLnBpcGVHcm91cExpc3RbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGlwZUdyb3VwRW50aXR5IHx8IHBpcGVHcm91cEVudGl0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwaXBlR3JvcENvbXAgPSBwaXBlR3JvdXBFbnRpdHkuZ2V0Q29tcG9uZW50KCdQaXBlR3JvdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgcGlwZUdyb3BDb21wLm9uUmVmcmVzaCh0aGlzLmdhbWVTcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vLS0g57u1576K6YCa6L+H566h6YGT55qE6K6h566XICYmIOiuoeeul+WIhuaVsFxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBwaXBlR3JvdXBFbnRpdHkgPSB0aGlzLnBpcGVHcm91cExpc3RbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGlwZUdyb3VwRW50aXR5IHx8IHBpcGVHcm91cEVudGl0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwaXBlR3JvcENvbXAgPSBwaXBlR3JvdXBFbnRpdHkuZ2V0Q29tcG9uZW50KCdQaXBlR3JvdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoZWVwWCA9ICh0aGlzLnNoZWVwLnRyYW5zZm9ybS54IC0gdGhpcy5zaGVlcC5zaGVlcFNwcml0UmVuZGVyLndpZHRoIC8gMiApO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGlwZUdyb3VwWCA9IChwaXBlR3JvdXBFbnRpdHkudHJhbnNmb3JtLnggKyBwaXBlR3JvcENvbXAucGlwZUdyb3VwV2l0aCAvIDIgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaXBlR3JvcENvbXAuaGFzUGFzc2VkICYmIHNoZWVwWCA+IHBpcGVHcm91cFgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVHcm9wQ29tcC5oYXNQYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFjdGlvbisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFjdGlvbkJ0bXBGb250LnRleHQgPSB0aGlzLmZyYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLnBsYXlQb2ludCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR2FtZVN0YXRlLm92ZXI6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG4vLy0tIOWIm+W7uueuoemBk+e7hFxuR2FtZS5wcm90b3R5cGUuY3JlYXRlUGlwZUdyb3VwID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbnRpdHkgPSBuZXcgRmlyZS5FbnRpdHkoKTtcbiAgICB2YXIgcGlwZUdyb3BDb21wID0gZW50aXR5LmFkZENvbXBvbmVudCgnUGlwZUdyb3VwJylcbiAgICBlbnRpdHkucGFyZW50ID0gdGhpcy5waXBlR3JvdXA7XG4gICAgZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuaW5pdFBpcGVHcm91cFBvcztcbiAgICBwaXBlR3JvcENvbXAuY3JlYXRlKCk7XG4gICAgdGhpcy5waXBlR3JvdXBMaXN0LnB1c2goZW50aXR5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMDA0Y2NkYTA4ZTkzNDkzODlkOTA1YjFmMjFiZjlmNmEnLCAnUGlwZUdyb3VwJyk7XG4vLyBzY3JpcHQvUGlwZUdyb3VwLmpzXG5cbnZhciBQaXBlR3JvdXAgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIC8vLS0g5Z+656GA56e75Yqo6YCf5bqmXG4gICAgdGhpcy5zcGVlZF8gPSAxMDA7XG4gICAgLy8tLSAoIEJleW9uZCB0aGlzIHJhbmdlIHdpbGwgYmUgZGVzdHJveWVkICkg6LaF5Ye66L+Z5Liq6IyD5Zu05bCx5Lya6KKr6ZSA5q+BXG4gICAgdGhpcy5yYW5nZV8gPSAtNjAwO1xuICAgIC8vLS0g5pyA5aSn6Ze06LedXG4gICAgdGhpcy5tYXhTcGFjaW5nID0gMzAwO1xuICAgIC8vLS0g5pyA5bCP6Ze06LedXG4gICAgdGhpcy5taW5TcGFjaW5nID0gMjEwOyAvLzI1MDtcbiAgICAvLy0tIOS4iuS4gOasoemaj+acuuWIsOeahOeuoemBk+exu+Wei1xuICAgIHRoaXMubGFzdFBpcGVUeXBlID0gbnVsbDtcbiAgICAvLy0tIOeuoemBk+eahOWuveW6plxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IDA7XG59KTtcblxuLy8tLSDnrqHpgZPnmoTnsbvlnotcbnZhciBQaXBlVHlwZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5Cb3R0b20gPSAwXSA9ICdib3R0b20nOyAgICAgICAgLy8g5LiK5pa5566h5a2QXG4gICAgdFt0LlRvcCA9IDFdID0gJ3RvcCc7ICAgICAgICAgICAvLyDkuIrmlrnnrqHlrZBcbiAgICB0W3QuRG91YmxlID0gMl0gPSAnZG91YmxlJzsgICAgICAgIC8vIOS4i+S4iuaWueeuoeWtkFxuICAgIHJldHVybiB0O1xufSkoe30pO1xuXG5QaXBlR3JvdXAucHJvcCgnaGFzUGFzc2VkJywgZmFsc2UpO1xuXG4vLy0tIOeuoemBk+exu+Wei1xuUGlwZUdyb3VwLnByb3AoJ3BpcGVUeXBlJywgUGlwZVR5cGUuVG9wLCBGaXJlLkVudW0oUGlwZVR5cGUpKTtcblxuLy8tLSDkuIrmlrnnrqHlrZDlnZDmoIfojIPlm7QgTWF4IOS4jiBNaW5cblBpcGVHcm91cC5wcm90b3R5cGUuVG9wUGlwZVBvc1JhbmdlID0gbmV3IEZpcmUuVmVjMig4MDAsIDcxMCk7XG5cbi8vLS0g5LiL5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLkJvdHRvbVBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoLTc1MCwgLTgwMCk7XG5cbi8vLS0g5Y+M5Liq5LiK5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1heCDkuI4gTWluXG5QaXBlR3JvdXAucHJvdG90eXBlLkRvdWJsZVRvcFBpcGVQb3NSYW5nZSA9IG5ldyBGaXJlLlZlYzIoMTA1MCwgNzEwKTtcblxuLy8tLSDlj4zkuKrkuIvmlrnnrqHlrZDlnZDmoIfojIPlm7QgTWF4IOS4jiBNaW5cblBpcGVHcm91cC5wcm90b3R5cGUuRG91YmxlQm90dG9tUGlwZVBvc1JhbmdlID0gbmV3IEZpcmUuVmVjMigtODAwLCAtOTgwKTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5waXBlID0gRmlyZS5FbnRpdHkuZmluZCgnL1ByZWZhYnMvcGlwZScpO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5yYW5kb21QaXBlVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmFuZG9tVmx1ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAxO1xuICAgIGlmIChyYW5kb21WbHVlID49IDEgJiYgcmFuZG9tVmx1ZSA8PSA2MCkge1xuICAgICAgICByZXR1cm4gUGlwZVR5cGUuRG91YmxlO1xuICAgIH1cbiAgICBlbHNlIGlmIChyYW5kb21WbHVlID49IDYwICYmIHJhbmRvbVZsdWUgPD0gODApIHtcbiAgICAgICAgcmV0dXJuIFBpcGVUeXBlLkJvdHRvbTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBQaXBlVHlwZS5Ub3A7XG4gICAgfVxufVxuXG5QaXBlR3JvdXAucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sYXN0UGlwZVR5cGUgIT09IG51bGwgJiYgdGhpcy5sYXN0UGlwZVR5cGUgPT09IFBpcGVUeXBlLlRvcCkge1xuICAgICAgICB3aGlsZSAodGhpcy5sYXN0UGlwZVR5cGUgPT09IHRoaXMucGlwZVR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMucGlwZVR5cGUgPSB0aGlzLnJhbmRvbVBpcGVUeXBlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGlwZVR5cGUgPSB0aGlzLnJhbmRvbVBpcGVUeXBlKCk7XG4gICAgICAgIC8vLS0g5Li65LqG5L2T6aqM77yM6Ziy5q2i56ys5LiA5qyh5Ye6546w55qE566h6YGT5piv5LiK5pa555qEXG4gICAgfVxuICAgIHRoaXMuZW50aXR5Lm5hbWUgPSBQaXBlVHlwZVt0aGlzLnBpcGVUeXBlXTtcbiAgICBzd2l0Y2ggKHRoaXMucGlwZVR5cGUpIHtcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Cb3R0b206XG4gICAgICAgICAgICB0aGlzLmluaXRCb3R0b21QaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Ub3A6XG4gICAgICAgICAgICB0aGlzLmluaXRUb3BQaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaXBlVHlwZS5Eb3VibGU6XG4gICAgICAgICAgICB0aGlzLmluaXREb3VibGVQaXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUuaW5pdFRvcFBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvcFBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIHRvcFBpcGVSZW5kZXIgPSB0b3BQaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICB2YXIgcmFuZG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Ub3BQaXBlUG9zUmFuZ2UueCwgdGhpcy5Ub3BQaXBlUG9zUmFuZ2UueSk7XG5cbiAgICB0b3BQaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21ZO1xuICAgIHRvcFBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IDE7XG4gICAgdG9wUGlwZS5uYW1lID0gJ3RvcFBpcGUnO1xuXG4gICAgdGhpcy5waXBlR3JvdXBXaXRoID0gdG9wUGlwZVJlbmRlci53aWR0aDtcbn07XG5cblBpcGVHcm91cC5wcm90b3R5cGUuaW5pdEJvdHRvbVBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJvdHRvbVBpcGUgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMucGlwZSk7XG4gICAgdmFyIGJvdHRvbVBpcGVSZW5kZXIgPSBib3R0b21QaXBlLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICB2YXIgcmFuZG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Cb3R0b21QaXBlUG9zUmFuZ2UueCwgdGhpcy5Cb3R0b21QaXBlUG9zUmFuZ2UueSk7XG5cbiAgICBib3R0b21QaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21ZO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IC0xO1xuICAgIGJvdHRvbVBpcGUubmFtZSA9ICdib3R0b21QaXBlJztcblxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IGJvdHRvbVBpcGVSZW5kZXIuc3ByaXRlLndpZHRoO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5pbml0RG91YmxlUGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9wUGlwZSA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5waXBlKTtcbiAgICB2YXIgYm90dG9tUGlwZSA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5waXBlKTtcbiAgICB2YXIgdG9wUGlwZVJlbmRlciA9IHRvcFBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgIHZhciBib3R0b21QaXBlUmVuZGVyID0gdG9wUGlwZS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG5cbiAgICB2YXIgcmFuZG9tVG9wWSA9IDA7XG4gICAgdmFyIHJhbmRvbUJvdHRvbVkgPSAwO1xuICAgIHZhciB0b3BZID0gMDtcbiAgICB2YXIgYm90dG9tWSA9IDA7XG4gICAgdmFyIHNwYWNpbmcgPSAwO1xuXG4gICAgd2hpbGUgKHNwYWNpbmcgPCB0aGlzLm1pblNwYWNpbmcgfHwgc3BhY2luZyA+IHRoaXMubWF4U3BhY2luZykge1xuICAgICAgICByYW5kb21Ub3BZID0gTWF0aC5yYW5kb21SYW5nZSh0aGlzLkRvdWJsZVRvcFBpcGVQb3NSYW5nZS54LCB0aGlzLkRvdWJsZVRvcFBpcGVQb3NSYW5nZS55KTtcbiAgICAgICAgcmFuZG9tQm90dG9tWSA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5Eb3VibGVCb3R0b21QaXBlUG9zUmFuZ2UueCwgdGhpcy5Eb3VibGVCb3R0b21QaXBlUG9zUmFuZ2UueSk7XG4gICAgICAgIHRvcFkgPSByYW5kb21Ub3BZIC0gKHRvcFBpcGVSZW5kZXIuc3ByaXRlLmhlaWdodCAvIDIpO1xuICAgICAgICBib3R0b21ZID0gcmFuZG9tQm90dG9tWSArIChib3R0b21QaXBlUmVuZGVyLnNwcml0ZS5oZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKHRvcFkgPCAwIHx8IGJvdHRvbVkgPiAwKSB7XG4gICAgICAgICAgICBzcGFjaW5nID0gTWF0aC5hYnModG9wWSkgLSBNYXRoLmFicyhib3R0b21ZKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNwYWNpbmcgPSBNYXRoLmFicyh0b3BZKSArIE1hdGguYWJzKGJvdHRvbVkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvcFBpcGUucGFyZW50ID0gdGhpcy5lbnRpdHk7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0ueCA9IDA7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0ueSA9IHJhbmRvbVRvcFk7XG4gICAgdG9wUGlwZS50cmFuc2Zvcm0uc2NhbGVZID0gMTtcbiAgICB0b3BQaXBlLm5hbWUgPSAndG9wUGlwZSc7XG5cbiAgICBib3R0b21QaXBlLnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnggPSAwO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnkgPSByYW5kb21Cb3R0b21ZO1xuICAgIGJvdHRvbVBpcGUudHJhbnNmb3JtLnNjYWxlWSA9IC0xO1xuICAgIGJvdHRvbVBpcGUubmFtZSA9ICdib3R0b21QaXBlJztcblxuICAgIHRoaXMucGlwZUdyb3VwV2l0aCA9IGJvdHRvbVBpcGVSZW5kZXIuc3ByaXRlLndpZHRoO1xufTtcblxuUGlwZUdyb3VwLnByb3RvdHlwZS5vblJlZnJlc2ggPSBmdW5jdGlvbiAoZ2FtZVNwZWVkKSB7XG4gICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnggLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqICggdGhpcy5zcGVlZF8gKyBnYW1lU3BlZWQgKTtcbiAgICBpZiAodGhpcy5lbnRpdHkudHJhbnNmb3JtLnggPCB0aGlzLnJhbmdlXykge1xuICAgICAgICB0aGlzLmVudGl0eS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuZW50aXR5LmRpc3BhdGNoRXZlbnQobmV3IEZpcmUuRXZlbnQoXCJkZXN0cm95LVBpcGVHcm91cFwiLCB0cnVlKSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXBlR3JvdXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzA2NjMzYzBhYTkzNTRjZTlhZDRhZjg2ZGJhZGFhZDUwJywgJ1NoZWVwJyk7XG4vLyBzY3JpcHQvU2hlZXAuanNcblxudmFyIFNoZWVwU3RhdGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3QucnVuID0gMF0gPSAncnVuJztcbiAgICB0W3QuanVtcCA9IDFdID0gJ2p1bXAnO1xuICAgIHRbdC5kcm9wID0gMl0gPSAnZHJvcCc7XG4gICAgdFt0LmRvd24gPSAzXSA9ICdkb3duJztcbiAgICB0W3QuZGllID0gNF0gPSAnZGllJ1xuICAgIHJldHVybiB0O1xufSkoe30pO1xuXG52YXIgU2hlZXAgPSBGaXJlLmV4dGVuZChGaXJlLkNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2t5TWF4WSA9IDI1MDsvLzE2MDtcbiAgICB0aGlzLmFuaW0gPSBudWxsO1xuICAgIHRoaXMuc2hlZXBTcHJpdFJlbmRlciA9IDA7XG4gICAgdGhpcy5ydW5BbmltU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuanVtcEFuaW1TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5kcm9wQW5pbVN0YXRlID0gbnVsbDtcbiAgICB0aGlzLmRvd25BbmltU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuZGllQW5pbVN0YXRlID0gbnVsbDtcbiAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLnJ1bjtcbiAgICB0aGlzLnRlbXBTcGVlZCA9IDA7XG59KTtcblxuU2hlZXAuU2hlZXBTdGF0ZSA9IFNoZWVwU3RhdGU7XG5cblNoZWVwLnByb3AoJ2dyYXZpdHknLCA5LjgpO1xuXG5TaGVlcC5wcm9wKCdzcGVlZCcsIDMwMCk7XG5cblNoZWVwLnByb3AoJ2ZMb29yQ29vcmRpbmF0ZXMnLCAtMTgwKTtcblxuU2hlZXAucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW0gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVBbmltYXRpb24pO1xuICAgIHRoaXMucnVuQW5pbVN0YXRlID0gdGhpcy5hbmltLmdldEFuaW1TdGF0ZSgnc2hlZXBfcnVuJyk7XG4gICAgdGhpcy5qdW1wQW5pbVN0YXRlID0gdGhpcy5hbmltLmdldEFuaW1TdGF0ZSgnc2hlZXBfanVtcCcpO1xuICAgIHRoaXMuZHJvcEFuaW1TdGF0ZSA9IHRoaXMuYW5pbS5nZXRBbmltU3RhdGUoJ3NoZWVwX2Ryb3AnKTtcbiAgICB0aGlzLmRvd25BbmltU3RhdGUgPSB0aGlzLmFuaW0uZ2V0QW5pbVN0YXRlKCdzaGVlcF9kb3duJyk7XG4gICAgdGhpcy5kaWVBbmltU3RhdGUgPSB0aGlzLmFuaW0uZ2V0QW5pbVN0YXRlKCdzaGVlcF9kaWUnKTtcblxuICAgIHRoaXMuc2hlZXBTcHJpdFJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcblxuICAgIHRoaXMuZGllUm90YXRpb24gPSAtODg7XG59O1xuXG5TaGVlcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24gPSAwO1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICB0aGlzLmFuaW0ucGxheSh0aGlzLnJ1bkFuaW1TdGF0ZSwgMCk7XG4gICAgdGhpcy5zaGVlcFN0YXRlID0gU2hlZXBTdGF0ZS5ydW47XG59O1xuXG5TaGVlcC5wcm90b3R5cGUub25SZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMuc2hlZXBTdGF0ZSAhPT0gU2hlZXBTdGF0ZS5ydW4pIHtcbiAgICAgICAgdGhpcy50ZW1wU3BlZWQgLT0gKEZpcmUuVGltZS5kZWx0YVRpbWUgKiAxMDApICogdGhpcy5ncmF2aXR5O1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5zaGVlcFN0YXRlKSB7XG4gICAgICAgIGNhc2UgU2hlZXBTdGF0ZS5ydW46XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmp1bXA6XG4gICAgICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy50ZW1wU3BlZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy50ZW1wU3BlZWQgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltLnBsYXkodGhpcy5kcm9wQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLmRyb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmRyb3A6XG4gICAgICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ueSArPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy50ZW1wU3BlZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgPD0gdGhpcy5mTG9vckNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgPSB0aGlzLmZMb29yQ29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltLnBsYXkodGhpcy5kb3duQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLmRvd247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTaGVlcFN0YXRlLmRvd246XG4gICAgICAgICAgICBpZiAodGhpcy5kb3duQW5pbVN0YXRlICYmICF0aGlzLmFuaW0uaXNQbGF5aW5nKHRoaXMuZG93bkFuaW1TdGF0ZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbS5wbGF5KHRoaXMucnVuQW5pbVN0YXRlLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWVwU3RhdGUgPSBTaGVlcFN0YXRlLnJ1bjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNoZWVwU3RhdGUuZGllOlxuICAgICAgICAgICAgaWYgKHRoaXMuZW50aXR5LnRyYW5zZm9ybS55ID4gdGhpcy5mTG9vckNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMudGVtcFNwZWVkO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5lbnRpdHkudHJhbnNmb3JtLnkgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnJvdGF0aW9uID0gdGhpcy5kaWVSb3RhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hlZXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWNsaXAnKTtcbi8vIHNyYy9hdWRpby1jbGlwLmpzXG5cbkZpcmUuQXVkaW9DbGlwID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgQXVkaW9DbGlwID0gRmlyZS5leHRlbmQoXCJGaXJlLkF1ZGlvQ2xpcFwiLCBGaXJlLkFzc2V0KTtcblxuICAgIEF1ZGlvQ2xpcC5wcm9wKCdyYXdEYXRhJywgbnVsbCwgRmlyZS5SYXdUeXBlKCdhdWRpbycpKTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoJ2J1ZmZlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBCdWZmZXIodGhpcyk7XG4gICAgfSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImxlbmd0aFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcInNhbXBsZXNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXModGhpcyk7XG4gICAgfSk7XG5cbiAgICBBdWRpb0NsaXAuZ2V0KFwiY2hhbm5lbHNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImZyZXF1ZW5jeVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwRnJlcXVlbmN5KHRoaXMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEF1ZGlvQ2xpcDtcbn0pKCk7XG5cbi8vIGNyZWF0ZSBlbnRpdHkgYWN0aW9uXG4vLyBAaWYgRURJVE9SXG5GaXJlLkF1ZGlvQ2xpcC5wcm90b3R5cGUuY3JlYXRlRW50aXR5ID0gZnVuY3Rpb24gKCBjYiApIHtcbiAgICB2YXIgZW50ID0gbmV3IEZpcmUuRW50aXR5KHRoaXMubmFtZSk7XG5cbiAgICB2YXIgYXVkaW9Tb3VyY2UgPSBlbnQuYWRkQ29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuXG4gICAgYXVkaW9Tb3VyY2UuY2xpcCA9IHRoaXM7XG5cbiAgICBpZiAoIGNiIClcbiAgICAgICAgY2IgKGVudCk7XG59O1xuLy8gQGVuZGlmXG5cbm1vZHVsZS5leHBvcnRzID0gRmlyZS5BdWRpb0NsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWxlZ2FjeScpO1xuLy8gc3JjL2F1ZGlvLWxlZ2FjeS5qc1xuXG4oZnVuY3Rpb24oKXtcbiAgICB2YXIgVXNlV2ViQXVkaW8gPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQpO1xuICAgIGlmIChVc2VXZWJBdWRpbykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBBdWRpb0NvbnRleHQgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGxvYWRlciAodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xuICAgICAgICB2YXIgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XG4gICAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBhdWRpbyk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZSwgbnVsbCk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICBhdWRpby5zcmMgPSB1cmw7XG4gICAgICAgIGF1ZGlvLmxvYWQoKTtcbiAgICB9XG5cbiAgICBGaXJlLkxvYWRNYW5hZ2VyLnJlZ2lzdGVyUmF3VHlwZXMoJ2F1ZGlvJywgbG9hZGVyKTtcblxuICAgIEF1ZGlvQ29udGV4dC5pbml0U291cmNlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuX2F1ZGlvID0gbnVsbDtcbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LmdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5fYXVkaW8gJiYgdGFyZ2V0Ll9wbGF5aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVUaW1lID0gZnVuY3Rpb24gKHRhcmdldCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuX2F1ZGlvKSB7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSB0YXJnZXQuX2F1ZGlvLmR1cmF0aW9uO1xuICAgICAgICAgICAgdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIOmdnOmfs1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVNdXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5tdXRlZCA9IHRhcmdldC5tdXRlO1xuICAgIH07XG5cbiAgICAvLyDorr7nva7pn7Pph4/vvIzpn7Pph4/ojIPlm7TmmK9bMCwgMV1cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlVm9sdW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby52b2x1bWUgPSB0YXJnZXQudm9sdW1lO1xuICAgIH07XG5cbiAgICAvLyDorr7nva7lvqrnjq9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTG9vcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ubG9vcCA9IHRhcmdldC5sb29wO1xuICAgIH07XG5cbiAgICAvLyDlsIbpn7PkuZDmupDoioLngrnnu5HlrprlhbfkvZPnmoTpn7PpopFidWZmZXJcbiAgICBBdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsaXApIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8gPSB0YXJnZXQuY2xpcC5yYXdEYXRhO1xuICAgIH07XG5cbiAgICAvLyDmmqvlgZxcbiAgICBBdWRpb0NvbnRleHQucGF1c2UgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5wYXVzZSgpO1xuICAgIH07XG5cbiAgICAvLyDlgZzmraJcbiAgICBBdWRpb0NvbnRleHQuc3RvcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBhdXNlKCk7XG4gICAgICAgIHRhcmdldC5fYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgIH07XG5cbiAgICAvLyDmkq3mlL5cbiAgICBBdWRpb0NvbnRleHQucGxheSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5jbGlwIHx8ICF0YXJnZXQuY2xpcC5yYXdEYXRhKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodGFyZ2V0Ll9wbGF5aW5nICYmICF0YXJnZXQuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgICAgICAgdGhpcy51cGRhdGVBdWRpb0NsaXAodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVWb2x1bWUodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVMb29wKHRhcmdldCk7XG4gICAgICAgIHRoaXMudXBkYXRlTXV0ZSh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBsYXkoKTtcblxuICAgICAgICAvLyDmkq3mlL7nu5PmnZ/lkI7nmoTlm57osINcbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRhcmdldC5vblBsYXlFbmQuYmluZCh0YXJnZXQpO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vIOiOt+W+l+mfs+mikeWJqui+keeahCBidWZmZXJcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlciA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g5Lul56eS5Li65Y2V5L2NIOiOt+WPlumfs+mikeWJqui+keeahCDplb/luqZcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcExlbmd0aCA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuY2xpcC5yYXdEYXRhLmR1cmF0aW9uO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTplb/luqZcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXMgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE5aOw6YGT5pWwXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTph4fmoLfpopHnjodcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEZyZXF1ZW5jeSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cblxuICAgIEZpcmUuQXVkaW9Db250ZXh0ID0gQXVkaW9Db250ZXh0O1xufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8tc291cmNlJyk7XG4vLyBzcmMvYXVkaW8tc291cmNlLmpzXG5cbnZhciBBdWRpb1NvdXJjZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEF1ZGlvU291cmNlID0gRmlyZS5leHRlbmQoXCJGaXJlLkF1ZGlvU291cmNlXCIsIEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTsgLy8tLSDlo7DmupDmmoLlgZzmiJbogIXlgZzmraLml7blgJnkuLpmYWxzZVxuICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTsvLy0tIOadpeWMuuWIhuWjsOa6kOaYr+aaguWBnOi/mOaYr+WBnOatolxuXG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RQbGF5ID0gMDtcblxuICAgICAgICB0aGlzLl9idWZmU291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdm9sdW1lR2FpbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5vbkVuZCA9IG51bGw7XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEZpcmUuYWRkQ29tcG9uZW50TWVudShBdWRpb1NvdXJjZSwgJ0F1ZGlvU291cmNlJyk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsIFwiaXNQbGF5aW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXVkaW9Tb3VyY2UucHJvdG90eXBlLCBcImlzUGF1c2VkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsICd0aW1lJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUodGhpcywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ19wbGF5YmFja1JhdGUnLCAxLjAsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3BsYXliYWNrUmF0ZScsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wbGF5YmFja1JhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXliYWNrUmF0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5YmFja1JhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy9cbiAgICBBdWRpb1NvdXJjZS5wcm9wKCdfY2xpcCcsIG51bGwsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ2NsaXAnLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xpcDtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBGaXJlLk9iamVjdFR5cGUoRmlyZS5BdWRpb0NsaXApXG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX2xvb3AnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbG9vcCcsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9vcDtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbG9vcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX211dGUnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbXV0ZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbXV0ZTtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbXV0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX211dGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX3ZvbHVtZScsIDEsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3ZvbHVtZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fdm9sdW1lO1xuICAgICAgIH0sXG4gICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgIGlmICh0aGlzLl92b2x1bWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICB0aGlzLl92b2x1bWUgPSBNYXRoLmNsYW1wKHZhbHVlKTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSh0aGlzKTtcbiAgICAgICAgICAgfVxuICAgICAgIH0sXG4gICAgICAgRmlyZS5SYW5nZSgwLDEpXG4gICAgKTtcblxuICAgIEF1ZGlvU291cmNlLnByb3AoJ3BsYXlPbkF3YWtlJywgdHJ1ZSk7XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUub25QbGF5RW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHRoaXMub25FbmQgKSB7XG4gICAgICAgICAgICB0aGlzLm9uRW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wYXVzZSh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAoIHRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wbGF5KHRoaXMsIHRoaXMuX3N0YXJ0VGltZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBsYXkodGhpcywgMCk7XG5cbiAgICAgICAgdGhpcy5fcGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5fcGxheWluZyApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnN0b3AodGhpcyk7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coXCJvblN0YXJ0XCIpO1xuICAgICAgICAvLyAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgLy99XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXVkaW9Tb3VyY2U7XG59KSgpO1xuXG5GaXJlLkF1ZGlvU291cmNlID0gQXVkaW9Tb3VyY2U7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLXdlYi1hdWRpbycpO1xuLy8gc3JjL2F1ZGlvLXdlYi1hdWRpby5qc1xuXG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBOYXRpdmVBdWRpb0NvbnRleHQgPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQpO1xuICAgIGlmICggIU5hdGl2ZUF1ZGlvQ29udGV4dCApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpeCBmaXJlYmFsbC14L2RldiMzNjVcbiAgICBpZiAoIUZpcmUubmF0aXZlQUMpIHtcbiAgICAgICAgRmlyZS5uYXRpdmVBQyA9IG5ldyBOYXRpdmVBdWRpb0NvbnRleHQoKTtcbiAgICB9XG5cbiAgICAvLyDmt7vliqBzYWZlRGVjb2RlQXVkaW9EYXRh55qE5Y6f5Zug77yaaHR0cHM6Ly9naXRodWIuY29tL2ZpcmViYWxsLXgvZGV2L2lzc3Vlcy8zMThcbiAgICBmdW5jdGlvbiBzYWZlRGVjb2RlQXVkaW9EYXRhKGNvbnRleHQsIGJ1ZmZlciwgdXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGltZW91dCA9IGZhbHNlO1xuICAgICAgICB2YXIgdGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soJ1RoZSBvcGVyYXRpb24gb2YgZGVjb2RpbmcgYXVkaW8gZGF0YSBhbHJlYWR5IHRpbWVvdXQhIEF1ZGlvIHVybDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgICdcIi4gU2V0IEZpcmUuQXVkaW9Db250ZXh0Lk1heERlY29kZVRpbWUgdG8gYSBsYXJnZXIgdmFsdWUgaWYgdGhpcyBlcnJvciBvZnRlbiBvY2N1ci4gJyArXG4gICAgICAgICAgICAgICAgICAgICAnU2VlIGZpcmViYWxsLXgvZGV2IzMxOCBmb3IgZGV0YWlscy4nLCBudWxsKTtcbiAgICAgICAgfSwgQXVkaW9Db250ZXh0Lk1heERlY29kZVRpbWUpO1xuXG4gICAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGJ1ZmZlcixcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkZWNvZGVkRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkZWNvZGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXCIgc2VlbXMgdG8gYmUgdW5yZWFjaGFibGUgb3IgdGhlIGZpbGUgaXMgZW1wdHkuIElubmVyTWVzc2FnZTogJyArIGUpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRlcih1cmwsIGNhbGxiYWNrLCBvblByb2dyZXNzKSB7XG4gICAgICAgIHZhciBjYiA9IGNhbGxiYWNrICYmIGZ1bmN0aW9uIChlcnJvciwgeGhyKSB7XG4gICAgICAgICAgICBpZiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgc2FmZURlY29kZUF1ZGlvRGF0YShGaXJlLm5hdGl2ZUFDLCB4aHIucmVzcG9uc2UsIHVybCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soJ0xvYWRBdWRpb0NsaXA6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAnXCIgc2VlbXMgdG8gYmUgdW5yZWFjaGFibGUgb3IgdGhlIGZpbGUgaXMgZW1wdHkuIElubmVyTWVzc2FnZTogJyArIGVycm9yLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRmlyZS5Mb2FkTWFuYWdlci5fbG9hZEZyb21YSFIodXJsLCBjYiwgb25Qcm9ncmVzcywgJ2FycmF5YnVmZmVyJyk7XG4gICAgfVxuXG4gICAgRmlyZS5Mb2FkTWFuYWdlci5yZWdpc3RlclJhd1R5cGVzKCdhdWRpbycsIGxvYWRlcik7XG5cbiAgICB2YXIgQXVkaW9Db250ZXh0ID0ge307XG5cbiAgICBBdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSA9IDQwMDA7XG5cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICggdGFyZ2V0Ll9wYXVzZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9zdGFydFRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRhcmdldC5fcGxheWluZyApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX3N0YXJ0VGltZSArIHRoaXMuZ2V0UGxheWVkVGltZSh0YXJnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfTtcblxuICAgIEF1ZGlvQ29udGV4dC5nZXRQbGF5ZWRUaW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gKEZpcmUubmF0aXZlQUMuY3VycmVudFRpbWUgLSB0YXJnZXQuX2xhc3RQbGF5KSAqIHRhcmdldC5fcGxheWJhY2tSYXRlO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVUaW1lID0gZnVuY3Rpb24gKHRhcmdldCwgdGltZSkge1xuICAgICAgICB0YXJnZXQuX2xhc3RQbGF5ID0gRmlyZS5uYXRpdmVBQy5jdXJyZW50VGltZTtcbiAgICAgICAgdGFyZ2V0Ll9zdGFydFRpbWUgPSB0aW1lO1xuXG4gICAgICAgIGlmICggdGFyZ2V0LmlzUGxheWluZyApIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2UodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll92b2x1bWVHYWluKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldC5tdXRlID8gLTEgOiAodGFyZ2V0LnZvbHVtZSAtIDEpO1xuICAgIH07XG5cbiAgICAvLyByYW5nZSBbMCwxXVxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVWb2x1bWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll92b2x1bWVHYWluKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldC52b2x1bWUgLSAxO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVMb29wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYnVmZlNvdXJjZSkgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLmxvb3AgPSB0YXJnZXQubG9vcDtcbiAgICB9O1xuXG4gICAgLy8gYmluZCBidWZmZXIgc291cmNlXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUF1ZGlvQ2xpcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCB0YXJnZXQuaXNQbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKHRhcmdldCxmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICggIXRoaXMuaXNQYXVzZWQgKSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5wYXVzZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2J1ZmZTb3VyY2UpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgdGFyZ2V0Ll9zdGFydFRpbWUgKz0gdGhpcy5nZXRQbGF5ZWRUaW1lKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLnN0b3AoKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuc3RvcCA9IGZ1bmN0aW9uICggdGFyZ2V0LCBlbmRlZCApIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2J1ZmZTb3VyY2UpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgaWYgKCAhZW5kZWQgKSB7XG4gICAgICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uub25lbmRlZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLnN0b3AoKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQucGxheSA9IGZ1bmN0aW9uICggdGFyZ2V0LCBhdCApIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuY2xpcCB8fCAhdGFyZ2V0LmNsaXAucmF3RGF0YSkgeyByZXR1cm47IH1cblxuICAgICAgICAvLyBjcmVhdGUgYnVmZmVyIHNvdXJjZVxuICAgICAgICB2YXIgYnVmZmVyU291cmNlID0gRmlyZS5uYXRpdmVBQy5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICAvLyBjcmVhdGUgdm9sdW1lIGNvbnRyb2xcbiAgICAgICAgdmFyIGdhaW4gPSBGaXJlLm5hdGl2ZUFDLmNyZWF0ZUdhaW4oKTtcblxuICAgICAgICAvLyBjb25uZWN0XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5jb25uZWN0KGdhaW4pO1xuICAgICAgICBnYWluLmNvbm5lY3QoRmlyZS5uYXRpdmVBQy5kZXN0aW5hdGlvbik7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5jb25uZWN0KEZpcmUubmF0aXZlQUMuZGVzdGluYXRpb24pO1xuXG4gICAgICAgIC8vIGluaXQgcGFyYW1ldGVyc1xuICAgICAgICBidWZmZXJTb3VyY2UuYnVmZmVyID0gdGFyZ2V0LmNsaXAucmF3RGF0YTtcbiAgICAgICAgYnVmZmVyU291cmNlLmxvb3AgPSB0YXJnZXQubG9vcDtcbiAgICAgICAgYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHRhcmdldC5wbGF5YmFja1JhdGU7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5vbmVuZGVkID0gdGFyZ2V0Lm9uUGxheUVuZC5iaW5kKHRhcmdldCk7XG4gICAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldC5tdXRlID8gLTEgOiAodGFyZ2V0LnZvbHVtZSAtIDEpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZSA9IGJ1ZmZlclNvdXJjZTtcbiAgICAgICAgdGFyZ2V0Ll92b2x1bWVHYWluID0gZ2FpbjtcbiAgICAgICAgdGFyZ2V0Ll9zdGFydFRpbWUgPSBhdCB8fCAwO1xuICAgICAgICB0YXJnZXQuX2xhc3RQbGF5ID0gRmlyZS5uYXRpdmVBQy5jdXJyZW50VGltZTtcblxuICAgICAgICAvLyBwbGF5XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5zdGFydCggMCwgdGhpcy5nZXRDdXJyZW50VGltZSh0YXJnZXQpICk7XG4gICAgfTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBCdWZmZXIgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgaWYgKGNsaXAucmF3RGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5kdXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBTYW1wbGVzID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgaWYgKGNsaXAucmF3RGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwQ2hhbm5lbHMgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLm51bWJlck9mQ2hhbm5lbHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwRnJlcXVlbmN5ID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgaWYgKGNsaXAucmF3RGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5zYW1wbGVSYXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG5cbiAgICBGaXJlLkF1ZGlvQ29udGV4dCA9IEF1ZGlvQ29udGV4dDtcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xuLy8gc3ByaXRlLWFuaW1hdGlvbi1jbGlwLmpzXG5cbi8vIOWKqOeUu+WJqui+kVxuXG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IEZpcmUuZXh0ZW5kKCdGaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAnLCBGaXJlLkN1c3RvbUFzc2V0LCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbnVsbDsgLy8gdGhlIGFycmF5IG9mIHRoZSBlbmQgZnJhbWUgb2YgZWFjaCBmcmFtZSBpbmZvXG59KTtcblxuRmlyZS5hZGRDdXN0b21Bc3NldE1lbnUoU3ByaXRlQW5pbWF0aW9uQ2xpcCwgXCJDcmVhdGUvTmV3IFNwcml0ZSBBbmltYXRpb25cIik7XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUgPSAoZnVuY3Rpb24gKHQpIHtcbiAgICB0W3QuRGVmYXVsdCA9IDBdID0gJ0RlZmF1bHQnO1xuICAgIHRbdC5PbmNlID0gMV0gPSAnT25jZSc7XG4gICAgdFt0Lkxvb3AgPSAyXSA9ICdMb29wJztcbiAgICB0W3QuUGluZ1BvbmcgPSAzXSA9ICdQaW5nUG9uZyc7XG4gICAgdFt0LkNsYW1wRm9yZXZlciA9IDRdID0gJ0NsYW1wRm9yZXZlcic7XG4gICAgcmV0dXJuIHQ7XG59KSh7fSk7XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbiA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5Eb05vdGhpbmcgPSAwXSA9ICdEb05vdGhpbmcnOyAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB0W3QuRGVmYXVsdFNwcml0ZSA9IDFdID0gJ0RlZmF1bHRTcHJpdGUnOyAvLyBzZXQgdG8gZGVmYXVsdCBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXG4gICAgdFt0LkhpZGUgPSAyXSA9ICdIaWRlJzsgICAgICAgICAgICAgICAgICAgLy8gaGlkZSB0aGUgc3ByaXRlIHdoZW4gdGhlIHNwcml0ZSBhbmltYXRpb24gc3RvcHBlZFxuICAgIHRbdC5EZXN0cm95ID0gM10gPSAnRGVzdHJveSc7ICAgICAgICAgICAgIC8vIGRlc3Ryb3kgdGhlIGVudGl0eSB0aGUgc3ByaXRlIGJlbG9uZ3MgdG8gd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXG4gICAgcmV0dXJuIHQ7XG59KSh7fSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8vIFRoZSBzdHJ1Y3R1cmUgdG8gZGVzY3JpcCBhIGZyYW1lIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgRnJhbWVJbmZvID0gRmlyZS5kZWZpbmUoJ0ZyYW1lSW5mbycpXG4gICAgICAgICAgICAgICAgICAgIC5wcm9wKCdzcHJpdGUnLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5TcHJpdGUpKVxuICAgICAgICAgICAgICAgICAgICAucHJvcCgnZnJhbWVzJywgMCwgRmlyZS5JbnRlZ2VyKTtcblxuLy8vPCB0aGUgbGlzdCBvZiBmcmFtZSBpbmZvXG4vLyB0byBkb1xuXG4vLyBkZWZhdWx0IHdyYXAgbW9kZVxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCd3cmFwTW9kZScsIFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdCwgRmlyZS5FbnVtKFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUpKTtcblxuLy8gdGhlIGRlZmF1bHQgdHlwZSBvZiBhY3Rpb24gdXNlZCB3aGVuIHRoZSBhbmltYXRpb24gc3RvcHBlZFxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCdzdG9wQWN0aW9uJywgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRvTm90aGluZywgRmlyZS5FbnVtKFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbikpO1xuXG4vLyB0aGUgZGVmYXVsdCBzcGVlZCBvZiB0aGUgYW5pbWF0aW9uIGNsaXBcblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvcCgnc3BlZWQnLCAxKTtcblxuLy8gdGhlIHNhbXBsZSByYXRlIHVzZWQgaW4gdGhpcyBhbmltYXRpb24gY2xpcFxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCdfZnJhbWVSYXRlJywgNjAsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblNwcml0ZUFuaW1hdGlvbkNsaXAuZ2V0c2V0KCdmcmFtZVJhdGUnLFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lUmF0ZTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMuX2ZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fZnJhbWVSYXRlID0gTWF0aC5yb3VuZChNYXRoLm1heCh2YWx1ZSwgMSkpO1xuICAgICAgICB9XG4gICAgfVxuKTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCdmcmFtZUluZm9zJywgW10sIEZpcmUuT2JqZWN0VHlwZShGcmFtZUluZm8pKTtcblxuXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3RvdHlwZS5nZXRUb3RhbEZyYW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZnJhbWVzID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVJbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBmcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lcztcbn07XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvdG90eXBlLmdldEZyYW1lSW5mb0ZyYW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fZnJhbWVJbmZvRnJhbWVzID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IG5ldyBBcnJheSh0aGlzLmZyYW1lSW5mb3MubGVuZ3RoKTtcbiAgICAgICAgdmFyIHRvdGFsRnJhbWVzID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZyYW1lSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHRvdGFsRnJhbWVzICs9IHRoaXMuZnJhbWVJbmZvc1tpXS5mcmFtZXM7XG4gICAgICAgICAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXNbaV0gPSB0b3RhbEZyYW1lcztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZnJhbWVJbmZvRnJhbWVzO1xufTtcblxuRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwID0gU3ByaXRlQW5pbWF0aW9uQ2xpcDtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLXN0YXRlLmpzXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG5cbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IGZ1bmN0aW9uIChhbmltQ2xpcCkge1xuICAgIGlmICghYW5pbUNsaXApIHtcbi8vIEBpZiBERVZcbiAgICAgICAgRmlyZS5lcnJvcignVW5zcGVjaWZpZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwJyk7XG4vLyBAZW5kaWZcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB0aGUgbmFtZSBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdGF0ZVxuICAgIHRoaXMubmFtZSA9IGFuaW1DbGlwLm5hbWU7XG4gICAgLy8gdGhlIHJlZmVyZW5jZWQgc3ByaXRlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMuY2xpcCA9IGFuaW1DbGlwO1xuICAgIC8vIHRoZSB3cmFwIG1vZGVcbiAgICB0aGlzLndyYXBNb2RlID0gYW5pbUNsaXAud3JhcE1vZGU7XG4gICAgLy8gdGhlIHN0b3AgYWN0aW9uXG4gICAgdGhpcy5zdG9wQWN0aW9uID0gYW5pbUNsaXAuc3RvcEFjdGlvbjtcbiAgICAvLyB0aGUgc3BlZWQgdG8gcGxheSB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy5zcGVlZCA9IGFuaW1DbGlwLnNwZWVkO1xuICAgIC8vIHRoZSBhcnJheSBvZiB0aGUgZW5kIGZyYW1lIG9mIGVhY2ggZnJhbWUgaW5mbyBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gYW5pbUNsaXAuZ2V0RnJhbWVJbmZvRnJhbWVzKCk7XG4gICAgLy8gdGhlIHRvdGFsIGZyYW1lIGNvdW50IG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICB0aGlzLnRvdGFsRnJhbWVzID0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCAtIDFdIDogMDtcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGluIHNlY29uZHMgd2l0aCBzcGVlZCA9IDEuMGZcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMudG90YWxGcmFtZXMgLyBhbmltQ2xpcC5mcmFtZVJhdGU7XG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggb2YgZnJhbWUuIFRoZSB2YWx1ZSBjYW4gYmUgbGFyZ2VyIHRoYW4gdG90YWxGcmFtZXMuXG4gICAgLy8gSWYgdGhlIGZyYW1lIGlzIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzIGl0IHdpbGwgYmUgd3JhcHBlZCBhY2NvcmRpbmcgdG8gd3JhcE1vZGUuIFxuICAgIHRoaXMuZnJhbWUgPSAtMTtcbiAgICAvLyB0aGUgY3VycmVudCB0aW1lIGluIHNlb25jZHNcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIC8vIGNhY2hlIHJlc3VsdCBvZiBHZXRDdXJyZW50SW5kZXhcbiAgICB0aGlzLl9jYWNoZWRJbmRleCA9IC0xO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRoZSBjdXJyZW50IGZyYW1lIGluZm8gaW5kZXguXG4gKi9cblNwcml0ZUFuaW1hdGlvblN0YXRlLnByb3RvdHlwZS5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudG90YWxGcmFtZXMgPiAxKSB7XG4gICAgICAgIC8vaW50IG9sZEZyYW1lID0gZnJhbWU7XG4gICAgICAgIHRoaXMuZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMudGltZSAqIHRoaXMuY2xpcC5mcmFtZVJhdGUpO1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAtdGhpcy5mcmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3cmFwcGVkSW5kZXg7XG4gICAgICAgIGlmICh0aGlzLndyYXBNb2RlICE9PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPSBfd3JhcCh0aGlzLmZyYW1lLCB0aGlzLnRvdGFsRnJhbWVzIC0gMSwgdGhpcy53cmFwTW9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLmZyYW1lO1xuICAgICAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3Iod3JhcHBlZEluZGV4IC8gdGhpcy50b3RhbEZyYW1lcyk7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggJT0gdGhpcy50b3RhbEZyYW1lcztcbiAgICAgICAgICAgIGlmICgoY250ICYgMHgxKSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMudG90YWxGcmFtZXMgLSAxIC0gd3JhcHBlZEluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJ5IHRvIHVzZSBjYWNoZWQgZnJhbWUgaW5mbyBpbmRleFxuICAgICAgICBpZiAodGhpcy5fY2FjaGVkSW5kZXggLSAxID49IDAgJiZcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA+PSB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fY2FjaGVkSW5kZXggLSAxXSAmJlxuICAgICAgICAgICAgd3JhcHBlZEluZGV4IDwgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4XSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2VhcmNoIGZyYW1lIGluZm9cbiAgICAgICAgdmFyIGZyYW1lSW5mb0luZGV4ID0gX2JpbmFyeVNlYXJjaCh0aGlzLl9mcmFtZUluZm9GcmFtZXMsIHdyYXBwZWRJbmRleCArIDEpO1xuICAgICAgICBpZiAoZnJhbWVJbmZvSW5kZXggPCAwKSB7XG4gICAgICAgICAgICBmcmFtZUluZm9JbmRleCA9IH5mcmFtZUluZm9JbmRleDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWNoZWRJbmRleCA9IGZyYW1lSW5mb0luZGV4O1xuICAgICAgICByZXR1cm4gZnJhbWVJbmZvSW5kZXg7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMudG90YWxGcmFtZXMgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFxuLy8vIEMjIEFycmF5LkJpbmFyeVNlYXJjaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFxuZnVuY3Rpb24gX2JpbmFyeVNlYXJjaCAoYXJyYXksIHZhbHVlKSB7XG4gICAgdmFyIGwgPSAwLCBoID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAobCA8PSBoKSB7XG4gICAgICAgIHZhciBtID0gKChsICsgaCkgPj4gMSk7XG4gICAgICAgIGlmIChhcnJheVttXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBtO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJheVttXSA+IHZhbHVlKSB7XG4gICAgICAgICAgICBoID0gbSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsID0gbSArIDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIH5sO1xufVxuXG5mdW5jdGlvbiBfd3JhcCAoX3ZhbHVlLCBfbWF4VmFsdWUsIF93cmFwTW9kZSkge1xuICAgIGlmIChfbWF4VmFsdWUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChfdmFsdWUgPCAwKSB7XG4gICAgICAgIF92YWx1ZSA9IC1fdmFsdWU7XG4gICAgfVxuICAgIGlmIChfd3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuTG9vcCkge1xuICAgICAgICByZXR1cm4gX3ZhbHVlICUgKF9tYXhWYWx1ZSArIDEpO1xuICAgIH1cbiAgICBlbHNlIGlmIChfd3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuUGluZ1BvbmcpIHtcbiAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3IoX3ZhbHVlIC8gX21heFZhbHVlKTtcbiAgICAgICAgX3ZhbHVlICU9IF9tYXhWYWx1ZTtcbiAgICAgICAgaWYgKGNudCAlIDIgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWUgLSBfdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChfdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3ZhbHVlID4gX21heFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfdmFsdWU7XG59XG5cbkZpcmUuU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSBTcHJpdGVBbmltYXRpb25TdGF0ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25TdGF0ZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbicpO1xuLy8gc3ByaXRlLWFuaW1hdGlvbi5qc1xuXG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xudmFyIFNwcml0ZUFuaW1hdGlvblN0YXRlID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZScpO1xuXG4vLyDlrprkuYnkuIDkuKrlkI3lj6tTcHJpdGUgQW5pbWF0aW9uIOe7hOS7tlxudmFyIFNwcml0ZUFuaW1hdGlvbiA9IEZpcmUuZXh0ZW5kKCdGaXJlLlNwcml0ZUFuaW1hdGlvbicsIEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb25zID0gW107XG4gICAgdGhpcy5fbmFtZVRvU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIgPSBudWxsO1xuICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RGcmFtZUluZGV4ID0gLTE7XG4gICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IDA7Ly8g5Zyo6LCD55SoUGxheeeahOW9k+W4p+eahExhdGVVcGRhdGXkuI3ov5vooYxzdGVwXG59KTtcblxuRmlyZS5hZGRDb21wb25lbnRNZW51KFNwcml0ZUFuaW1hdGlvbiwgJ1Nwcml0ZSBBbmltYXRpb24nKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ2RlZmF1bHRBbmltYXRpb24nLCBudWxsICwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ2FuaW1hdGlvbnMnLCBbXSwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ19wbGF5QXV0b21hdGljYWxseScsIHRydWUsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblNwcml0ZUFuaW1hdGlvbi5nZXRzZXQoJ3BsYXlBdXRvbWF0aWNhbGx5JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5QXV0b21hdGljYWxseTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wbGF5QXV0b21hdGljYWxseSA9IHZhbHVlO1xuICAgIH1cbik7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5pdGlhbGl6ZWQgPSAodGhpcy5fbmFtZVRvU3RhdGUgIT09IG51bGwpO1xuICAgIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGU7XG5cbiAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGUgPSB7fTtcbiAgICAgICAgdmFyIHN0YXRlID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1hdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjbGlwID0gdGhpcy5hbmltYXRpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGNsaXAgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZShjbGlwKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZVtzdGF0ZS5uYW1lXSA9IHN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdldEFuaW1TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24ubmFtZSkpIHtcbiAgICAgICAgICAgIHN0YXRlID0gbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZVtzdGF0ZS5uYW1lXSA9IHN0YXRlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5nZXRBbmltU3RhdGUgPSBmdW5jdGlvbiAoIG5hbWUgKXtcbiAgICByZXR1cm4gdGhpcy5fbmFtZVRvU3RhdGUgJiYgdGhpcy5fbmFtZVRvU3RhdGVbbmFtZV07XG59O1xuXG4vKipcbiAqIGluZGljYXRlcyB3aGV0aGVyIHRoZSBhbmltYXRpb24gaXMgcGxheWluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFthbmltTmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXG4gKi9cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuaXNQbGF5aW5nID0gZnVuY3Rpb24gKCBuYW1lICkge1xuICAgIHZhciBwbGF5aW5nQW5pbSA9IHRoaXMuZW5hYmxlZCAmJiB0aGlzLl9jdXJBbmltYXRpb247XG4gICAgcmV0dXJuICEhcGxheWluZ0FuaW0gJiYgKCAhbmFtZSB8fCBwbGF5aW5nQW5pbS5uYW1lID09PSBuYW1lICk7XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoYW5pbVN0YXRlLCB0aW1lKSB7XG4gICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gYW5pbVN0YXRlO1xuICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aW1lO1xuICAgICAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IEZpcmUuVGltZS5mcmFtZUNvdW50O1xuICAgICAgICB0aGlzLnNhbXBsZSgpO1xuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ICYmIHRoaXMuZGVmYXVsdEFuaW1hdGlvbikge1xuICAgICAgICAgICAgdmFyIGFuaW1TdGF0ZSA9IHRoaXMuZ2V0QW5pbVN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbi5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMucGxheShhbmltU3RhdGUsIDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5sYXRlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwgJiYgRmlyZS5UaW1lLmZyYW1lQ291bnQgPiB0aGlzLl9wbGF5U3RhcnRGcmFtZSkge1xuICAgICAgICB2YXIgZGVsdGEgPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogdGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICB0aGlzLnN0ZXAoZGVsdGEpO1xuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uIChkZWx0YVRpbWUpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lICs9IGRlbHRhVGltZTtcbiAgICAgICAgdGhpcy5zYW1wbGUoKTtcbiAgICAgICAgdmFyIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5PbmNlIHx8XG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdCB8fFxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA+IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID49IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSAvIHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lUmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkIDwgMCAmJiB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkbyBzdG9wXG4gICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AodGhpcy5fY3VyQW5pbWF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnNhbXBsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX2N1ckFuaW1hdGlvbi5nZXRDdXJyZW50SW5kZXgoKTtcbiAgICAgICAgaWYgKG5ld0luZGV4ID49IDAgJiYgbmV3SW5kZXggIT0gdGhpcy5fY3VySW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLnNwcml0ZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lSW5mb3NbbmV3SW5kZXhdLnNwcml0ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IG5ld0luZGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoYW5pbVN0YXRlKSB7XG4gICAgaWYgKCBhbmltU3RhdGUgIT09IG51bGwgKSB7XG4gICAgICAgIGlmIChhbmltU3RhdGUgPT09IHRoaXMuX2N1ckFuaW1hdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBhbmltU3RhdGUudGltZSA9IDA7XG5cbiAgICAgICAgdmFyIHN0b3BBY3Rpb24gPSBhbmltU3RhdGUuc3RvcEFjdGlvbjtcbiAgICAgICAgc3dpdGNoIChzdG9wQWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5Eb05vdGhpbmc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZWZhdWx0U3ByaXRlOlxuICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLnNwcml0ZSA9IHRoaXMuX2RlZmF1bHRTcHJpdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5IaWRlOlxuICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlc3Ryb3k6XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcbiAgICB9XG59O1xuXG5GaXJlLlNwcml0ZUFuaW1hdGlvbiA9IFNwcml0ZUFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb247XG5cbkZpcmUuX1JGcG9wKCk7Il19
