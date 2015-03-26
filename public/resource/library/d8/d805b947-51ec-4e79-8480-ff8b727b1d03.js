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
