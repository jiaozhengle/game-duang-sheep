/**
 * Created by knox on 2015/3/10.
 */

var Floor = Fire.extend(Fire.Component);

Floor.prop('speed', 300);

Floor.prop('x', -858);

Floor.prototype.update = function () {
    this.entity.transform.x -= (Fire.Time.deltaTime * this.speed);
    if (this.entity.transform.x < this.x ) {
        this.entity.transform.x = 0;
    }
};

module.exports = Floor;
