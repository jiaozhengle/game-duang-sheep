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
