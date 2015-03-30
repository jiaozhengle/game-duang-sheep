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
    }
});
