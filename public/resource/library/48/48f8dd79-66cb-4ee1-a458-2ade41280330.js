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
