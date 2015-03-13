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
