/**
 * Created by knox on 2015/3/10.
 */

var Floor = Fire.extend(Fire.Component, function () {

});

Floor.prototype.onLoad = function () {
};

Floor.prototype.update = function () {
    this.entity.transform.x -= Fire.Time.deltaTime * 100;
    if (this.entity.transform.x < -900 ) {
        this.entity.transform.x = 0;
    }
};

module.exports = Floor;
