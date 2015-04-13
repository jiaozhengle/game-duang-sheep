require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"GameOverMenu":[function(require,module,exports){
Fire._RFpush(module, '5ca38jdHudCh7QHLs700P5Q', 'GameOverMenu');
// script/GameOverMenu.js

var GameOverMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 属性
    properties: {
        // 标题
        title:{
            default: null,
            type: Fire.Entity
        },
        // 面板
        panel:{
            default: null,
            type: Fire.Entity
        },
        // 按钮
        btn_play:{
            default: null,
            type: Fire.Entity
        },
        // 得分
        scoreText:{
            default: null,
            type: Fire.BitmapText
        }
    },
    onEnable: function () {
        var Game = require('Game');
        this.scoreText.text = Game.instance.score;
        this.btn_play.on('mouseup', function () {
            this.scoreText.text = "0";
            this.entity.active = false;
            Game.instance.mask.active = true;
            Fire.Engine.loadScene('MainMenu');
        }.bind(this));

        this.title.transform.position = new Fire.Vec2(0, 250);
        this.panel.transform.position = new Fire.Vec2(0, -200);
    },
    // 更新
    update: function () {
        if (this.title.transform.y > 100) {
            this.title.transform.y -= Fire.Time.deltaTime * 400;
        }
        else {
            this.title.transform.y = 100;
        }
        if (this.panel.transform.y < 0) {
            this.panel.transform.y += Fire.Time.deltaTime * 500;
        }
        else {
            this.panel.transform.y = 0;
        }
    }
});

Fire._RFpop();
},{"Game":"Game"}],"Game":[function(require,module,exports){
Fire._RFpush(module, '48f8d15ZstO4aRYKt5BKAMw', 'Game');
// script/Game.js

var Sheep = require('Sheep');
var ScrollPicture = require('ScrollPicture');
var PipeGroupManager = require('PipeGroupManager');

var GameState = Fire.defineEnum({
    Ready: -1,
    Run : -1,
    Over: -1
});

var Game = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 游戏状态
        this.gameState = GameState.Ready;
        // 分数
        this.score = 0;
        //-- 得分特效
        this.scoreEffect = null;
        this.scoreTopPos = 0;
        // 遮罩
        this.mask = null;
        this.maskRender = null;
        //
        Game.instance = this;
    },
    // 属性
    properties: {
        tempMask: {
            default: null,
            type: Fire.Entity
        },
        // 获取绵羊
        sheep: {
            default: null,
            type: Sheep
        },
        // 获取背景
        background: {
            default: null,
            type: ScrollPicture
        },
        // 获取地面
        ground: {
            default: null,
            type: ScrollPicture
        },
        // 获取障碍物管理
        pipeGroupMgr: {
            default: null,
            type: PipeGroupManager
        },
        // 获取gameOverMenu对象
        gameOverMenu: {
            default: null,
            type: Fire.Entity
        },
        // 获取分数对象
        scoreText: {
            default: null,
            type: Fire.BitmapText
        },
        readyAuido: {
            default: null,
            type: Fire.AudioSource
        },
        // 获取背景音效
        gameBgAudio: {
            default: null,
            type: Fire.AudioSource
        },
        // 获取死亡音效
        dieAudio: {
            default: null,
            type: Fire.AudioSource
        },
        // 获取失败音效
        gameOverAudio: {
            default: null,
            type: Fire.AudioSource
        },
        // 获取得分音效
        scoreAudio: {
            default: null,
            type: Fire.AudioSource
        },
        // 得分特效
        tempDisappear: {
            default: null,
            type: Fire.Entity
        },
        // 加分预制
        tempAddSorce:{
            default: null,
            type: Fire.Entity
        }
    },
    // 开始
    onStart: function () {
        this.gameState = GameState.Ready;
        this.score = 0;
        this.scoreText.text = this.score;

        // 所有元素停止更新
        this._pauseUpdate(false);
        // 遮罩
        this.mask = Fire.Entity.find('/mask');
        if (!this.mask) {
            this.mask = Fire.instantiate(this.tempMask);
            this.mask.name = 'mask';
            this.mask.dontDestroyOnLoad = true;
        }
        this.maskRender = this.mask.getComponent(Fire.SpriteRenderer);
    },
    _pauseUpdate: function (enabled){
        this.ground.enabled = enabled;
        this.background.enabled = enabled;
        for (var i = 0; i < this.pipeGroupMgr.pipeGroupList.length; ++i) {
            var pipeGroup = this.pipeGroupMgr.pipeGroupList[i].getComponent('PipeGroup');
            pipeGroup.enabled = enabled;
        }
        this.pipeGroupMgr.enabled = enabled;
    },
    _playReadyGameBg: function () {
        this.readyAuido.play();
        this.readyAuido.onEnd = function () {
            if(this.gameState === GameState.over){
                return;
            }
            this.gameBgAudio.loop = true;
            this.gameBgAudio.play();
        }.bind(this);
    },
    // 更新
    lateUpdate: function () {
        switch (this.gameState) {
            case GameState.Ready:
                if (this.mask.active) {
                    this.maskRender.color.a -= Fire.Time.deltaTime;
                    if (this.maskRender.color.a < 0.3) {
                        this._playReadyGameBg();
                    }
                    if (this.maskRender.color.a <= 0) {
                        this.mask.active = false;
                        this.gameState = GameState.Run;
                        this._pauseUpdate(true);
                    }
                }
                break;
            case GameState.Run:
                var sheepRect = this.sheep.renderer.getWorldBounds();
                var gameOver = this.pipeGroupMgr.collisionDetection(sheepRect);
                if (gameOver) {
                    // 背景音效停止，死亡音效播放
                    this.gameBgAudio.stop();
                    this.dieAudio.play();
                    this.gameOverAudio.play();

                    this.gameState = GameState.Over;
                    this.sheep.state = Sheep.State.Dead;

                    this._pauseUpdate(false);

                    this.gameOverMenu.active = true;
                }
                // 计算分数
                this.updateSorce();
                break;
            default :
                break;
        }
        this._updateScoreEffect();
    },
    // 更新分数
    updateSorce: function () {
        var nextPipeGroup = this.pipeGroupMgr.getNext();
        if (nextPipeGroup) {
            var sheepRect = this.sheep.renderer.getWorldBounds();
            var pipeGroupRect = nextPipeGroup.bottomRenderer.getWorldBounds();
            // 当绵羊的右边坐标越过水管右侧坐标
            var crossed = sheepRect.xMin > pipeGroupRect.xMax;
            if (crossed) {
                // 分数+1
                this.score++;
                this.scoreText.text = this.score;
                this.pipeGroupMgr.setAsPassed(nextPipeGroup);
                // 分数增加音效
                this.scoreAudio.play();

                var pos = new Vec2(this.sheep.transform.x - 30, this.sheep.transform.y + 50);
                this.scoreEffect = this._playScoreEffect(this.tempAddSorce, pos);
                this.scoreTopPos = this.scoreEffect.transform.y + 100;
            }
        }
    },
    _playScoreEffect: function(tempEntity, pos) {
        var effect = Fire.instantiate(tempEntity);
        effect.transform.position = pos;
        return effect;
    },
    _updateScoreEffect: function(){
        if (this.scoreEffect) {
            this.scoreEffect.transform.y += Fire.Time.deltaTime * 200;
            if (this.scoreEffect.transform.y > this.scoreTopPos) {
                var disappear = Fire.instantiate(this.tempDisappear);
                var disappearAnim = disappear.getComponent(Fire.SpriteAnimation);
                disappear.transform.position = this.scoreEffect.transform.position;
                disappearAnim.play();

                this.scoreEffect.destroy();
                this.scoreEffect = null;
                this.scoreTopPos = 0;
            }
        }
    }
});

Game.instance = null;

Fire._RFpop();
},{"PipeGroupManager":"PipeGroupManager","ScrollPicture":"ScrollPicture","Sheep":"Sheep"}],"MainMenu":[function(require,module,exports){
Fire._RFpush(module, '3438aZsLsJIJJKkdNBrDQNU', 'MainMenu');
// script/MainMenu.js

var ScrollPicture = require('ScrollPicture');

var MainMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.mask = null;
        this.maskRender = null;
        this.fadeInGame = false;
    },
    // 属性
    properties: {
        // 遮罩模板
        tempMask: {
            default: null,
            type: Fire.Entity
        },
        // 地面
        ground: {
            default: null,
            type: ScrollPicture
        },
        // 背景
        background: {
            default: null,
            type   : ScrollPicture
        },
        // 开始按钮
        btn_play: {
            default: null,
            type: Fire.Entity
        }
    },
    onLoad: function () {
        this.btn_play.on('mouseup', function () {
            this.fadeInGame = true;
            this.mask.active = true;
        }.bind(this));

        this.mask = Fire.Entity.find('/mask');
        this.maskRender = null;
        if (!this.mask) {
            this.mask = Fire.instantiate(this.tempMask);
            this.mask.name = 'mask';
            this.mask.dontDestroyOnLoad = true;
        }
        this.maskRender = this.mask.getComponent(Fire.SpriteRenderer);
        this.maskRender.color.a = 1;
        this.fadeInGame = false;
        
        Fire.Engine.preloadScene('Game');
    },
    lateUpdate: function () {
        if (this.mask.active) {
            var fadeStep = Fire.Time.deltaTime * 2;
            if (this.fadeInGame) {
                this.maskRender.color.a += fadeStep;
                if (this.maskRender.color.a >= 1) {
                    Fire.Engine.loadScene('Game');
                    this.enabled = false;	// stop calling loadScene anymore!
                }
            }
            else {
                this.maskRender.color.a -= fadeStep;
                if (this.maskRender.color.a <= 0) {
                    this.maskRender.color.a = 0;
                    this.mask.active = false;
                }
            }
        }
    }
});

Fire._RFpop();
},{"ScrollPicture":"ScrollPicture"}],"PipeGroupManager":[function(require,module,exports){
Fire._RFpush(module, 'a92ffSpmqpE8oy0ueQo+VAg', 'PipeGroupManager');
// script/PipeGroupManager.js

var PipeGroupManager = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 上一次创建PipeGroup的时间
        this.lastTime = 0;
    },
    // 属性
    properties: {
        // 获取PipeGroup模板
        srcPipeGroup: {
            default: null,
            type: Fire.Entity
        },
        // PipeGroup初始坐标
        initPipeGroupPos: {
            default: new Fire.Vec2(600, 0)
        },
        // 创建PipeGroup需要的时间
        spawnInterval: 3,
        // 管道列表
        pipeGroupList: {
            get: function () {
                return this.entity.getChildren();
            },
            visible: false
        }
    },
    // 初始化
    onLoad: function () {
        this.lastTime = Fire.Time.time + 10;
    },
    // 创建管道组
    createPipeGroupEntity: function () {
        var pipeGroup = Fire.instantiate(this.srcPipeGroup);
        pipeGroup.parent = this.entity;
        pipeGroup.transform.position = this.initPipeGroupPos;
        pipeGroup.active = true;
    },
    // 获取下个未通过的水管
    getNext: function () {
        for (var i = 0; i < this.pipeGroupList.length; ++i) {
            var pipeGroupEntity = this.pipeGroupList[i];
            var pipeGroup = pipeGroupEntity.getComponent('PipeGroup');
            if (!pipeGroup.passed) {
                return pipeGroup;
            }
        }
        return null;
    },
    // 标记已通过的水管
    setAsPassed: function (pipeGroup) {
        pipeGroup.passed = true;
    },
    // 碰撞检测
    collisionDetection: function (sheepRect) {
        // 降低难度
        sheepRect.xMin += 20;
        sheepRect.xMax -= 20;
        sheepRect.yMin += 15;
        sheepRect.yMax -= 15;
        
        for (var i = 0; i < this.pipeGroupList.length; ++i) {
            var pipeGroupEntity = this.pipeGroupList[i];
            // 上方障碍物
            var pipe = pipeGroupEntity.find('topPipe');
            var pipeRender = pipe.getComponent(Fire.SpriteRenderer)
            var pipeRect = pipeRender.getWorldBounds();
            
            if (Fire.Intersection.rectRect(sheepRect, pipeRect)) {
                return true;
            }
			
            // 下方障碍物
            pipe = pipeGroupEntity.find('bottomPipe');
            pipeRender = pipe.getComponent(Fire.SpriteRenderer);
            pipeRect = pipeRender.getWorldBounds();
          	
            if (Fire.Intersection.rectRect(sheepRect, pipeRect)) {
                return true;
            }
        }
        return false;
    },
    // 更新
    update: function () {
        // 每过一段时间创建障碍物
        var idleTime = Math.abs(Fire.Time.time - this.lastTime);
        if (idleTime >= this.spawnInterval) {
            this.lastTime = Fire.Time.time;
            this.createPipeGroupEntity();
        }
    }
});

Fire._RFpop();
},{}],"PipeGroup":[function(require,module,exports){
Fire._RFpush(module, 'ce446mwMy9DkLsyMuZTGTC9', 'PipeGroup');
// script/PipeGroup.js

var PipeGroup = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 保存下方管道的Renderer,方便获得水平边界
        this.bottomRenderer = null;
        // 是否已经被通过
        this.passed = false;
    },
    // 属性
    properties: {
        // 基础移动速度
        speed: 200,
        // 超出这个范围就会被销毁
        minX: -900,
        // 上方管子坐标范围 Min 与 Max
        topPosRange: {
            default: new Fire.Vec2(100, 160)
        },
        // 上方与下方管道的间距 Min 与 Max
        spacingRange: {
            default: new Fire.Vec2(210, 230)
        }
    },
    // 初始化
    onEnable: function () {
        var topYpos = Math.randomRange(this.topPosRange.x, this.topPosRange.y);
        var randomSpacing = Math.randomRange(this.spacingRange.x, this.spacingRange.y);
        var bottomYpos = topYpos - randomSpacing;

        var topEntity = this.entity.find('topPipe');
        topEntity.transform.y = topYpos;

        var bottomEntity = this.entity.find('bottomPipe');
        bottomEntity.transform.y = bottomYpos;

        this.bottomRenderer = bottomEntity.getComponent(Fire.SpriteRenderer);
        this.passed = false;
    },
    // 更新
    update: function () {
        this.transform.x -= Fire.Time.deltaTime * this.speed;
        if (this.transform.x < this.minX) {
            this.entity.destroy();
        }
    }
});

