var Collision = {
    //-- 检测碰撞
    collisionDetection: function (sheep, pipeGroupList) {
        if (pipeGroupList && pipeGroupList.length > 0) {
            for (var i = 0, len = pipeGroupList.length; i < len; ++i) {

                //-- 绵羊的四个面的坐标
                var sheepTop = (sheep.transform.y + sheep.sheepSpritRender.height / 2 );
                var sheepBottom = (sheep.transform.y - sheep.sheepSpritRender.height / 2 );
                var sheepLeft = (sheep.transform.x - sheep.sheepSpritRender.width / 2 );
                var sheepRight = (sheep.transform.x + sheep.sheepSpritRender.width / 2 );

                var pipeGroupEntity = pipeGroupList[i];
                var bottomPipe = pipeGroupEntity.find('bottomPipe');
                var topPipe = pipeGroupEntity.find('topPipe');

                var pipeRender, pipeTop, pipeBottom, pipeLeft, pipeRight;
                if (bottomPipe) {
                    pipeRender = bottomPipe.getComponent(Fire.SpriteRenderer);
                    pipeTop = bottomPipe.transform.y + (pipeRender.height / 2);
                    pipeLeft = pipeGroupEntity.transform.x - (pipeRender.width / 2 - 30);
                    pipeRight = pipeGroupEntity.transform.x + (pipeRender.width / 2 - 30);
                    if (sheepBottom < pipeTop && ((sheepLeft < pipeRight && sheepRight > pipeRight) || (sheepRight > pipeLeft && sheepRight < pipeRight))) {
                        return true;
                    }
                }
                if (topPipe) {
                    pipeRender = topPipe.getComponent(Fire.SpriteRenderer);
                    pipeBottom = topPipe.transform.y - (pipeRender.height / 2);
                    pipeLeft = pipeGroupEntity.transform.x - (pipeRender.width / 2 - 30);
                    pipeRight = pipeGroupEntity.transform.x + (pipeRender.width / 2 - 30);
                    if (sheepTop > pipeBottom && ((sheepLeft < pipeRight && sheepRight > pipeRight) || (sheepRight > pipeLeft && sheepRight < pipeRight))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

module.exports = Collision;
