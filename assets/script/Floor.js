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