Fire._RFpop();
},{}],"ScrollPicture":[function(require,module,exports){
Fire._RFpush(module, '58402WJT/9LSrJLFS0HvHIx', 'ScrollPicture');
// script/ScrollPicture.js

var ScrollPicture = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 属性
    properties: {
        // 滚动的速度
        speed:200,
        // X轴边缘
        offsetX: 0
    },
    // 更新
    update: function () {
        this.transform.x -= Fire.Time.deltaTime * this.speed;
        if (this.transform.x < -this.offsetX) {
            this.transform.x += this.offsetX;
        }
    }
});

Fire._RFpop();
},{}],"Sheep":[function(require,module,exports){
Fire._RFpush(module, '92396N38yZEbKXKUHAlzyBA', 'Sheep');
// script/Sheep.js

//-- 绵羊状态
var State = Fire.defineEnum({
    None   : -1,
    Run    : -1,
    Jump   : -1,
    Drop   : -1,
    DropEnd: -1,
    Dead   : -1
});

var Sheep = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 当前播放动画组件
        this.anim = null;
        // 当前速度
        this.currentSpeed = 0;
        // 绵羊图片渲染
        this.renderer = null;
        // 跳跃事件
        this.jumpEvent = null;
    },
    // 属性
    properties: {
        // 初始坐标
        initSheepPos: new Fire.Vec2(-150, -180),
        // Y轴最大高度
        maxY: 250,
        // 地面高度
        groundY: -170,
        // 重力
        gravity: 9.8,
        // 起跳速度
        initSpeed: 500,
        // 绵羊状态
        _state: {
            default: State.Run,
            type: State,
            visible: false
        },
        state: {
            get: function () {
                return this._state;
            },
            set: function(value){
                if (value !== this._state) {
                    this._state = value;
                    if (this._state !== State.None) {
                        var animName = State[this._state];
                        this.anim.play(animName);
                    }
                }
            },
            type: State
        },
        // 获取Jump音效
        jumpAudio: {
            default: null,
            type: Fire.AudioSource
        },
        // 获取Jump特效
        jumpEffect: {
            default: null,
            type: Fire.Entity
        },
        dropEndEffect: {
            default: null,
            type: Fire.Entity
        }
    },
    // 初始化
    onLoad: function () {
        this.anim = this.getComponent(Fire.SpriteAnimation);
        this.renderer = this.getComponent(Fire.SpriteRenderer);
        this.transform.position = this.initSheepPos;
        // 添加绵羊控制事件(为了注销事件缓存事件)
        this.jumpEvent = function (event) {
            if (this.state !== State.Dead) {
                this._jump();
            }
        }.bind(this);
        Fire.Input.on('mousedown', this.jumpEvent);
    },
    // 删除
    onDestroy: function () {
        // 注销绵羊控制事件
        Fire.Input.off('mousedown', this.jumpEvent);
    },
    // 更新
    update: function () {
        this._updateState();
        this._updateTransform();
    },
    // 更新绵羊状态
    _updateState: function () {
        switch (this.state) {
            case Sheep.State.Jump:
                if (this.currentSpeed < 0) {
                    this.state = State.Drop;
                }
                break;
            case Sheep.State.Drop:
                if (this.transform.y <= this.groundY) {
                    this.transform.y = this.groundY;
                    this.state = State.DropEnd;
                    // 播放灰尘特效
                    var pos = new Vec2(this.transform.x, this.transform.y - 30);
                    this._playEffect(this.dropEndEffect, pos);
                }
                break;
            case Sheep.State.DropEnd:
                if (!this.anim.isPlaying('DropEnd')) {
                    this.state = State.Run;
                }
                break
            default:
                break;
        }
    },
    // 更新绵羊坐标
    _updateTransform: function () {
        var flying = this.state === Sheep.State.Jump || this.transform.y > this.groundY;
        if (flying) {
            this.currentSpeed -= (Fire.Time.deltaTime * 100) * this.gravity;
            this.transform.y += Fire.Time.deltaTime * this.currentSpeed;
        }
    },
    // 开始跳跃设置状态数据，播放动画
    _jump: function () {
        this.state = State.Jump;
        this.currentSpeed = this.initSpeed;

        // 播放跳音效
        this.jumpAudio.stop();
        this.jumpAudio.play();
        // 播放灰尘特效
        var pos = new Vec2(this.transform.x - 80, this.transform.y + 10);
        this._playEffect(this.jumpEffect, pos);
    },
    //
    _playEffect: function(tempEffect, pos) {
        var effect = Fire.instantiate(tempEffect);
        effect.transform.position = pos;
        var effectAnim = effect.getComponent(Fire.SpriteAnimation);
        effectAnim.play();
    }
});

Sheep.State = State;

