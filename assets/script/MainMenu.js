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
