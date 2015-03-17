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