Fire._RFpop();
},{}],"audio-clip":[function(require,module,exports){
Fire._RFpush(module, 'audio-clip');
// src/audio-clip.js

Fire.AudioClip = (function () {

    /**
     * The audio clip is an audio source data.
     * @class AudioClip
     * @extends Asset
     */
    var AudioClip = Fire.Class({
        //
        name: "Fire.AudioClip",
        //
        extends: Fire.Asset,
        //
        properties: {
            //
            rawData: {
                default: null,
                rawType: 'audio',
                visible: false
            },
            //
            buffer:{
                get: function() {
                    return Fire.AudioContext.getClipBuffer(this);
                },
                visible: false,
            },
            /**
             * The length of the audio clip in seconds (Read Only).
             * @property length
             * @type {number}
             * @readOnly
             */
            length: {
                get: function() {
                    return Fire.AudioContext.getClipLength(this);
                }
            },
            /**
             * The length of the audio clip in samples (Read Only).
             * @property samples
             * @type {number}
             * @readOnly
             */
            samples: {
                get: function() {
                    return Fire.AudioContext.getClipSamples(this);
                }
            },
            /**
             * Channels in audio clip (Read Only).
             * @property channels
             * @type {number}
             * @readOnly
             */
            channels: {
                get: function() {
                    return Fire.AudioContext.getClipChannels(this);
                }
            },
            /**
             * Sample frequency (Read Only).
             * @property frequency
             * @type {number}
             * @readOnly
             */
            frequency: {
                get: function() {
                    return Fire.AudioContext.getClipFrequency(this);
                }
            }
        }
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
},{}],"audio-fix-ios":[function(require,module,exports){
Fire._RFpush(module, 'audio-fix-ios');
// src/audio-fix-ios.js

require('audio-legacy');
require('audio-web-audio');

if (Fire.isIOS) {
    Fire.LoadManager.load('empty','audio', 'mp3', function (err, data) {
        var isPlayed = false;
        window.addEventListener('touchstart', function listener () {
            if (isPlayed) {
                return;
            }
            isPlayed = true;
            var defaultSource = new Fire.AudioSource();
            var defaultClip = new Fire.AudioClip();
            defaultClip.rawData = data;
            defaultSource.clip = defaultClip;
            Fire.AudioContext.play(defaultSource);
            window.removeEventListener('touchstart', listener);
        });
    });
}

Fire._RFpop();
},{"audio-legacy":"audio-legacy","audio-web-audio":"audio-web-audio"}],"audio-legacy":[function(require,module,exports){
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
            target._onPlayEnd.bind(target);
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

    /**
     * The audio source component.
     * @class AudioSource
     * @extends Component
     * @constructor
     */
    var AudioSource = Fire.Class({
        //
        name: "Fire.AudioSource",
        //
        extends: Fire.Component,
        //
        constructor: function () {
            // 声源暂停或者停止时候为false
            this._playing = false;
            // 来区分声源是暂停还是停止
            this._paused = false;

            this._startTime = 0;
            this._lastPlay = 0;

            this._buffSource = null;
            this._volumeGain = null;

            /**
             * The callback function which will be invoked when the audio stops
             * @property onEnd
             * @type {function}
             * @default null
             */
            this.onEnd = null;
        },
        properties: {
            /**
             * Is the audio source playing (Read Only)？
             * @property isPlaying
             * @type {boolean}
             * @readOnly
             * @default false
             */
            isPlaying: {
                get: function () {
                    return this._playing && !this._paused;
                },
                visible: false
            },
            /**
             * Is the audio source paused (Read Only)?
             * @property isPaused
             * @type {boolean}
             * @readOnly
             * @default false
             */
            isPaused:{
                get: function () {
                    return this._paused;
                },
                visible: false
            },
            /**
             * Playback position in seconds.
             * @property time
             * @type {number}
             * @default 0
             */
            time: {
                get: function () {
                    return Fire.AudioContext.getCurrentTime(this);
                },
                set: function (value) {
                    Fire.AudioContext.updateTime(this, value);
                },
                visible: false
            },
            _clip: {
                default: null,
                type: Fire.AudioClip
            },
            /**
             * The audio clip to play.
             * @property clip
             * @type {AudioClip}
             * @default null
             */
            clip:{
                get: function () {
                    return this._clip;
                },
                set: function (value) {
                    if (this._clip !== value) {
                        this._clip = value;
                        Fire.AudioContext.updateAudioClip(this);
                    }
                }
            },
            //
            _loop: false,
            /**
             * Is the audio source looping?
             * @property loop
             * @type {boolean}
             * @default false
             */
            loop: {
                get: function () {
                    return this._loop;
                },
                set: function (value) {
                    if (this._loop !== value) {
                        this._loop = value;
                        Fire.AudioContext.updateLoop(this);
                    }
                }
            },
            //
            _mute: false,
            /**
             * Is the audio source mute?
             * @property mute
             * @type {boolean}
             * @default false
             */
            mute: {
                get: function () {
                    return this._mute;
                },
                set: function (value) {
                    if (this._mute !== value) {
                        this._mute = value;
                        Fire.AudioContext.updateMute(this);
                    }
                }
            },
            //
            _volume: 1,
            /**
             * The volume of the audio source.
             * @property volume
             * @type {number}
             * @default 1
             */
            volume: {
                get: function () {
                    return this._volume;
                },
                set: function (value) {
                    if (this._volume !== value) {
                        this._volume = Math.clamp01(value);
                        Fire.AudioContext.updateVolume(this);
                    }
                },
                range: [0, 1]
            },
            //
            _playbackRate: 1.0,
            /**
             * The playback rate of the audio source.
             * @property playbackRate
             * @type {number}
             * @default 1
             */
            playbackRate: {
                get: function () {
                    return this._playbackRate;
                },
                set: function (value) {
                    if (this._playbackRate !== value) {
                        this._playbackRate = value;
                        if(this._playing) {
                            Fire.AudioContext.updatePlaybackRate(this);
                        }
                    }
                }
            },
            /**
             * If set to true, the audio source will automatically start playing on onLoad.
             * @property playOnLoad
             * @type {boolean}
             * @default true
             */
            playOnLoad: true
        },
        _onPlayEnd: function () {
            if ( this.onEnd ) {
                this.onEnd();
            }

            this._playing = false;
            this._paused = false;
        },
        /**
         * Pauses the clip.
         * @method pause
         */
        pause: function () {
            if ( this._paused )
                return;

            Fire.AudioContext.pause(this);
            this._paused = true;
        },
        /**
         * Plays the clip.
         * @method play
         */
        play: function () {
            if ( this._playing && !this._paused )
                return;

            if ( this._paused )
                Fire.AudioContext.play(this, this._startTime);
            else
                Fire.AudioContext.play(this, 0);

            this._playing = true;
            this._paused = false;
        },
        /**
         * Stops the clip
         * @method stop
         */
        stop: function () {
            if ( !this._playing ) {
                return;
            }

            Fire.AudioContext.stop(this);
            this._playing = false;
            this._paused = false;
        },
        //
        onLoad: function () {
            if (this._playing ) {
                this.stop();
            }
        },
        //
        onEnable: function () {
            if (this.playOnLoad) {
                this.play();
            }
        },
        //
        onDisable: function () {
            this.stop();
        }
    });

    //
    Fire.addComponentMenu(AudioSource, 'AudioSource');

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
        bufferSource.onended = target._onPlayEnd.bind(target);
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


/**
 * @class SpriteAnimationClip
 */
/**
 * @namespace SpriteAnimationClip
 */

/**
 * @class WrapMode
 * @static
 */
var WrapMode = Fire.defineEnum({
    /**
     * @property Default
     * @type {number}
     */
    Default: -1,
    /**
     * @property Once
     * @type {number}
     */
    Once: -1,
    /**
     * @property Loop
     * @type {number}
     */
    Loop: -1,
    /**
     * @property PingPong
     * @type {number}
     */
    PingPong: -1,
    /**
     * @property ClampForever
     * @type {number}
     */
    ClampForever: -1
});

/**
 * @class StopAction
 * @static
 */
var StopAction = Fire.defineEnum({
    /**
     * Do nothing
     * @property DoNothing
     * @type {number}
     */
    DoNothing: -1,
    /**
     * Set to default sprite when the sprite animation stopped
     * @property DefaultSprite
     * @type {number}
     */
    DefaultSprite: 1,
    /**
     * Hide the sprite when the sprite animation stopped
     * @property Hide
     * @type {number}
     */
    Hide: -1,
    /**
     * Destroy the entity the sprite belongs to when the sprite animation stopped
     * @property Destroy
     * @type {number}
     */
    Destroy: -1
});

// ------------------------------------------------------------------
/// The structure to descrip a frame in the sprite animation clip
// ------------------------------------------------------------------
var FrameInfo = Fire.define('FrameInfo')
    .prop('sprite', null, Fire.ObjectType(Fire.Sprite))
    .prop('frames', 0, Fire.Integer_Obsoleted);

/**
 * The sprite animation clip.
 * @class SpriteAnimationClip
 * @extends CustomAsset
 * @constructor
 */
var SpriteAnimationClip = Fire.Class({
    name: 'Fire.SpriteAnimationClip',
    //
    extends: Fire.CustomAsset,
    //
    constructor: function() {
        // the array of the end frame of each frame info
        this._frameInfoFrames = null;
    },
    //
    properties: {
        /**
         * Default wrap mode.
         * @property wrapMode
         * @type {SpriteAnimationClip.WrapMode}
         * @default SpriteAnimationClip.WrapMode.Default
         */
        wrapMode: {
            default: WrapMode.Default,
            type: WrapMode
        },
        /**
         * The default type of action used when the animation stopped.
         * @property stopAction
         * @type {SpriteAnimationClip.StopAction}
         * @default SpriteAnimationClip.StopAction.DoNothing
         */
        stopAction: {
            default: StopAction.DoNothing,
            type: StopAction
        },
        /**
        * The default speed of the animation clip.
        * @property speed
        * @type {number}
        * @default 1
        */
        speed: 1,
        //
        _frameRate: 60,
        /**
         * The sample rate used in this animation clip.
         * @property frameRate
         * @type {number}
         * @default 60
         */
        frameRate: {
            get: function() {
                return this._frameRate;
            },
            set: function() {
                if (value !== this._frameRate) {
                    this._frameRate = Math.round(Math.max(value, 1));
                }
            }
        },
        /**
         * The frame infos in the sprite animation clips.
         * are array of {sprite: Sprite, frames: Sustained_how_many_frames}
         * @property frameInfos
         * @type {object[]}
         * @default []
         */
        frameInfos:{
            default: [],
            type: FrameInfo
        }
    },
    //
    getTotalFrames: function() {
        var frames = 0;
        for (var i = 0; i < this.frameInfos.length; ++i) {
            frames += this.frameInfos[i].frames;
        }
        return frames;
    },
    //
    getFrameInfoFrames: function() {
        if (this._frameInfoFrames === null) {
            this._frameInfoFrames = new Array(this.frameInfos.length);
            var totalFrames = 0;
            for (var i = 0; i < this.frameInfos.length; ++i) {
                totalFrames += this.frameInfos[i].frames;
                this._frameInfoFrames[i] = totalFrames;
            }
        }
        return this._frameInfoFrames;
    }
});

SpriteAnimationClip.WrapMode = WrapMode;

SpriteAnimationClip.StopAction = StopAction;

Fire.addCustomAssetMenu(SpriteAnimationClip, "New Sprite Animation");

Fire.SpriteAnimationClip = SpriteAnimationClip;

module.exports = SpriteAnimationClip;

Fire._RFpop();
},{}],"sprite-animation-state":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation-state');
// sprite-animation-state.js

var SpriteAnimationClip = require('sprite-animation-clip');

/**
 * The sprite animation state.
 * @class SpriteAnimationState
 * @constructor
 * @param {SpriteAnimationClip} animClip
 */
var SpriteAnimationState = function (animClip) {
    if (!animClip) {
// @if DEV
        Fire.error('Unspecified sprite animation clip');
// @endif
        return;
    }
    /**
     * The name of the sprite animation state.
     * @property name
     * @type {string}
     */
    this.name = animClip.name;
    /**
     * The referenced sprite animation clip
     * @property clip
     * @type {SpriteAnimationClip}
     */
    this.clip = animClip;
    /**
     * The wrap mode
     * @property wrapMode
     * @type {SpriteAnimationClip.WrapMode}
     */
    this.wrapMode = animClip.wrapMode;
    /**
     * The stop action
     * @property stopAction
     * @type {SpriteAnimationClip.StopAction}
     */
    this.stopAction = animClip.stopAction;
    /**
     * The speed to play the sprite animation clip
     * @property speed
     * @type {number}
     */
    this.speed = animClip.speed;
    // the array of the end frame of each frame info in the sprite animation clip
    this._frameInfoFrames = animClip.getFrameInfoFrames();
    /**
     * The total frame count of the sprite animation clip
     * @property totalFrames
     * @type {number}
     */
    this.totalFrames = this._frameInfoFrames.length > 0 ? this._frameInfoFrames[this._frameInfoFrames.length - 1] : 0;
    /**
     * The length of the sprite animation in seconds with speed = 1.0f
     * @property length
     * @type {number}
     */
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
 * The current frame info index.
 * @method getCurrentIndex
 * @return {number}
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

/**
 * The sprite animation Component.
 * @class SpriteAnimation
 * @extends Component
 * @constructor
 */
var SpriteAnimation = Fire.Class({
    //
    name: "Fire.SpriteAnimation",
    //
    extends: Fire.Component,
    //
    constructor: function() {
        this._nameToState = null;
        this._curAnimation = null;
        this._spriteRenderer = null;
        this._defaultSprite = null;
        this._lastFrameIndex = -1;
        this._curIndex = -1;
        this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
    },
    //
    properties:{
        /**
         * The default animation.
         * @property defaultAnimation
         * @type {SpriteAnimationClip}
         * @default null
         */
        defaultAnimation: {
            default: null,
            type: Fire.SpriteAnimationClip
        },
        /**
         * The Animated clip list.
         * @property animations
         * @type {SpriteAnimationClip[]}
         * @default []
         */
        animations: {
            default: [],
            type: Fire.SpriteAnimationClip
        },
        //
        _playAutomatically: true,
        /**
         * Should the default animation clip (Animation.clip) automatically start playing on startup.
         * @property playAutomatically
         * @type {boolean}
         * @default true
         */
        playAutomatically: {
            get: function() {
                return this._playAutomatically;
            },
            set: function (value) {
                this._playAutomatically = value;
            }
        }
    },
    //
    _init: function() {
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
    },
    /**
     * Get Animation State.
     * @method getAnimState
     * @param {string} animName - The name of the animation
     * @return {SpriteAnimationState}
     */
    getAnimState: function (name) {
        return this._nameToState && this._nameToState[name];
    },
    /**
     * Indicates whether the animation is playing
     * @method isPlaying
     * @param {string} [name] - The name of the animation
     * @return {boolean}
     */
    isPlaying: function(name) {
        var playingAnim = this.enabled && this._curAnimation;
        return !!playingAnim && ( !name || playingAnim.name === name );
    },
    /**
     * Play Animation
     * @method play
     * @param {SpriteAnimationState} [animState] - The animState of the sprite Animation state or animation name
     * @param {number} [time] - The time of the animation time
     */
    play: function (animState, time) {
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
            this._sample();
        }
    },
    /**
     * Stop Animation
     * @method stop
     * @param {SpriteAnimationState} [animState] - The animState of the sprite animation state or animation name
     */
    stop: function (animState) {
        if (typeof animState === 'string') {
            this._curAnimation = this.getAnimState(animState);
        }
        else {
            this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
        }

        if (this._curAnimation !== null) {

            this._curAnimation.time = 0;

            var stopAction = this._curAnimation.stopAction;

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
    },
    onLoad: function() {
        this._init();
        if (this.enabled) {
            if (this._playAutomatically && this.defaultAnimation) {
                var animState = this.getAnimState(this.defaultAnimation.name);
                this.play(animState, 0);
            }
        }
    },
    lateUpdate: function() {
        if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
            var delta = Fire.Time.deltaTime * this._curAnimation.speed;
            this._step(delta);
        }
    },
    _step: function (deltaTime) {
        if (this._curAnimation !== null) {
            this._curAnimation.time += deltaTime;
            this._sample();
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
    },
    _sample: function () {
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
    }
});

Fire.SpriteAnimation = SpriteAnimation;

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["audio-clip","audio-fix-ios","audio-legacy","audio-source","audio-web-audio","sprite-animation-clip","sprite-animation-state","sprite-animation","Game","GameOverMenu","MainMenu","PipeGroup","PipeGroupManager","ScrollPicture","Sheep"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvR2FtZU92ZXJNZW51LmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9HYW1lLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9NYWluTWVudS5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvUGlwZUdyb3VwTWFuYWdlci5qcyIsIi4uLy4uLy4uL2Rldi9zY3JpcHQvUGlwZUdyb3VwLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9TY3JvbGxQaWN0dXJlLmpzIiwiLi4vLi4vLi4vZGV2L3NjcmlwdC9TaGVlcC5qcyIsIi4uLy4uLy4uL2Rldi9zcmMvYXVkaW8tY2xpcC5qcyIsIi4uLy4uLy4uL2Rldi9zcmMvYXVkaW8tZml4LWlvcy5qcyIsIi4uLy4uLy4uL2Rldi9zcmMvYXVkaW8tbGVnYWN5LmpzIiwiLi4vLi4vLi4vZGV2L3NyYy9hdWRpby1zb3VyY2UuanMiLCIuLi8uLi8uLi9kZXYvc3JjL2F1ZGlvLXdlYi1hdWRpby5qcyIsIi4uLy4uLy4uL2Rldi9zcHJpdGUtYW5pbWF0aW9uLWNsaXAuanMiLCIuLi8uLi8uLi9kZXYvc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsIi4uLy4uLy4uL2Rldi9zcHJpdGUtYW5pbWF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc1Y2EzOGpkSHVkQ2g3UUhMczcwMFA1UScsICdHYW1lT3Zlck1lbnUnKTtcbi8vIHNjcmlwdC9HYW1lT3Zlck1lbnUuanNcblxudmFyIEdhbWVPdmVyTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHRpdGxlOntcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDpnaLmnb9cbiAgICAgICAgcGFuZWw6e1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaMiemSrlxuICAgICAgICBidG5fcGxheTp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5b6X5YiGXG4gICAgICAgIHNjb3JlVGV4dDp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBHYW1lID0gcmVxdWlyZSgnR2FtZScpO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC50ZXh0ID0gR2FtZS5pbnN0YW5jZS5zY29yZTtcbiAgICAgICAgdGhpcy5idG5fcGxheS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSBcIjBcIjtcbiAgICAgICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgR2FtZS5pbnN0YW5jZS5tYXNrLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ01haW5NZW51Jyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy50aXRsZS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKDAsIDI1MCk7XG4gICAgICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAtMjAwKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50aXRsZS50cmFuc2Zvcm0ueSA+IDEwMCkge1xuICAgICAgICAgICAgdGhpcy50aXRsZS50cmFuc2Zvcm0ueSAtPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogNDAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aXRsZS50cmFuc2Zvcm0ueSA9IDEwMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYW5lbC50cmFuc2Zvcm0ueSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDUwMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWwudHJhbnNmb3JtLnkgPSAwO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzQ4ZjhkMTVac3RPNGFSWUt0NUJLQU13JywgJ0dhbWUnKTtcbi8vIHNjcmlwdC9HYW1lLmpzXG5cbnZhciBTaGVlcCA9IHJlcXVpcmUoJ1NoZWVwJyk7XG52YXIgU2Nyb2xsUGljdHVyZSA9IHJlcXVpcmUoJ1Njcm9sbFBpY3R1cmUnKTtcbnZhciBQaXBlR3JvdXBNYW5hZ2VyID0gcmVxdWlyZSgnUGlwZUdyb3VwTWFuYWdlcicpO1xuXG52YXIgR2FtZVN0YXRlID0gRmlyZS5kZWZpbmVFbnVtKHtcbiAgICBSZWFkeTogLTEsXG4gICAgUnVuIDogLTEsXG4gICAgT3ZlcjogLTFcbn0pO1xuXG52YXIgR2FtZSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOa4uOaIj+eKtuaAgVxuICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5SZWFkeTtcbiAgICAgICAgLy8g5YiG5pWwXG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICAvLy0tIOW+l+WIhueJueaViFxuICAgICAgICB0aGlzLnNjb3JlRWZmZWN0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zY29yZVRvcFBvcyA9IDA7XG4gICAgICAgIC8vIOmBrue9qVxuICAgICAgICB0aGlzLm1hc2sgPSBudWxsO1xuICAgICAgICB0aGlzLm1hc2tSZW5kZXIgPSBudWxsO1xuICAgICAgICAvL1xuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGVtcE1hc2s6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDojrflj5bnu7XnvopcbiAgICAgICAgc2hlZXA6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBTaGVlcFxuICAgICAgICB9LFxuICAgICAgICAvLyDojrflj5bog4zmma9cbiAgICAgICAgYmFja2dyb3VuZDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFNjcm9sbFBpY3R1cmVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6I635Y+W5Zyw6Z2iXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFNjcm9sbFBpY3R1cmVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6I635Y+W6Zqc56KN54mp566h55CGXG4gICAgICAgIHBpcGVHcm91cE1ncjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFBpcGVHcm91cE1hbmFnZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6I635Y+WZ2FtZU92ZXJNZW515a+56LGhXG4gICAgICAgIGdhbWVPdmVyTWVudToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOiOt+WPluWIhuaVsOWvueixoVxuICAgICAgICBzY29yZVRleHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHlBdWlkbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQXVkaW9Tb3VyY2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6I635Y+W6IOM5pmv6Z+z5pWIXG4gICAgICAgIGdhbWVCZ0F1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5BdWRpb1NvdXJjZVxuICAgICAgICB9LFxuICAgICAgICAvLyDojrflj5bmrbvkuqHpn7PmlYhcbiAgICAgICAgZGllQXVkaW86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkF1ZGlvU291cmNlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOiOt+WPluWksei0pemfs+aViFxuICAgICAgICBnYW1lT3ZlckF1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5BdWRpb1NvdXJjZVxuICAgICAgICB9LFxuICAgICAgICAvLyDojrflj5blvpfliIbpn7PmlYhcbiAgICAgICAgc2NvcmVBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQXVkaW9Tb3VyY2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5b6X5YiG54m55pWIXG4gICAgICAgIHRlbXBEaXNhcHBlYXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDliqDliIbpooTliLZcbiAgICAgICAgdGVtcEFkZFNvcmNlOntcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBvblN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLlJlYWR5O1xuICAgICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5zY29yZVRleHQudGV4dCA9IHRoaXMuc2NvcmU7XG5cbiAgICAgICAgLy8g5omA5pyJ5YWD57Sg5YGc5q2i5pu05pawXG4gICAgICAgIHRoaXMuX3BhdXNlVXBkYXRlKGZhbHNlKTtcbiAgICAgICAgLy8g6YGu572pXG4gICAgICAgIHRoaXMubWFzayA9IEZpcmUuRW50aXR5LmZpbmQoJy9tYXNrJyk7XG4gICAgICAgIGlmICghdGhpcy5tYXNrKSB7XG4gICAgICAgICAgICB0aGlzLm1hc2sgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMudGVtcE1hc2spO1xuICAgICAgICAgICAgdGhpcy5tYXNrLm5hbWUgPSAnbWFzayc7XG4gICAgICAgICAgICB0aGlzLm1hc2suZG9udERlc3Ryb3lPbkxvYWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFza1JlbmRlciA9IHRoaXMubWFzay5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgfSxcbiAgICBfcGF1c2VVcGRhdGU6IGZ1bmN0aW9uIChlbmFibGVkKXtcbiAgICAgICAgdGhpcy5ncm91bmQuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZC5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBpcGVHcm91cE1nci5waXBlR3JvdXBMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgcGlwZUdyb3VwID0gdGhpcy5waXBlR3JvdXBNZ3IucGlwZUdyb3VwTGlzdFtpXS5nZXRDb21wb25lbnQoJ1BpcGVHcm91cCcpO1xuICAgICAgICAgICAgcGlwZUdyb3VwLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGlwZUdyb3VwTWdyLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIH0sXG4gICAgX3BsYXlSZWFkeUdhbWVCZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlYWR5QXVpZG8ucGxheSgpO1xuICAgICAgICB0aGlzLnJlYWR5QXVpZG8ub25FbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZih0aGlzLmdhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLm92ZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ2FtZUJnQXVkaW8ubG9vcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmdhbWVCZ0F1ZGlvLnBsYXkoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgbGF0ZVVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuZ2FtZVN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZS5SZWFkeTpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXNrLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSAtPSBGaXJlLlRpbWUuZGVsdGFUaW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPCAwLjMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlSZWFkeUdhbWVCZygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5SdW47XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXVzZVVwZGF0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlLlJ1bjpcbiAgICAgICAgICAgICAgICB2YXIgc2hlZXBSZWN0ID0gdGhpcy5zaGVlcC5yZW5kZXJlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAgICAgICAgIHZhciBnYW1lT3ZlciA9IHRoaXMucGlwZUdyb3VwTWdyLmNvbGxpc2lvbkRldGVjdGlvbihzaGVlcFJlY3QpO1xuICAgICAgICAgICAgICAgIGlmIChnYW1lT3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAvLyDog4zmma/pn7PmlYjlgZzmraLvvIzmrbvkuqHpn7PmlYjmkq3mlL5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lQmdBdWRpby5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGllQXVkaW8ucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyQXVkaW8ucGxheSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLk92ZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlZXAuc3RhdGUgPSBTaGVlcC5TdGF0ZS5EZWFkO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhdXNlVXBkYXRlKGZhbHNlKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyTWVudS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDorqHnrpfliIbmlbBcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNvcmNlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVTY29yZUVmZmVjdCgpO1xuICAgIH0sXG4gICAgLy8g5pu05paw5YiG5pWwXG4gICAgdXBkYXRlU29yY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5leHRQaXBlR3JvdXAgPSB0aGlzLnBpcGVHcm91cE1nci5nZXROZXh0KCk7XG4gICAgICAgIGlmIChuZXh0UGlwZUdyb3VwKSB7XG4gICAgICAgICAgICB2YXIgc2hlZXBSZWN0ID0gdGhpcy5zaGVlcC5yZW5kZXJlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAgICAgdmFyIHBpcGVHcm91cFJlY3QgPSBuZXh0UGlwZUdyb3VwLmJvdHRvbVJlbmRlcmVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgICAgICAvLyDlvZPnu7XnvornmoTlj7PovrnlnZDmoIfotorov4fmsLTnrqHlj7PkvqflnZDmoIdcbiAgICAgICAgICAgIHZhciBjcm9zc2VkID0gc2hlZXBSZWN0LnhNaW4gPiBwaXBlR3JvdXBSZWN0LnhNYXg7XG4gICAgICAgICAgICBpZiAoY3Jvc3NlZCkge1xuICAgICAgICAgICAgICAgIC8vIOWIhuaVsCsxXG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZSsrO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnNjb3JlO1xuICAgICAgICAgICAgICAgIHRoaXMucGlwZUdyb3VwTWdyLnNldEFzUGFzc2VkKG5leHRQaXBlR3JvdXApO1xuICAgICAgICAgICAgICAgIC8vIOWIhuaVsOWinuWKoOmfs+aViFxuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVBdWRpby5wbGF5KCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy5zaGVlcC50cmFuc2Zvcm0ueCAtIDMwLCB0aGlzLnNoZWVwLnRyYW5zZm9ybS55ICsgNTApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVFZmZlY3QgPSB0aGlzLl9wbGF5U2NvcmVFZmZlY3QodGhpcy50ZW1wQWRkU29yY2UsIHBvcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZVRvcFBvcyA9IHRoaXMuc2NvcmVFZmZlY3QudHJhbnNmb3JtLnkgKyAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9wbGF5U2NvcmVFZmZlY3Q6IGZ1bmN0aW9uKHRlbXBFbnRpdHksIHBvcykge1xuICAgICAgICB2YXIgZWZmZWN0ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRW50aXR5KTtcbiAgICAgICAgZWZmZWN0LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICAgICAgcmV0dXJuIGVmZmVjdDtcbiAgICB9LFxuICAgIF91cGRhdGVTY29yZUVmZmVjdDogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuc2NvcmVFZmZlY3QpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVFZmZlY3QudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIDIwMDtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjb3JlRWZmZWN0LnRyYW5zZm9ybS55ID4gdGhpcy5zY29yZVRvcFBvcykge1xuICAgICAgICAgICAgICAgIHZhciBkaXNhcHBlYXIgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMudGVtcERpc2FwcGVhcik7XG4gICAgICAgICAgICAgICAgdmFyIGRpc2FwcGVhckFuaW0gPSBkaXNhcHBlYXIuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICBkaXNhcHBlYXIudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy5zY29yZUVmZmVjdC50cmFuc2Zvcm0ucG9zaXRpb247XG4gICAgICAgICAgICAgICAgZGlzYXBwZWFyQW5pbS5wbGF5KCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNjb3JlRWZmZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3JlRWZmZWN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3JlVG9wUG9zID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5HYW1lLmluc3RhbmNlID0gbnVsbDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMzQzOGFac0xzSklKSktrZE5CckRRTlUnLCAnTWFpbk1lbnUnKTtcbi8vIHNjcmlwdC9NYWluTWVudS5qc1xuXG52YXIgU2Nyb2xsUGljdHVyZSA9IHJlcXVpcmUoJ1Njcm9sbFBpY3R1cmUnKTtcblxudmFyIE1haW5NZW51ID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tYXNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXNrUmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5mYWRlSW5HYW1lID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOmBrue9qeaooeadv1xuICAgICAgICB0ZW1wTWFzazoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWcsOmdolxuICAgICAgICBncm91bmQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBTY3JvbGxQaWN0dXJlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICBiYWNrZ3JvdW5kOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZSAgIDogU2Nyb2xsUGljdHVyZVxuICAgICAgICB9LFxuICAgICAgICAvLyDlvIDlp4vmjInpkq5cbiAgICAgICAgYnRuX3BsYXk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fcGxheS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZmFkZUluR2FtZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm1hc2suYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm1hc2sgPSBGaXJlLkVudGl0eS5maW5kKCcvbWFzaycpO1xuICAgICAgICB0aGlzLm1hc2tSZW5kZXIgPSBudWxsO1xuICAgICAgICBpZiAoIXRoaXMubWFzaykge1xuICAgICAgICAgICAgdGhpcy5tYXNrID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnRlbXBNYXNrKTtcbiAgICAgICAgICAgIHRoaXMubWFzay5uYW1lID0gJ21hc2snO1xuICAgICAgICAgICAgdGhpcy5tYXNrLmRvbnREZXN0cm95T25Mb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hc2tSZW5kZXIgPSB0aGlzLm1hc2suZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSA9IDE7XG4gICAgICAgIHRoaXMuZmFkZUluR2FtZSA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCdHYW1lJyk7XG4gICAgfSxcbiAgICBsYXRlVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm1hc2suYWN0aXZlKSB7XG4gICAgICAgICAgICB2YXIgZmFkZVN0ZXAgPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogMjtcbiAgICAgICAgICAgIGlmICh0aGlzLmZhZGVJbkdhbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hc2tSZW5kZXIuY29sb3IuYSArPSBmYWRlU3RlcDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ0dhbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHQvLyBzdG9wIGNhbGxpbmcgbG9hZFNjZW5lIGFueW1vcmUhXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgLT0gZmFkZVN0ZXA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFza1JlbmRlci5jb2xvci5hIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXNrUmVuZGVyLmNvbG9yLmEgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2E5MmZmU3BtcXBFOG95MHVlUW8rVkFnJywgJ1BpcGVHcm91cE1hbmFnZXInKTtcbi8vIHNjcmlwdC9QaXBlR3JvdXBNYW5hZ2VyLmpzXG5cbnZhciBQaXBlR3JvdXBNYW5hZ2VyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5LiK5LiA5qyh5Yib5bu6UGlwZUdyb3Vw55qE5pe26Ze0XG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSAwO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDojrflj5ZQaXBlR3JvdXDmqKHmnb9cbiAgICAgICAgc3JjUGlwZUdyb3VwOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8gUGlwZUdyb3Vw5Yid5aeL5Z2Q5qCHXG4gICAgICAgIGluaXRQaXBlR3JvdXBQb3M6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG5ldyBGaXJlLlZlYzIoNjAwLCAwKVxuICAgICAgICB9LFxuICAgICAgICAvLyDliJvlu7pQaXBlR3JvdXDpnIDopoHnmoTml7bpl7RcbiAgICAgICAgc3Bhd25JbnRlcnZhbDogMyxcbiAgICAgICAgLy8g566h6YGT5YiX6KGoXG4gICAgICAgIHBpcGVHcm91cExpc3Q6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIneWni+WMllxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxhc3RUaW1lID0gRmlyZS5UaW1lLnRpbWUgKyAxMDtcbiAgICB9LFxuICAgIC8vIOWIm+W7uueuoemBk+e7hFxuICAgIGNyZWF0ZVBpcGVHcm91cEVudGl0eTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGlwZUdyb3VwID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnNyY1BpcGVHcm91cCk7XG4gICAgICAgIHBpcGVHcm91cC5wYXJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICAgICAgcGlwZUdyb3VwLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuaW5pdFBpcGVHcm91cFBvcztcbiAgICAgICAgcGlwZUdyb3VwLmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDojrflj5bkuIvkuKrmnKrpgJrov4fnmoTmsLTnrqFcbiAgICBnZXROZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5waXBlR3JvdXBMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIHBpcGVHcm91cCA9IHBpcGVHcm91cEVudGl0eS5nZXRDb21wb25lbnQoJ1BpcGVHcm91cCcpO1xuICAgICAgICAgICAgaWYgKCFwaXBlR3JvdXAucGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpcGVHcm91cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIC8vIOagh+iusOW3sumAmui/h+eahOawtOeuoVxuICAgIHNldEFzUGFzc2VkOiBmdW5jdGlvbiAocGlwZUdyb3VwKSB7XG4gICAgICAgIHBpcGVHcm91cC5wYXNzZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g56Kw5pKe5qOA5rWLXG4gICAgY29sbGlzaW9uRGV0ZWN0aW9uOiBmdW5jdGlvbiAoc2hlZXBSZWN0KSB7XG4gICAgICAgIC8vIOmZjeS9jumavuW6plxuICAgICAgICBzaGVlcFJlY3QueE1pbiArPSAyMDtcbiAgICAgICAgc2hlZXBSZWN0LnhNYXggLT0gMjA7XG4gICAgICAgIHNoZWVwUmVjdC55TWluICs9IDE1O1xuICAgICAgICBzaGVlcFJlY3QueU1heCAtPSAxNTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5waXBlR3JvdXBMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgcGlwZUdyb3VwRW50aXR5ID0gdGhpcy5waXBlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgLy8g5LiK5pa56Zqc56KN54mpXG4gICAgICAgICAgICB2YXIgcGlwZSA9IHBpcGVHcm91cEVudGl0eS5maW5kKCd0b3BQaXBlJyk7XG4gICAgICAgICAgICB2YXIgcGlwZVJlbmRlciA9IHBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpXG4gICAgICAgICAgICB2YXIgcGlwZVJlY3QgPSBwaXBlUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChGaXJlLkludGVyc2VjdGlvbi5yZWN0UmVjdChzaGVlcFJlY3QsIHBpcGVSZWN0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXHRcdFx0XG4gICAgICAgICAgICAvLyDkuIvmlrnpmpznoo3nialcbiAgICAgICAgICAgIHBpcGUgPSBwaXBlR3JvdXBFbnRpdHkuZmluZCgnYm90dG9tUGlwZScpO1xuICAgICAgICAgICAgcGlwZVJlbmRlciA9IHBpcGUuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICAgICAgcGlwZVJlY3QgPSBwaXBlUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgICAgXHRcbiAgICAgICAgICAgIGlmIChGaXJlLkludGVyc2VjdGlvbi5yZWN0UmVjdChzaGVlcFJlY3QsIHBpcGVSZWN0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDmr4/ov4fkuIDmrrXml7bpl7TliJvlu7rpmpznoo3nialcbiAgICAgICAgdmFyIGlkbGVUaW1lID0gTWF0aC5hYnMoRmlyZS5UaW1lLnRpbWUgLSB0aGlzLmxhc3RUaW1lKTtcbiAgICAgICAgaWYgKGlkbGVUaW1lID49IHRoaXMuc3Bhd25JbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5sYXN0VGltZSA9IEZpcmUuVGltZS50aW1lO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVQaXBlR3JvdXBFbnRpdHkoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdjZTQ0Nm13TXk5RGtMc3lNdVpUR1RDOScsICdQaXBlR3JvdXAnKTtcbi8vIHNjcmlwdC9QaXBlR3JvdXAuanNcblxudmFyIFBpcGVHcm91cCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOS/neWtmOS4i+aWueeuoemBk+eahFJlbmRlcmVyLOaWueS+v+iOt+W+l+awtOW5s+i+ueeVjFxuICAgICAgICB0aGlzLmJvdHRvbVJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgLy8g5piv5ZCm5bey57uP6KKr6YCa6L+HXG4gICAgICAgIHRoaXMucGFzc2VkID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOWfuuehgOenu+WKqOmAn+W6plxuICAgICAgICBzcGVlZDogMjAwLFxuICAgICAgICAvLyDotoXlh7rov5nkuKrojIPlm7TlsLHkvJrooqvplIDmr4FcbiAgICAgICAgbWluWDogLTkwMCxcbiAgICAgICAgLy8g5LiK5pa5566h5a2Q5Z2Q5qCH6IyD5Zu0IE1pbiDkuI4gTWF4XG4gICAgICAgIHRvcFBvc1JhbmdlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBuZXcgRmlyZS5WZWMyKDEwMCwgMTYwKVxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIrmlrnkuI7kuIvmlrnnrqHpgZPnmoTpl7Tot50gTWluIOS4jiBNYXhcbiAgICAgICAgc3BhY2luZ1JhbmdlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBuZXcgRmlyZS5WZWMyKDIxMCwgMjMwKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliJ3lp4vljJZcbiAgICBvbkVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG9wWXBvcyA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy50b3BQb3NSYW5nZS54LCB0aGlzLnRvcFBvc1JhbmdlLnkpO1xuICAgICAgICB2YXIgcmFuZG9tU3BhY2luZyA9IE1hdGgucmFuZG9tUmFuZ2UodGhpcy5zcGFjaW5nUmFuZ2UueCwgdGhpcy5zcGFjaW5nUmFuZ2UueSk7XG4gICAgICAgIHZhciBib3R0b21ZcG9zID0gdG9wWXBvcyAtIHJhbmRvbVNwYWNpbmc7XG5cbiAgICAgICAgdmFyIHRvcEVudGl0eSA9IHRoaXMuZW50aXR5LmZpbmQoJ3RvcFBpcGUnKTtcbiAgICAgICAgdG9wRW50aXR5LnRyYW5zZm9ybS55ID0gdG9wWXBvcztcblxuICAgICAgICB2YXIgYm90dG9tRW50aXR5ID0gdGhpcy5lbnRpdHkuZmluZCgnYm90dG9tUGlwZScpO1xuICAgICAgICBib3R0b21FbnRpdHkudHJhbnNmb3JtLnkgPSBib3R0b21ZcG9zO1xuXG4gICAgICAgIHRoaXMuYm90dG9tUmVuZGVyZXIgPSBib3R0b21FbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICB0aGlzLnBhc3NlZCA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtLnggLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuc3BlZWQ7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybS54IDwgdGhpcy5taW5YKSB7XG4gICAgICAgICAgICB0aGlzLmVudGl0eS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNTg0MDJXSlQvOUxTckpMRlMwSHZISXgnLCAnU2Nyb2xsUGljdHVyZScpO1xuLy8gc2NyaXB0L1Njcm9sbFBpY3R1cmUuanNcblxudmFyIFNjcm9sbFBpY3R1cmUgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOa7muWKqOeahOmAn+W6plxuICAgICAgICBzcGVlZDoyMDAsXG4gICAgICAgIC8vIFjovbTovrnnvJhcbiAgICAgICAgb2Zmc2V0WDogMFxuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtLnggLT0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuc3BlZWQ7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybS54IDwgLXRoaXMub2Zmc2V0WCkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0ueCArPSB0aGlzLm9mZnNldFg7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnOTIzOTZOMzh5WkViS1hLVUhBbHp5QkEnLCAnU2hlZXAnKTtcbi8vIHNjcmlwdC9TaGVlcC5qc1xuXG4vLy0tIOe7tee+iueKtuaAgVxudmFyIFN0YXRlID0gRmlyZS5kZWZpbmVFbnVtKHtcbiAgICBOb25lICAgOiAtMSxcbiAgICBSdW4gICAgOiAtMSxcbiAgICBKdW1wICAgOiAtMSxcbiAgICBEcm9wICAgOiAtMSxcbiAgICBEcm9wRW5kOiAtMSxcbiAgICBEZWFkICAgOiAtMVxufSk7XG5cbnZhciBTaGVlcCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW9k+WJjeaSreaUvuWKqOeUu+e7hOS7tlxuICAgICAgICB0aGlzLmFuaW0gPSBudWxsO1xuICAgICAgICAvLyDlvZPliY3pgJ/luqZcbiAgICAgICAgdGhpcy5jdXJyZW50U3BlZWQgPSAwO1xuICAgICAgICAvLyDnu7Xnvorlm77niYfmuLLmn5NcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG4gICAgICAgIC8vIOi3s+i3g+S6i+S7tlxuICAgICAgICB0aGlzLmp1bXBFdmVudCA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOWIneWni+WdkOagh1xuICAgICAgICBpbml0U2hlZXBQb3M6IG5ldyBGaXJlLlZlYzIoLTE1MCwgLTE4MCksXG4gICAgICAgIC8vIFnovbTmnIDlpKfpq5jluqZcbiAgICAgICAgbWF4WTogMjUwLFxuICAgICAgICAvLyDlnLDpnaLpq5jluqZcbiAgICAgICAgZ3JvdW5kWTogLTE3MCxcbiAgICAgICAgLy8g6YeN5YqbXG4gICAgICAgIGdyYXZpdHk6IDkuOCxcbiAgICAgICAgLy8g6LW36Lez6YCf5bqmXG4gICAgICAgIGluaXRTcGVlZDogNTAwLFxuICAgICAgICAvLyDnu7XnvornirbmgIFcbiAgICAgICAgX3N0YXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBTdGF0ZS5SdW4sXG4gICAgICAgICAgICB0eXBlOiBTdGF0ZSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgIT09IFN0YXRlLk5vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbmltTmFtZSA9IFN0YXRlW3RoaXMuX3N0YXRlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbS5wbGF5KGFuaW1OYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0eXBlOiBTdGF0ZVxuICAgICAgICB9LFxuICAgICAgICAvLyDojrflj5ZKdW1w6Z+z5pWIXG4gICAgICAgIGp1bXBBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQXVkaW9Tb3VyY2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6I635Y+WSnVtcOeJueaViFxuICAgICAgICBqdW1wRWZmZWN0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgZHJvcEVuZEVmZmVjdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIneWni+WMllxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0gPSB0aGlzLmdldENvbXBvbmVudChGaXJlLlNwcml0ZUFuaW1hdGlvbik7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLmluaXRTaGVlcFBvcztcbiAgICAgICAgLy8g5re75Yqg57u1576K5o6n5Yi25LqL5Lu2KOS4uuS6huazqOmUgOS6i+S7tue8k+WtmOS6i+S7tilcbiAgICAgICAgdGhpcy5qdW1wRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5EZWFkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fanVtcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlZG93bicsIHRoaXMuanVtcEV2ZW50KTtcbiAgICB9LFxuICAgIC8vIOWIoOmZpFxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDms6jplIDnu7XnvormjqfliLbkuovku7ZcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlZG93bicsIHRoaXMuanVtcEV2ZW50KTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLl91cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOe7tee+iueKtuaAgVxuICAgIF91cGRhdGVTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU2hlZXAuU3RhdGUuSnVtcDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U3BlZWQgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5Ecm9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU2hlZXAuU3RhdGUuRHJvcDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm0ueSA8PSB0aGlzLmdyb3VuZFkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0ueSA9IHRoaXMuZ3JvdW5kWTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLkRyb3BFbmQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaSreaUvueBsOWwmOeJueaViFxuICAgICAgICAgICAgICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy50cmFuc2Zvcm0ueCwgdGhpcy50cmFuc2Zvcm0ueSAtIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheUVmZmVjdCh0aGlzLmRyb3BFbmRFZmZlY3QsIHBvcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTaGVlcC5TdGF0ZS5Ecm9wRW5kOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5hbmltLmlzUGxheWluZygnRHJvcEVuZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5SdW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmm7TmlrDnu7XnvorlnZDmoIdcbiAgICBfdXBkYXRlVHJhbnNmb3JtOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmbHlpbmcgPSB0aGlzLnN0YXRlID09PSBTaGVlcC5TdGF0ZS5KdW1wIHx8IHRoaXMudHJhbnNmb3JtLnkgPiB0aGlzLmdyb3VuZFk7XG4gICAgICAgIGlmIChmbHlpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNwZWVkIC09IChGaXJlLlRpbWUuZGVsdGFUaW1lICogMTAwKSAqIHRoaXMuZ3Jhdml0eTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtLnkgKz0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuY3VycmVudFNwZWVkO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlp4vot7Pot4Porr7nva7nirbmgIHmlbDmja7vvIzmkq3mlL7liqjnlLtcbiAgICBfanVtcDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gU3RhdGUuSnVtcDtcbiAgICAgICAgdGhpcy5jdXJyZW50U3BlZWQgPSB0aGlzLmluaXRTcGVlZDtcblxuICAgICAgICAvLyDmkq3mlL7ot7Ppn7PmlYhcbiAgICAgICAgdGhpcy5qdW1wQXVkaW8uc3RvcCgpO1xuICAgICAgICB0aGlzLmp1bXBBdWRpby5wbGF5KCk7XG4gICAgICAgIC8vIOaSreaUvueBsOWwmOeJueaViFxuICAgICAgICB2YXIgcG9zID0gbmV3IFZlYzIodGhpcy50cmFuc2Zvcm0ueCAtIDgwLCB0aGlzLnRyYW5zZm9ybS55ICsgMTApO1xuICAgICAgICB0aGlzLl9wbGF5RWZmZWN0KHRoaXMuanVtcEVmZmVjdCwgcG9zKTtcbiAgICB9LFxuICAgIC8vXG4gICAgX3BsYXlFZmZlY3Q6IGZ1bmN0aW9uKHRlbXBFZmZlY3QsIHBvcykge1xuICAgICAgICB2YXIgZWZmZWN0ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRWZmZWN0KTtcbiAgICAgICAgZWZmZWN0LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvcztcbiAgICAgICAgdmFyIGVmZmVjdEFuaW0gPSBlZmZlY3QuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlQW5pbWF0aW9uKTtcbiAgICAgICAgZWZmZWN0QW5pbS5wbGF5KCk7XG4gICAgfVxufSk7XG5cblNoZWVwLlN0YXRlID0gU3RhdGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWNsaXAnKTtcbi8vIHNyYy9hdWRpby1jbGlwLmpzXG5cbkZpcmUuQXVkaW9DbGlwID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhdWRpbyBjbGlwIGlzIGFuIGF1ZGlvIHNvdXJjZSBkYXRhLlxuICAgICAqIEBjbGFzcyBBdWRpb0NsaXBcbiAgICAgKiBAZXh0ZW5kcyBBc3NldFxuICAgICAqL1xuICAgIHZhciBBdWRpb0NsaXAgPSBGaXJlLkNsYXNzKHtcbiAgICAgICAgLy9cbiAgICAgICAgbmFtZTogXCJGaXJlLkF1ZGlvQ2xpcFwiLFxuICAgICAgICAvL1xuICAgICAgICBleHRlbmRzOiBGaXJlLkFzc2V0LFxuICAgICAgICAvL1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgcmF3RGF0YToge1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgcmF3VHlwZTogJ2F1ZGlvJyxcbiAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBidWZmZXI6e1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwQnVmZmVyKHRoaXMpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSBhdWRpbyBjbGlwIGluIHNlY29uZHMgKFJlYWQgT25seSkuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgbGVuZ3RoXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxlbmd0aDoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBsZW5ndGggb2YgdGhlIGF1ZGlvIGNsaXAgaW4gc2FtcGxlcyAoUmVhZCBPbmx5KS5cbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBzYW1wbGVzXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNhbXBsZXM6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXModGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2hhbm5lbHMgaW4gYXVkaW8gY2xpcCAoUmVhZCBPbmx5KS5cbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBjaGFubmVsc1xuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjaGFubmVsczoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDbGlwQ2hhbm5lbHModGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU2FtcGxlIGZyZXF1ZW5jeSAoUmVhZCBPbmx5KS5cbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBmcmVxdWVuY3lcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZnJlcXVlbmN5OiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEF1ZGlvQ2xpcDtcbn0pKCk7XG5cbi8vIGNyZWF0ZSBlbnRpdHkgYWN0aW9uXG4vLyBAaWYgRURJVE9SXG5GaXJlLkF1ZGlvQ2xpcC5wcm90b3R5cGUuY3JlYXRlRW50aXR5ID0gZnVuY3Rpb24gKCBjYiApIHtcbiAgICB2YXIgZW50ID0gbmV3IEZpcmUuRW50aXR5KHRoaXMubmFtZSk7XG5cbiAgICB2YXIgYXVkaW9Tb3VyY2UgPSBlbnQuYWRkQ29tcG9uZW50KEZpcmUuQXVkaW9Tb3VyY2UpO1xuXG4gICAgYXVkaW9Tb3VyY2UuY2xpcCA9IHRoaXM7XG5cbiAgICBpZiAoIGNiIClcbiAgICAgICAgY2IgKGVudCk7XG59O1xuLy8gQGVuZGlmXG5cbm1vZHVsZS5leHBvcnRzID0gRmlyZS5BdWRpb0NsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLWZpeC1pb3MnKTtcbi8vIHNyYy9hdWRpby1maXgtaW9zLmpzXG5cbnJlcXVpcmUoJ2F1ZGlvLWxlZ2FjeScpO1xucmVxdWlyZSgnYXVkaW8td2ViLWF1ZGlvJyk7XG5cbmlmIChGaXJlLmlzSU9TKSB7XG4gICAgRmlyZS5Mb2FkTWFuYWdlci5sb2FkKCdlbXB0eScsJ2F1ZGlvJywgJ21wMycsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgdmFyIGlzUGxheWVkID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgICAgICAgaWYgKGlzUGxheWVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNQbGF5ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRTb3VyY2UgPSBuZXcgRmlyZS5BdWRpb1NvdXJjZSgpO1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRDbGlwID0gbmV3IEZpcmUuQXVkaW9DbGlwKCk7XG4gICAgICAgICAgICBkZWZhdWx0Q2xpcC5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgICAgIGRlZmF1bHRTb3VyY2UuY2xpcCA9IGRlZmF1bHRDbGlwO1xuICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQucGxheShkZWZhdWx0U291cmNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgbGlzdGVuZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8tbGVnYWN5Jyk7XG4vLyBzcmMvYXVkaW8tbGVnYWN5LmpzXG5cbihmdW5jdGlvbigpe1xuICAgIHZhciBVc2VXZWJBdWRpbyA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dCk7XG4gICAgaWYgKFVzZVdlYkF1ZGlvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIEF1ZGlvQ29udGV4dCA9IHt9O1xuXG4gICAgZnVuY3Rpb24gbG9hZGVyICh1cmwsIGNhbGxiYWNrLCBvblByb2dyZXNzKSB7XG4gICAgICAgIHZhciBhdWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKTtcbiAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImNhbnBsYXl0aHJvdWdoXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGF1ZGlvKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgJ1wiIHNlZW1zIHRvIGJlIHVucmVhY2hhYmxlIG9yIHRoZSBmaWxlIGlzIGVtcHR5LiBJbm5lck1lc3NhZ2U6ICcgKyBlICsgJ1xcbiBUaGlzIG1heSBjYXVzZWQgYnkgZmlyZWJhbGwteC9kZXYjMjY3JywgbnVsbCk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICBhdWRpby5zcmMgPSB1cmw7XG4gICAgfVxuXG4gICAgRmlyZS5Mb2FkTWFuYWdlci5yZWdpc3RlclJhd1R5cGVzKCdhdWRpbycsIGxvYWRlcik7XG5cbiAgICBBdWRpb0NvbnRleHQuaW5pdFNvdXJjZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Ll9hdWRpbyA9IG51bGw7XG4gICAgfTtcblxuICAgIEF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuX2F1ZGlvICYmIHRhcmdldC5fcGxheWluZykge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5fYXVkaW8uY3VycmVudFRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlVGltZSA9IGZ1bmN0aW9uICh0YXJnZXQsIHZhbHVlKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Ll9hdWRpbykge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gdGFyZ2V0Ll9hdWRpby5kdXJhdGlvbjtcbiAgICAgICAgICAgIHRhcmdldC5fYXVkaW8uY3VycmVudFRpbWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyDpnZzpn7NcbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTXV0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ubXV0ZWQgPSB0YXJnZXQubXV0ZTtcbiAgICB9O1xuXG4gICAgLy8g6K6+572u6Z+z6YeP77yM6Z+z6YeP6IyD5Zu05pivWzAsIDFdXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8udm9sdW1lID0gdGFyZ2V0LnZvbHVtZTtcbiAgICB9O1xuXG4gICAgLy8g6K6+572u5b6q546vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLmxvb3AgPSB0YXJnZXQubG9vcDtcbiAgICB9O1xuXG4gICAgLy8g5bCG6Z+z5LmQ5rqQ6IqC54K557uR5a6a5YW35L2T55qE6Z+z6aKRYnVmZmVyXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUF1ZGlvQ2xpcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5jbGlwKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvID0gdGFyZ2V0LmNsaXAucmF3RGF0YTtcbiAgICB9O1xuXG4gICAgLy8g5pqr5YGcXG4gICAgQXVkaW9Db250ZXh0LnBhdXNlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ucGF1c2UoKTtcbiAgICB9O1xuXG4gICAgLy8g5YGc5q2iXG4gICAgQXVkaW9Db250ZXh0LnN0b3AgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5wYXVzZSgpO1xuICAgICAgICB0YXJnZXQuX2F1ZGlvLmN1cnJlbnRUaW1lID0gMDtcbiAgICB9O1xuXG4gICAgLy8g5pKt5pS+XG4gICAgQXVkaW9Db250ZXh0LnBsYXkgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2xpcCB8fCAhdGFyZ2V0LmNsaXAucmF3RGF0YSkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKHRhcmdldC5fcGxheWluZyAmJiAhdGFyZ2V0Ll9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRoaXMudXBkYXRlQXVkaW9DbGlwKHRhcmdldCk7XG4gICAgICAgIHRoaXMudXBkYXRlVm9sdW1lKHRhcmdldCk7XG4gICAgICAgIHRoaXMudXBkYXRlTG9vcCh0YXJnZXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZU11dGUodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5wbGF5KCk7XG5cbiAgICAgICAgLy8g5pKt5pS+57uT5p2f5ZCO55qE5Zue6LCDXG4gICAgICAgIHRhcmdldC5fYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0YXJnZXQuX29uUGxheUVuZC5iaW5kKHRhcmdldCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy8g6I635b6X6Z+z6aKR5Ymq6L6R55qEIGJ1ZmZlclxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwQnVmZmVyID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIDxCdWZmZXI+IGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDku6Xnp5LkuLrljZXkvY0g6I635Y+W6Z+z6aKR5Ymq6L6R55qEIOmVv+W6plxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5kdXJhdGlvbjtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE6ZW/5bqmXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBTYW1wbGVzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgPFNhbXBsZXM+IGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTlo7DpgZPmlbBcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgPENoYW5uZWxzPiBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8g6Z+z6aKR5Ymq6L6R55qE6YeH5qC36aKR546HXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIEZpcmUuZXJyb3IoXCJBdWRpbyBkb2VzIG5vdCBjb250YWluIHRoZSA8RnJlcXVlbmN5PiBhdHRyaWJ1dGUhXCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG5cbiAgICBGaXJlLkF1ZGlvQ29udGV4dCA9IEF1ZGlvQ29udGV4dDtcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2F1ZGlvLXNvdXJjZScpO1xuLy8gc3JjL2F1ZGlvLXNvdXJjZS5qc1xuXG5cbnZhciBBdWRpb1NvdXJjZSA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXVkaW8gc291cmNlIGNvbXBvbmVudC5cbiAgICAgKiBAY2xhc3MgQXVkaW9Tb3VyY2VcbiAgICAgKiBAZXh0ZW5kcyBDb21wb25lbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgQXVkaW9Tb3VyY2UgPSBGaXJlLkNsYXNzKHtcbiAgICAgICAgLy9cbiAgICAgICAgbmFtZTogXCJGaXJlLkF1ZGlvU291cmNlXCIsXG4gICAgICAgIC8vXG4gICAgICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgICAgICAvL1xuICAgICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8g5aOw5rqQ5pqC5YGc5oiW6ICF5YGc5q2i5pe25YCZ5Li6ZmFsc2VcbiAgICAgICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIOadpeWMuuWIhuWjsOa6kOaYr+aaguWBnOi/mOaYr+WBnOatolxuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9sYXN0UGxheSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1ZmZTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fdm9sdW1lR2FpbiA9IG51bGw7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSBhdWRpbyBzdG9wc1xuICAgICAgICAgICAgICogQHByb3BlcnR5IG9uRW5kXG4gICAgICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub25FbmQgPSBudWxsO1xuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIElzIHRoZSBhdWRpbyBzb3VyY2UgcGxheWluZyAoUmVhZCBPbmx5Ke+8n1xuICAgICAgICAgICAgICogQHByb3BlcnR5IGlzUGxheWluZ1xuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlzUGxheWluZzoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIElzIHRoZSBhdWRpbyBzb3VyY2UgcGF1c2VkIChSZWFkIE9ubHkpP1xuICAgICAgICAgICAgICogQHByb3BlcnR5IGlzUGF1c2VkXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXNQYXVzZWQ6e1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGF1c2VkO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBsYXliYWNrIHBvc2l0aW9uIGluIHNlY29uZHMuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgdGltZVxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGltZToge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUodGhpcyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVUaW1lKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX2NsaXA6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgIHR5cGU6IEZpcmUuQXVkaW9DbGlwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYXVkaW8gY2xpcCB0byBwbGF5LlxuICAgICAgICAgICAgICogQHByb3BlcnR5IGNsaXBcbiAgICAgICAgICAgICAqIEB0eXBlIHtBdWRpb0NsaXB9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNsaXA6e1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xpcDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jbGlwICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xpcCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBfbG9vcDogZmFsc2UsXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIElzIHRoZSBhdWRpbyBzb3VyY2UgbG9vcGluZz9cbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBsb29wXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxvb3A6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvb3A7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fbG9vcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIF9tdXRlOiBmYWxzZSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSXMgdGhlIGF1ZGlvIHNvdXJjZSBtdXRlP1xuICAgICAgICAgICAgICogQHByb3BlcnR5IG11dGVcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbXV0ZToge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbXV0ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tdXRlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbXV0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlTXV0ZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgX3ZvbHVtZTogMSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHZvbHVtZSBvZiB0aGUgYXVkaW8gc291cmNlLlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHZvbHVtZVxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdm9sdW1lOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl92b2x1bWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fdm9sdW1lICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdm9sdW1lID0gTWF0aC5jbGFtcDAxKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFswLCAxXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBfcGxheWJhY2tSYXRlOiAxLjAsXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBwbGF5YmFjayByYXRlIG9mIHRoZSBhdWRpbyBzb3VyY2UuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgcGxheWJhY2tSYXRlXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwbGF5YmFja1JhdGU6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BsYXliYWNrUmF0ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wbGF5YmFja1JhdGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5YmFja1JhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX3BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJZiBzZXQgdG8gdHJ1ZSwgdGhlIGF1ZGlvIHNvdXJjZSB3aWxsIGF1dG9tYXRpY2FsbHkgc3RhcnQgcGxheWluZyBvbiBvbkxvYWQuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgcGxheU9uTG9hZFxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBsYXlPbkxvYWQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgX29uUGxheUVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCB0aGlzLm9uRW5kICkge1xuICAgICAgICAgICAgICAgIHRoaXMub25FbmQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXVzZXMgdGhlIGNsaXAuXG4gICAgICAgICAqIEBtZXRob2QgcGF1c2VcbiAgICAgICAgICovXG4gICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wYXVzZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuX3BhdXNlZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbGF5cyB0aGUgY2xpcC5cbiAgICAgICAgICogQG1ldGhvZCBwbGF5XG4gICAgICAgICAqL1xuICAgICAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMuX3BsYXlpbmcgJiYgIXRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoIHRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQucGxheSh0aGlzLCB0aGlzLl9zdGFydFRpbWUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBsYXkodGhpcywgMCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9wcyB0aGUgY2xpcFxuICAgICAgICAgKiBAbWV0aG9kIHN0b3BcbiAgICAgICAgICovXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggIXRoaXMuX3BsYXlpbmcgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5zdG9wKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vXG4gICAgICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXlpbmcgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vXG4gICAgICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5T25Mb2FkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vXG4gICAgICAgIG9uRGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vXG4gICAgRmlyZS5hZGRDb21wb25lbnRNZW51KEF1ZGlvU291cmNlLCAnQXVkaW9Tb3VyY2UnKTtcblxuICAgIHJldHVybiBBdWRpb1NvdXJjZTtcbn0pKCk7XG5cbkZpcmUuQXVkaW9Tb3VyY2UgPSBBdWRpb1NvdXJjZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYXVkaW8td2ViLWF1ZGlvJyk7XG4vLyBzcmMvYXVkaW8td2ViLWF1ZGlvLmpzXG5cbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIE5hdGl2ZUF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dCk7XG4gICAgaWYgKCAhTmF0aXZlQXVkaW9Db250ZXh0ICkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZml4IGZpcmViYWxsLXgvZGV2IzM2NVxuICAgIGlmICghRmlyZS5uYXRpdmVBQykge1xuICAgICAgICBGaXJlLm5hdGl2ZUFDID0gbmV3IE5hdGl2ZUF1ZGlvQ29udGV4dCgpO1xuICAgIH1cblxuICAgIC8vIOa3u+WKoHNhZmVEZWNvZGVBdWRpb0RhdGHnmoTljp/lm6DvvJpodHRwczovL2dpdGh1Yi5jb20vZmlyZWJhbGwteC9kZXYvaXNzdWVzLzMxOFxuICAgIGZ1bmN0aW9uIHNhZmVEZWNvZGVBdWRpb0RhdGEoY29udGV4dCwgYnVmZmVyLCB1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aW1lb3V0ID0gZmFsc2U7XG4gICAgICAgIHZhciB0aW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygnVGhlIG9wZXJhdGlvbiBvZiBkZWNvZGluZyBhdWRpbyBkYXRhIGFscmVhZHkgdGltZW91dCEgQXVkaW8gdXJsOiBcIicgKyB1cmwgK1xuICAgICAgICAgICAgICAgICAgICAgJ1wiLiBTZXQgRmlyZS5BdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSB0byBhIGxhcmdlciB2YWx1ZSBpZiB0aGlzIGVycm9yIG9mdGVuIG9jY3VyLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICdTZWUgZmlyZWJhbGwteC9kZXYjMzE4IGZvciBkZXRhaWxzLicsIG51bGwpO1xuICAgICAgICB9LCBBdWRpb0NvbnRleHQuTWF4RGVjb2RlVGltZSk7XG5cbiAgICAgICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYnVmZmVyLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGRlY29kZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRlY29kZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCAnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZSk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZGVyKHVybCwgY2FsbGJhY2ssIG9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIGNiID0gY2FsbGJhY2sgJiYgZnVuY3Rpb24gKGVycm9yLCB4aHIpIHtcbiAgICAgICAgICAgIGlmICh4aHIpIHtcbiAgICAgICAgICAgICAgICBzYWZlRGVjb2RlQXVkaW9EYXRhKEZpcmUubmF0aXZlQUMsIHhoci5yZXNwb25zZSwgdXJsLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICdcIiBzZWVtcyB0byBiZSB1bnJlYWNoYWJsZSBvciB0aGUgZmlsZSBpcyBlbXB0eS4gSW5uZXJNZXNzYWdlOiAnICsgZXJyb3IsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGaXJlLkxvYWRNYW5hZ2VyLl9sb2FkRnJvbVhIUih1cmwsIGNiLCBvblByb2dyZXNzLCAnYXJyYXlidWZmZXInKTtcbiAgICB9XG5cbiAgICBGaXJlLkxvYWRNYW5hZ2VyLnJlZ2lzdGVyUmF3VHlwZXMoJ2F1ZGlvJywgbG9hZGVyKTtcblxuICAgIHZhciBBdWRpb0NvbnRleHQgPSB7fTtcblxuICAgIEF1ZGlvQ29udGV4dC5NYXhEZWNvZGVUaW1lID0gNDAwMDtcblxuICAgIEF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCB0YXJnZXQuX3BhdXNlZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX3N0YXJ0VGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdGFyZ2V0Ll9wbGF5aW5nICkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5fc3RhcnRUaW1lICsgdGhpcy5nZXRQbGF5ZWRUaW1lKHRhcmdldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LmdldFBsYXllZFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiAoRmlyZS5uYXRpdmVBQy5jdXJyZW50VGltZSAtIHRhcmdldC5fbGFzdFBsYXkpICogdGFyZ2V0Ll9wbGF5YmFja1JhdGU7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0LCB0aW1lKSB7XG4gICAgICAgIHRhcmdldC5fbGFzdFBsYXkgPSBGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lO1xuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSA9IHRpbWU7XG5cbiAgICAgICAgaWYgKCB0YXJnZXQuaXNQbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5wYXVzZSh0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTXV0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX3ZvbHVtZUdhaW4pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fdm9sdW1lR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0Lm11dGUgPyAtMSA6ICh0YXJnZXQudm9sdW1lIC0gMSk7XG4gICAgfTtcblxuICAgIC8vIHJhbmdlIFswLDFdXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX3ZvbHVtZUdhaW4pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fdm9sdW1lR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0LnZvbHVtZSAtIDE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9idWZmU291cmNlKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2UubG9vcCA9IHRhcmdldC5sb29wO1xuICAgIH07XG5cbiAgICAvLyBiaW5kIGJ1ZmZlciBzb3VyY2VcbiAgICBBdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIHRhcmdldC5pc1BsYXlpbmcgKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AodGFyZ2V0LGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVBsYXliYWNrUmF0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5pc1BhdXNlZCApIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2UodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMucGxheSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnBhdXNlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYnVmZlNvdXJjZSkgeyByZXR1cm47IH1cblxuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSArPSB0aGlzLmdldFBsYXllZFRpbWUodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uuc3RvcCgwKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuc3RvcCA9IGZ1bmN0aW9uICggdGFyZ2V0LCBlbmRlZCApIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2J1ZmZTb3VyY2UpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgaWYgKCAhZW5kZWQgKSB7XG4gICAgICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uub25lbmRlZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLnN0b3AoMCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnBsYXkgPSBmdW5jdGlvbiAoIHRhcmdldCwgYXQgKSB7XG4gICAgICAgIGlmICghdGFyZ2V0LmNsaXAgfHwgIXRhcmdldC5jbGlwLnJhd0RhdGEpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgLy8gY3JlYXRlIGJ1ZmZlciBzb3VyY2VcbiAgICAgICAgdmFyIGJ1ZmZlclNvdXJjZSA9IEZpcmUubmF0aXZlQUMuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHZvbHVtZSBjb250cm9sXG4gICAgICAgIHZhciBnYWluID0gRmlyZS5uYXRpdmVBQy5jcmVhdGVHYWluKCk7XG5cbiAgICAgICAgLy8gY29ubmVjdFxuICAgICAgICBidWZmZXJTb3VyY2UuY29ubmVjdChnYWluKTtcbiAgICAgICAgZ2Fpbi5jb25uZWN0KEZpcmUubmF0aXZlQUMuZGVzdGluYXRpb24pO1xuICAgICAgICBidWZmZXJTb3VyY2UuY29ubmVjdChGaXJlLm5hdGl2ZUFDLmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyBpbml0IHBhcmFtZXRlcnNcbiAgICAgICAgYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRhcmdldC5jbGlwLnJhd0RhdGE7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5sb29wID0gdGFyZ2V0Lmxvb3A7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSB0YXJnZXQucGxheWJhY2tSYXRlO1xuICAgICAgICBidWZmZXJTb3VyY2Uub25lbmRlZCA9IHRhcmdldC5fb25QbGF5RW5kLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0Lm11dGUgPyAtMSA6ICh0YXJnZXQudm9sdW1lIC0gMSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlID0gYnVmZmVyU291cmNlO1xuICAgICAgICB0YXJnZXQuX3ZvbHVtZUdhaW4gPSBnYWluO1xuICAgICAgICB0YXJnZXQuX3N0YXJ0VGltZSA9IGF0IHx8IDA7XG4gICAgICAgIHRhcmdldC5fbGFzdFBsYXkgPSBGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIC8vIHBsYXlcbiAgICAgICAgYnVmZmVyU291cmNlLnN0YXJ0KCAwLCB0aGlzLmdldEN1cnJlbnRUaW1lKHRhcmdldCkgKTtcbiAgICB9O1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlciA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBMZW5ndGggPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmR1cmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcFNhbXBsZXMgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEubnVtYmVyT2ZDaGFubmVscztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LmdldENsaXBGcmVxdWVuY3kgPSBmdW5jdGlvbiAoY2xpcCkge1xuICAgICAgICBpZiAoY2xpcC5yYXdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpcC5yYXdEYXRhLnNhbXBsZVJhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cblxuICAgIEZpcmUuQXVkaW9Db250ZXh0ID0gQXVkaW9Db250ZXh0O1xufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuXG4vKipcbiAqIEBjbGFzcyBTcHJpdGVBbmltYXRpb25DbGlwXG4gKi9cbi8qKlxuICogQG5hbWVzcGFjZSBTcHJpdGVBbmltYXRpb25DbGlwXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgV3JhcE1vZGVcbiAqIEBzdGF0aWNcbiAqL1xudmFyIFdyYXBNb2RlID0gRmlyZS5kZWZpbmVFbnVtKHtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgRGVmYXVsdFxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgRGVmYXVsdDogLTEsXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IE9uY2VcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIE9uY2U6IC0xLFxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBMb29wXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBMb29wOiAtMSxcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgUGluZ1BvbmdcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIFBpbmdQb25nOiAtMSxcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgQ2xhbXBGb3JldmVyXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBDbGFtcEZvcmV2ZXI6IC0xXG59KTtcblxuLyoqXG4gKiBAY2xhc3MgU3RvcEFjdGlvblxuICogQHN0YXRpY1xuICovXG52YXIgU3RvcEFjdGlvbiA9IEZpcmUuZGVmaW5lRW51bSh7XG4gICAgLyoqXG4gICAgICogRG8gbm90aGluZ1xuICAgICAqIEBwcm9wZXJ0eSBEb05vdGhpbmdcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIERvTm90aGluZzogLTEsXG4gICAgLyoqXG4gICAgICogU2V0IHRvIGRlZmF1bHQgc3ByaXRlIHdoZW4gdGhlIHNwcml0ZSBhbmltYXRpb24gc3RvcHBlZFxuICAgICAqIEBwcm9wZXJ0eSBEZWZhdWx0U3ByaXRlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBEZWZhdWx0U3ByaXRlOiAxLFxuICAgIC8qKlxuICAgICAqIEhpZGUgdGhlIHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICAgKiBAcHJvcGVydHkgSGlkZVxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgSGlkZTogLTEsXG4gICAgLyoqXG4gICAgICogRGVzdHJveSB0aGUgZW50aXR5IHRoZSBzcHJpdGUgYmVsb25ncyB0byB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICAgKiBAcHJvcGVydHkgRGVzdHJveVxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgRGVzdHJveTogLTFcbn0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vLyBUaGUgc3RydWN0dXJlIHRvIGRlc2NyaXAgYSBmcmFtZSBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnZhciBGcmFtZUluZm8gPSBGaXJlLmRlZmluZSgnRnJhbWVJbmZvJylcbiAgICAucHJvcCgnc3ByaXRlJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuU3ByaXRlKSlcbiAgICAucHJvcCgnZnJhbWVzJywgMCwgRmlyZS5JbnRlZ2VyX09ic29sZXRlZCk7XG5cbi8qKlxuICogVGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcC5cbiAqIEBjbGFzcyBTcHJpdGVBbmltYXRpb25DbGlwXG4gKiBAZXh0ZW5kcyBDdXN0b21Bc3NldFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gRmlyZS5DbGFzcyh7XG4gICAgbmFtZTogJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCcsXG4gICAgLy9cbiAgICBleHRlbmRzOiBGaXJlLkN1c3RvbUFzc2V0LFxuICAgIC8vXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm9cbiAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbnVsbDtcbiAgICB9LFxuICAgIC8vXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCB3cmFwIG1vZGUuXG4gICAgICAgICAqIEBwcm9wZXJ0eSB3cmFwTW9kZVxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZX1cbiAgICAgICAgICogQGRlZmF1bHQgU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5EZWZhdWx0XG4gICAgICAgICAqL1xuICAgICAgICB3cmFwTW9kZToge1xuICAgICAgICAgICAgZGVmYXVsdDogV3JhcE1vZGUuRGVmYXVsdCxcbiAgICAgICAgICAgIHR5cGU6IFdyYXBNb2RlXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZGVmYXVsdCB0eXBlIG9mIGFjdGlvbiB1c2VkIHdoZW4gdGhlIGFuaW1hdGlvbiBzdG9wcGVkLlxuICAgICAgICAgKiBAcHJvcGVydHkgc3RvcEFjdGlvblxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9ufVxuICAgICAgICAgKiBAZGVmYXVsdCBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nXG4gICAgICAgICAqL1xuICAgICAgICBzdG9wQWN0aW9uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBTdG9wQWN0aW9uLkRvTm90aGluZyxcbiAgICAgICAgICAgIHR5cGU6IFN0b3BBY3Rpb25cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICogVGhlIGRlZmF1bHQgc3BlZWQgb2YgdGhlIGFuaW1hdGlvbiBjbGlwLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzcGVlZFxuICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAqL1xuICAgICAgICBzcGVlZDogMSxcbiAgICAgICAgLy9cbiAgICAgICAgX2ZyYW1lUmF0ZTogNjAsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2FtcGxlIHJhdGUgdXNlZCBpbiB0aGlzIGFuaW1hdGlvbiBjbGlwLlxuICAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVSYXRlXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDYwXG4gICAgICAgICAqL1xuICAgICAgICBmcmFtZVJhdGU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lUmF0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZnJhbWVSYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lUmF0ZSA9IE1hdGgucm91bmQoTWF0aC5tYXgodmFsdWUsIDEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZnJhbWUgaW5mb3MgaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcHMuXG4gICAgICAgICAqIGFyZSBhcnJheSBvZiB7c3ByaXRlOiBTcHJpdGUsIGZyYW1lczogU3VzdGFpbmVkX2hvd19tYW55X2ZyYW1lc31cbiAgICAgICAgICogQHByb3BlcnR5IGZyYW1lSW5mb3NcbiAgICAgICAgICogQHR5cGUge29iamVjdFtdfVxuICAgICAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAgICAgKi9cbiAgICAgICAgZnJhbWVJbmZvczp7XG4gICAgICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgICAgIHR5cGU6IEZyYW1lSW5mb1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL1xuICAgIGdldFRvdGFsRnJhbWVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZyYW1lcyA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBmcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhbWVzO1xuICAgIH0sXG4gICAgLy9cbiAgICBnZXRGcmFtZUluZm9GcmFtZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fZnJhbWVJbmZvRnJhbWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBuZXcgQXJyYXkodGhpcy5mcmFtZUluZm9zLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdG90YWxGcmFtZXMgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZyYW1lSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB0b3RhbEZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1tpXSA9IHRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZUluZm9GcmFtZXM7XG4gICAgfVxufSk7XG5cblNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUgPSBXcmFwTW9kZTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uID0gU3RvcEFjdGlvbjtcblxuRmlyZS5hZGRDdXN0b21Bc3NldE1lbnUoU3ByaXRlQW5pbWF0aW9uQ2xpcCwgXCJOZXcgU3ByaXRlIEFuaW1hdGlvblwiKTtcblxuRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwID0gU3ByaXRlQW5pbWF0aW9uQ2xpcDtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLXN0YXRlLmpzXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG5cbi8qKlxuICogVGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGUuXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uU3RhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25DbGlwfSBhbmltQ2xpcFxuICovXG52YXIgU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSBmdW5jdGlvbiAoYW5pbUNsaXApIHtcbiAgICBpZiAoIWFuaW1DbGlwKSB7XG4vLyBAaWYgREVWXG4gICAgICAgIEZpcmUuZXJyb3IoJ1Vuc3BlY2lmaWVkIHNwcml0ZSBhbmltYXRpb24gY2xpcCcpO1xuLy8gQGVuZGlmXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGUuXG4gICAgICogQHByb3BlcnR5IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IGFuaW1DbGlwLm5hbWU7XG4gICAgLyoqXG4gICAgICogVGhlIHJlZmVyZW5jZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgICogQHByb3BlcnR5IGNsaXBcbiAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH1cbiAgICAgKi9cbiAgICB0aGlzLmNsaXAgPSBhbmltQ2xpcDtcbiAgICAvKipcbiAgICAgKiBUaGUgd3JhcCBtb2RlXG4gICAgICogQHByb3BlcnR5IHdyYXBNb2RlXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGV9XG4gICAgICovXG4gICAgdGhpcy53cmFwTW9kZSA9IGFuaW1DbGlwLndyYXBNb2RlO1xuICAgIC8qKlxuICAgICAqIFRoZSBzdG9wIGFjdGlvblxuICAgICAqIEBwcm9wZXJ0eSBzdG9wQWN0aW9uXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLnN0b3BBY3Rpb24gPSBhbmltQ2xpcC5zdG9wQWN0aW9uO1xuICAgIC8qKlxuICAgICAqIFRoZSBzcGVlZCB0byBwbGF5IHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICAgKiBAcHJvcGVydHkgc3BlZWRcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuc3BlZWQgPSBhbmltQ2xpcC5zcGVlZDtcbiAgICAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm8gaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IGFuaW1DbGlwLmdldEZyYW1lSW5mb0ZyYW1lcygpO1xuICAgIC8qKlxuICAgICAqIFRoZSB0b3RhbCBmcmFtZSBjb3VudCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgICogQHByb3BlcnR5IHRvdGFsRnJhbWVzXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnRvdGFsRnJhbWVzID0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCAtIDFdIDogMDtcbiAgICAvKipcbiAgICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGluIHNlY29uZHMgd2l0aCBzcGVlZCA9IDEuMGZcbiAgICAgKiBAcHJvcGVydHkgbGVuZ3RoXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMudG90YWxGcmFtZXMgLyBhbmltQ2xpcC5mcmFtZVJhdGU7XG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggb2YgZnJhbWUuIFRoZSB2YWx1ZSBjYW4gYmUgbGFyZ2VyIHRoYW4gdG90YWxGcmFtZXMuXG4gICAgLy8gSWYgdGhlIGZyYW1lIGlzIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzIGl0IHdpbGwgYmUgd3JhcHBlZCBhY2NvcmRpbmcgdG8gd3JhcE1vZGUuXG4gICAgdGhpcy5mcmFtZSA9IC0xO1xuICAgIC8vIHRoZSBjdXJyZW50IHRpbWUgaW4gc2VvbmNkc1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgLy8gY2FjaGUgcmVzdWx0IG9mIEdldEN1cnJlbnRJbmRleFxuICAgIHRoaXMuX2NhY2hlZEluZGV4ID0gLTE7XG59O1xuXG4vKipcbiAqIFRoZSBjdXJyZW50IGZyYW1lIGluZm8gaW5kZXguXG4gKiBAbWV0aG9kIGdldEN1cnJlbnRJbmRleFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5TcHJpdGVBbmltYXRpb25TdGF0ZS5wcm90b3R5cGUuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRvdGFsRnJhbWVzID4gMSkge1xuICAgICAgICAvL2ludCBvbGRGcmFtZSA9IGZyYW1lO1xuICAgICAgICB0aGlzLmZyYW1lID0gTWF0aC5mbG9vcih0aGlzLnRpbWUgKiB0aGlzLmNsaXAuZnJhbWVSYXRlKTtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gLXRoaXMuZnJhbWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd3JhcHBlZEluZGV4O1xuICAgICAgICBpZiAodGhpcy53cmFwTW9kZSAhPT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5QaW5nUG9uZykge1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gX3dyYXAodGhpcy5mcmFtZSwgdGhpcy50b3RhbEZyYW1lcyAtIDEsIHRoaXMud3JhcE1vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gdGhpcy5mcmFtZTtcbiAgICAgICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKHdyYXBwZWRJbmRleCAvIHRoaXMudG90YWxGcmFtZXMpO1xuICAgICAgICAgICAgd3JhcHBlZEluZGV4ICU9IHRoaXMudG90YWxGcmFtZXM7XG4gICAgICAgICAgICBpZiAoKGNudCAmIDB4MSkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLnRvdGFsRnJhbWVzIC0gMSAtIHdyYXBwZWRJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyeSB0byB1c2UgY2FjaGVkIGZyYW1lIGluZm8gaW5kZXhcbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlZEluZGV4IC0gMSA+PSAwICYmXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPj0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4IC0gMV0gJiZcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA8IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1t0aGlzLl9jYWNoZWRJbmRleF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlYXJjaCBmcmFtZSBpbmZvXG4gICAgICAgIHZhciBmcmFtZUluZm9JbmRleCA9IF9iaW5hcnlTZWFyY2godGhpcy5fZnJhbWVJbmZvRnJhbWVzLCB3cmFwcGVkSW5kZXggKyAxKTtcbiAgICAgICAgaWYgKGZyYW1lSW5mb0luZGV4IDwgMCkge1xuICAgICAgICAgICAgZnJhbWVJbmZvSW5kZXggPSB+ZnJhbWVJbmZvSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FjaGVkSW5kZXggPSBmcmFtZUluZm9JbmRleDtcbiAgICAgICAgcmV0dXJuIGZyYW1lSW5mb0luZGV4O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLnRvdGFsRnJhbWVzID09PSAxKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBcbi8vLyBDIyBBcnJheS5CaW5hcnlTZWFyY2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBcbmZ1bmN0aW9uIF9iaW5hcnlTZWFyY2ggKGFycmF5LCB2YWx1ZSkge1xuICAgIHZhciBsID0gMCwgaCA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKGwgPD0gaCkge1xuICAgICAgICB2YXIgbSA9ICgobCArIGgpID4+IDEpO1xuICAgICAgICBpZiAoYXJyYXlbbV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJyYXlbbV0gPiB2YWx1ZSkge1xuICAgICAgICAgICAgaCA9IG0gLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbCA9IG0gKyAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB+bDtcbn1cblxuZnVuY3Rpb24gX3dyYXAgKF92YWx1ZSwgX21heFZhbHVlLCBfd3JhcE1vZGUpIHtcbiAgICBpZiAoX21heFZhbHVlID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoX3ZhbHVlIDwgMCkge1xuICAgICAgICBfdmFsdWUgPSAtX3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkxvb3ApIHtcbiAgICAgICAgcmV0dXJuIF92YWx1ZSAlIChfbWF4VmFsdWUgKyAxKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XG4gICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKF92YWx1ZSAvIF9tYXhWYWx1ZSk7XG4gICAgICAgIF92YWx1ZSAlPSBfbWF4VmFsdWU7XG4gICAgICAgIGlmIChjbnQgJSAyID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlIC0gX3ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoX3ZhbHVlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF92YWx1ZSA+IF9tYXhWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9tYXhWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3ZhbHVlO1xufVxuXG5GaXJlLlNwcml0ZUFuaW1hdGlvblN0YXRlID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ3Nwcml0ZS1hbmltYXRpb24nKTtcbi8vIHNwcml0ZS1hbmltYXRpb24uanNcblxudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tc3RhdGUnKTtcblxuLyoqXG4gKiBUaGUgc3ByaXRlIGFuaW1hdGlvbiBDb21wb25lbnQuXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uXG4gKiBAZXh0ZW5kcyBDb21wb25lbnRcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgU3ByaXRlQW5pbWF0aW9uID0gRmlyZS5DbGFzcyh7XG4gICAgLy9cbiAgICBuYW1lOiBcIkZpcmUuU3ByaXRlQW5pbWF0aW9uXCIsXG4gICAgLy9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvL1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xuICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0RnJhbWVJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IDA7Ly8g5Zyo6LCD55SoUGxheeeahOW9k+W4p+eahExhdGVVcGRhdGXkuI3ov5vooYxzdGVwXG4gICAgfSxcbiAgICAvL1xuICAgIHByb3BlcnRpZXM6e1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRlZmF1bHQgYW5pbWF0aW9uLlxuICAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdEFuaW1hdGlvblxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH1cbiAgICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgZGVmYXVsdEFuaW1hdGlvbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcFxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIEFuaW1hdGVkIGNsaXAgbGlzdC5cbiAgICAgICAgICogQHByb3BlcnR5IGFuaW1hdGlvbnNcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXBbXX1cbiAgICAgICAgICogQGRlZmF1bHQgW11cbiAgICAgICAgICovXG4gICAgICAgIGFuaW1hdGlvbnM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwXG4gICAgICAgIH0sXG4gICAgICAgIC8vXG4gICAgICAgIF9wbGF5QXV0b21hdGljYWxseTogdHJ1ZSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3VsZCB0aGUgZGVmYXVsdCBhbmltYXRpb24gY2xpcCAoQW5pbWF0aW9uLmNsaXApIGF1dG9tYXRpY2FsbHkgc3RhcnQgcGxheWluZyBvbiBzdGFydHVwLlxuICAgICAgICAgKiBAcHJvcGVydHkgcGxheUF1dG9tYXRpY2FsbHlcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgICAgICovXG4gICAgICAgIHBsYXlBdXRvbWF0aWNhbGx5OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wbGF5QXV0b21hdGljYWxseTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW5pdGlhbGl6ZWQgPSAodGhpcy5fbmFtZVRvU3RhdGUgIT09IG51bGwpO1xuICAgICAgICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGU7XG5cbiAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlID0ge307XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1hdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xpcCA9IHRoaXMuYW5pbWF0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2xpcCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZShjbGlwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5nZXRBbmltU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZVtzdGF0ZS5uYW1lXSA9IHN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgQW5pbWF0aW9uIFN0YXRlLlxuICAgICAqIEBtZXRob2QgZ2V0QW5pbVN0YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGFuaW1hdGlvblxuICAgICAqIEByZXR1cm4ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfVxuICAgICAqL1xuICAgIGdldEFuaW1TdGF0ZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVUb1N0YXRlICYmIHRoaXMuX25hbWVUb1N0YXRlW25hbWVdO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nXG4gICAgICogQG1ldGhvZCBpc1BsYXlpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWVdIC0gVGhlIG5hbWUgb2YgdGhlIGFuaW1hdGlvblxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNQbGF5aW5nOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHZhciBwbGF5aW5nQW5pbSA9IHRoaXMuZW5hYmxlZCAmJiB0aGlzLl9jdXJBbmltYXRpb247XG4gICAgICAgIHJldHVybiAhIXBsYXlpbmdBbmltICYmICggIW5hbWUgfHwgcGxheWluZ0FuaW0ubmFtZSA9PT0gbmFtZSApO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUGxheSBBbmltYXRpb25cbiAgICAgKiBAbWV0aG9kIHBsYXlcbiAgICAgKiBAcGFyYW0ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfSBbYW5pbVN0YXRlXSAtIFRoZSBhbmltU3RhdGUgb2YgdGhlIHNwcml0ZSBBbmltYXRpb24gc3RhdGUgb3IgYW5pbWF0aW9uIG5hbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RpbWVdIC0gVGhlIHRpbWUgb2YgdGhlIGFuaW1hdGlvbiB0aW1lXG4gICAgICovXG4gICAgcGxheTogZnVuY3Rpb24gKGFuaW1TdGF0ZSwgdGltZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFuaW1TdGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbVN0YXRlKGFuaW1TdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBhbmltU3RhdGUgfHwgbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aW1lIHx8IDA7XG4gICAgICAgICAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IEZpcmUuVGltZS5mcmFtZUNvdW50O1xuICAgICAgICAgICAgdGhpcy5fc2FtcGxlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFN0b3AgQW5pbWF0aW9uXG4gICAgICogQG1ldGhvZCBzdG9wXG4gICAgICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgYW5pbVN0YXRlIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0YXRlIG9yIGFuaW1hdGlvbiBuYW1lXG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24gKGFuaW1TdGF0ZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFuaW1TdGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbVN0YXRlKGFuaW1TdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBhbmltU3RhdGUgfHwgbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gMDtcblxuICAgICAgICAgICAgdmFyIHN0b3BBY3Rpb24gPSB0aGlzLl9jdXJBbmltYXRpb24uc3RvcEFjdGlvbjtcblxuICAgICAgICAgICAgc3dpdGNoIChzdG9wQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZWZhdWx0U3ByaXRlOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9kZWZhdWx0U3ByaXRlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5IaWRlOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlc3Ryb3k6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG9uTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ICYmIHRoaXMuZGVmYXVsdEFuaW1hdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBhbmltU3RhdGUgPSB0aGlzLmdldEFuaW1TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24ubmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KGFuaW1TdGF0ZSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGxhdGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsICYmIEZpcmUuVGltZS5mcmFtZUNvdW50ID4gdGhpcy5fcGxheVN0YXJ0RnJhbWUpIHtcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiB0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQ7XG4gICAgICAgICAgICB0aGlzLl9zdGVwKGRlbHRhKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX3N0ZXA6IGZ1bmN0aW9uIChkZWx0YVRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgKz0gZGVsdGFUaW1lO1xuICAgICAgICAgICAgdGhpcy5fc2FtcGxlKCk7XG4gICAgICAgICAgICB2YXIgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5PbmNlIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHQgfHxcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA+IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID49IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgLyB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZVJhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQgPCAwICYmIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIHN0b3BcbiAgICAgICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKHRoaXMuX2N1ckFuaW1hdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfc2FtcGxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX2N1ckFuaW1hdGlvbi5nZXRDdXJyZW50SW5kZXgoKTtcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA+PSAwICYmIG5ld0luZGV4ICE9IHRoaXMuX2N1ckluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlID0gdGhpcy5fY3VyQW5pbWF0aW9uLmNsaXAuZnJhbWVJbmZvc1tuZXdJbmRleF0uc3ByaXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY3VySW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5TcHJpdGVBbmltYXRpb24gPSBTcHJpdGVBbmltYXRpb247XG5cbkZpcmUuYWRkQ29tcG9uZW50TWVudShTcHJpdGVBbmltYXRpb24sICdTcHJpdGUgQW5pbWF0aW9uJyk7XG5cbkZpcmUuX1JGcG9wKCk7Il19
