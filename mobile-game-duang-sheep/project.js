require=function t(e,i,n){function r(o,s){if(!i[o]){if(!e[o]){var u="function"==typeof require&&require;if(!s&&u)return u(o,!0);if(a)return a(o,!0);var p=new Error("Cannot find module '"+o+"'");throw p.code="MODULE_NOT_FOUND",p}var l=i[o]={exports:{}};e[o][0].call(l.exports,function(t){var i=e[o][1][t];return r(i?i:t)},l,l.exports,t,e,i,n)}return i[o].exports}for(var a="function"==typeof require&&require,o=0;o<n.length;o++)r(n[o]);return r}({GameOverMenu:[function(t,e){Fire._RFpush(e,"5ca38jdHudCh7QHLs700P5Q","GameOverMenu");Fire.Class({"extends":Fire.Component,properties:{title:{"default":null,type:Fire.Entity},panel:{"default":null,type:Fire.Entity},btn_play:{"default":null,type:Fire.Entity},scoreText:{"default":null,type:Fire.BitmapText}},onEnable:function(){var e=t("Game");this.scoreText.text=e.instance.score,this.btn_play.on("mouseup",function(){this.scoreText.text="0",this.entity.active=!1,e.instance.mask.active=!0,Fire.Engine.loadScene("MainMenu")}.bind(this)),this.title.transform.position=new Fire.Vec2(0,250),this.panel.transform.position=new Fire.Vec2(0,-200)},update:function(){this.title.transform.y>100?this.title.transform.y-=600*Fire.Time.deltaTime:this.title.transform.y=100,this.panel.transform.y<0?this.panel.transform.y+=600*Fire.Time.deltaTime:this.panel.transform.y=0}});Fire._RFpop()},{Game:"Game"}],Game:[function(t,e){Fire._RFpush(e,"48f8d15ZstO4aRYKt5BKAMw","Game");var i=t("Sheep"),n=t("ScrollPicture"),r=t("PipeGroupManager"),a=Fire.defineEnum({Ready:-1,Run:-1,Over:-1}),o=Fire.Class({"extends":Fire.Component,constructor:function(){this.gameState=a.Ready,this.score=0,this.scoreEffect=null,this.scoreTopPos=0,this.mask=null,this.maskRender=null,o.instance=this},properties:{tempMask:{"default":null,type:Fire.Entity},sheep:{"default":null,type:i},background:{"default":null,type:n},ground:{"default":null,type:n},pipeGroupMgr:{"default":null,type:r},gameOverMenu:{"default":null,type:Fire.Entity},scoreText:{"default":null,type:Fire.BitmapText},readyAuido:{"default":null,type:Fire.AudioSource},gameBgAudio:{"default":null,type:Fire.AudioSource},dieAudio:{"default":null,type:Fire.AudioSource},gameOverAudio:{"default":null,type:Fire.AudioSource},scoreAudio:{"default":null,type:Fire.AudioSource},tempDisappear:{"default":null,type:Fire.Entity},tempAddSorce:{"default":null,type:Fire.Entity}},onStart:function(){this.gameState=a.Ready,this.score=0,this.scoreText.text=this.score,this._pauseUpdate(!1),this.mask=Fire.Entity.find("/mask"),this.mask||(this.mask=Fire.instantiate(this.tempMask),this.mask.name="mask",this.mask.dontDestroyOnLoad=!0),this.maskRender=this.mask.getComponent(Fire.SpriteRenderer)},_pauseUpdate:function(t){this.ground.enabled=t,this.background.enabled=t;for(var e=0;e<this.pipeGroupMgr.pipeGroupList.length;++e){var i=this.pipeGroupMgr.pipeGroupList[e].getComponent("PipeGroup");i.enabled=t}this.pipeGroupMgr.enabled=t},_playReadyGameBg:function(){this.readyAuido.play(),this.readyAuido.onEnd=function(){this.gameState!==a.over&&(this.gameBgAudio.loop=!0,this.gameBgAudio.play())}.bind(this)},update:function(){switch(this.gameState){case a.Ready:this.mask.active&&(this.maskRender.color.a-=Fire.Time.deltaTime,this.maskRender.color.a<.3&&this._playReadyGameBg(),this.maskRender.color.a<=0&&(this.mask.active=!1,this.gameState=a.Run,this._pauseUpdate(!0)));break;case a.Run:var t=this.sheep.renderer.getWorldBounds(),e=this.pipeGroupMgr.collisionDetection(t);e&&(this.gameBgAudio.stop(),this.dieAudio.play(),this.gameOverAudio.play(),this.gameState=a.Over,this.sheep.state=i.State.Dead,this._pauseUpdate(!1),this.gameOverMenu.active=!0),this.updateSorce()}this._updateScoreEffect()},updateSorce:function(){var t=this.pipeGroupMgr.getNext();if(t){var e=this.sheep.renderer.getWorldBounds(),i=t.bottomRenderer.getWorldBounds(),n=e.xMin>i.xMax;if(n){this.score++,this.scoreText.text=this.score,this.pipeGroupMgr.setAsPassed(t),this.scoreAudio.play();var r=new Vec2(this.sheep.transform.x-30,this.sheep.transform.y+50);this.scoreEffect=this._playScoreEffect(this.tempAddSorce,r),this.scoreTopPos=this.scoreEffect.transform.y+100}}},_playScoreEffect:function(t,e){var i=Fire.instantiate(t);return i.transform.position=e,i},_updateScoreEffect:function(){if(this.scoreEffect&&(this.scoreEffect.transform.y+=200*Fire.Time.deltaTime,this.scoreEffect.transform.y>this.scoreTopPos)){var t=Fire.instantiate(this.tempDisappear),e=t.getComponent(Fire.SpriteAnimation);t.transform.position=this.scoreEffect.transform.position,e.play(),this.scoreEffect.destroy(),this.scoreEffect=null,this.scoreTopPos=0}}});o.instance=null,Fire._RFpop()},{PipeGroupManager:"PipeGroupManager",ScrollPicture:"ScrollPicture",Sheep:"Sheep"}],MainMenu:[function(t,e){Fire._RFpush(e,"3438aZsLsJIJJKkdNBrDQNU","MainMenu");{var i=t("ScrollPicture");Fire.Class({"extends":Fire.Component,constructor:function(){this.mask=null,this.maskRender=null,this.fadeInGame=!1},properties:{tempMask:{"default":null,type:Fire.Entity},ground:{"default":null,type:i},background:{"default":null,type:i},btn_play:{"default":null,type:Fire.Entity}},onLoad:function(){this.btn_play.on("mouseup",function(){this.fadeInGame=!0,this.mask.active=!0}.bind(this)),this.mask=Fire.Entity.find("/mask"),this.maskRender=null,this.mask||(this.mask=Fire.instantiate(this.tempMask),this.mask.name="mask",this.mask.dontDestroyOnLoad=!0),this.maskRender=this.mask.getComponent(Fire.SpriteRenderer),this.maskRender.color.a=1,this.fadeInGame=!1},lateUpdate:function(){this.mask.active&&(this.fadeInGame?(this.maskRender.color.a+=Fire.Time.deltaTime,this.maskRender.color.a>1&&(Fire.Engine.loadScene("Game"),this.enabled=!1)):(this.maskRender.color.a-=Fire.Time.deltaTime,this.maskRender.color.a<0&&(this.maskRender.color.a=0,this.mask.active=!1)))}})}Fire._RFpop()},{ScrollPicture:"ScrollPicture"}],PipeGroupManager:[function(t,e){Fire._RFpush(e,"a92ffSpmqpE8oy0ueQo+VAg","PipeGroupManager");Fire.Class({"extends":Fire.Component,constructor:function(){this.lastTime=0},properties:{srcPipeGroup:{"default":null,type:Fire.Entity},initPipeGroupPos:{"default":new Fire.Vec2(600,0)},spawnInterval:3,pipeGroupList:{get:function(){return this.entity.getChildren()},visible:!1}},onLoad:function(){this.lastTime=Fire.Time.time+10},createPipeGroupEntity:function(){var t=Fire.instantiate(this.srcPipeGroup);t.parent=this.entity,t.transform.position=this.initPipeGroupPos,t.active=!0},getNext:function(){for(var t=0;t<this.pipeGroupList.length;++t){var e=this.pipeGroupList[t],i=e.getComponent("PipeGroup");if(!i.passed)return i}return null},setAsPassed:function(t){t.passed=!0},collisionDetection:function(t){for(var e=0;e<this.pipeGroupList.length;++e){var i=this.pipeGroupList[e],n=i.find("topPipe"),r=n.getComponent(Fire.SpriteRenderer),a=r.getWorldBounds();if(a.y+=50,Fire.Intersection.rectRect(t,a))return!0;if(n=i.find("bottomPipe"),r=n.getComponent(Fire.SpriteRenderer),a=r.getWorldBounds(),a.y-=50,Fire.Intersection.rectRect(t,a))return!0}return!1},update:function(){var t=Math.abs(Fire.Time.time-this.lastTime);t>=this.spawnInterval&&(this.lastTime=Fire.Time.time,this.createPipeGroupEntity())}});Fire._RFpop()},{}],PipeGroup:[function(t,e){Fire._RFpush(e,"ce446mwMy9DkLsyMuZTGTC9","PipeGroup");Fire.Class({"extends":Fire.Component,constructor:function(){this.bottomRenderer=null,this.passed=!1},properties:{speed:200,minX:-900,topPosRange:{"default":new Fire.Vec2(100,160)},spacingRange:{"default":new Fire.Vec2(210,230)}},onEnable:function(){var t=Math.randomRange(this.topPosRange.x,this.topPosRange.y),e=Math.randomRange(this.spacingRange.x,this.spacingRange.y),i=t-e,n=this.entity.find("topPipe");n.transform.y=t;var r=this.entity.find("bottomPipe");r.transform.y=i,this.bottomRenderer=r.getComponent(Fire.SpriteRenderer),this.passed=!1},update:function(){this.transform.x-=Fire.Time.deltaTime*this.speed,this.transform.x<this.minX&&this.entity.destroy()}});Fire._RFpop()},{}],ScrollPicture:[function(t,e){Fire._RFpush(e,"58402WJT/9LSrJLFS0HvHIx","ScrollPicture");Fire.Class({"extends":Fire.Component,properties:{speed:200,offsetX:0},update:function(){this.transform.x-=Fire.Time.deltaTime*this.speed,this.transform.x<-this.offsetX&&(this.transform.x+=this.offsetX)}});Fire._RFpop()},{}],Sheep:[function(t,e){Fire._RFpush(e,"92396N38yZEbKXKUHAlzyBA","Sheep");var i=Fire.defineEnum({None:-1,Run:-1,Jump:-1,Drop:-1,DropEnd:-1,Dead:-1}),n=Fire.Class({"extends":Fire.Component,constructor:function(){this.anim=null,this.currentSpeed=0,this.renderer=null,this.jumpEvent=null},properties:{initSheepPos:new Fire.Vec2(-150,-180),maxY:250,groundY:-170,gravity:9.8,initSpeed:500,_state:{"default":i.Run,type:i,visible:!1},state:{get:function(){return this._state},set:function(t){if(t!==this._state&&(this._state=t,this._state!==i.None)){var e=i[this._state];this.anim.play(e)}},type:i},jumpAudio:{"default":null,type:Fire.AudioSource},jumpEffect:{"default":null,type:Fire.Entity},dropEndEffect:{"default":null,type:Fire.Entity}},onLoad:function(){this.anim=this.getComponent(Fire.SpriteAnimation),this.renderer=this.getComponent(Fire.SpriteRenderer),this.transform.position=this.initSheepPos,this.jumpEvent=function(){this.state!==i.Dead&&this._jump()}.bind(this),Fire.Input.on("mousedown",this.jumpEvent)},onDestroy:function(){Fire.Input.off("mousedown",this.jumpEvent)},update:function(){this._updateState(),this._updateTransform()},_updateState:function(){switch(this.state){case n.State.Jump:this.currentSpeed<0&&(this.state=i.Drop);break;case n.State.Drop:if(this.transform.y<=this.groundY){this.transform.y=this.groundY,this.state=i.DropEnd;var t=new Vec2(this.transform.x,this.transform.y-30);this._playEffect(this.dropEndEffect,t)}break;case n.State.DropEnd:this.anim.isPlaying("dropEnd")||(this.state=i.Run)}},_updateTransform:function(){var t=this.state===n.State.Jump||this.transform.y>this.groundY;t&&(this.currentSpeed-=100*Fire.Time.deltaTime*this.gravity,this.transform.y+=Fire.Time.deltaTime*this.currentSpeed)},_jump:function(){this.state=i.Jump,this.currentSpeed=this.initSpeed,this.jumpAudio.stop(),this.jumpAudio.play();var t=new Vec2(this.transform.x-80,this.transform.y+10);this._playEffect(this.jumpEffect,t)},_playEffect:function(t,e){var i=Fire.instantiate(t);i.transform.position=e;var n=i.getComponent(Fire.SpriteAnimation);n.play()}});n.State=i,Fire._RFpop()},{}],"audio-clip":[function(t,e){Fire._RFpush(e,"audio-clip"),Fire.AudioClip=function(){var t=Fire.extend("Fire.AudioClip",Fire.Asset);return t.prop("rawData",null,Fire.RawType("audio"),Fire.HideInInspector),t.get("buffer",function(){return Fire.AudioContext.getClipBuffer(this)},Fire.HideInInspector),t.get("length",function(){return Fire.AudioContext.getClipLength(this)}),t.get("samples",function(){return Fire.AudioContext.getClipSamples(this)}),t.get("channels",function(){return Fire.AudioContext.getClipChannels(this)}),t.get("frequency",function(){return Fire.AudioContext.getClipFrequency(this)}),t}(),Fire.AudioClip.prototype.createEntity=function(t){var e=new Fire.Entity(this.name),i=e.addComponent(Fire.AudioSource);i.clip=this,t&&t(e)},e.exports=Fire.AudioClip,Fire._RFpop()},{}],"audio-legacy":[function(t,e){Fire._RFpush(e,"audio-legacy"),function(){function t(t,e){var i=document.createElement("audio");i.addEventListener("canplaythrough",function(){e(null,i)},!1),i.addEventListener("error",function(i){e('LoadAudioClip: "'+t+'" seems to be unreachable or the file is empty. InnerMessage: '+i+"\n This may caused by fireball-x/dev#267",null)},!1),i.src=t}var e=window.AudioContext||window.webkitAudioContext||window.mozAudioContext;if(!e){var i={};Fire.LoadManager.registerRawTypes("audio",t),i.initSource=function(t){t._audio=null},i.getCurrentTime=function(t){return t&&t._audio&&t._playing?t._audio.currentTime:0},i.updateTime=function(t,e){if(t&&t._audio){{t._audio.duration}t._audio.currentTime=e}},i.updateMute=function(t){t&&t._audio&&(t._audio.muted=t.mute)},i.updateVolume=function(t){t&&t._audio&&(t._audio.volume=t.volume)},i.updateLoop=function(t){t&&t._audio&&(t._audio.loop=t.loop)},i.updateAudioClip=function(t){t&&t.clip&&(t._audio=t.clip.rawData)},i.pause=function(t){t._audio&&t._audio.pause()},i.stop=function(t){t._audio&&(t._audio.pause(),t._audio.currentTime=0)},i.play=function(t){t&&t.clip&&t.clip.rawData&&(!t._playing||t._paused)&&(this.updateAudioClip(t),this.updateVolume(t),this.updateLoop(t),this.updateMute(t),t._audio.play(),t._audio.addEventListener("ended",function(){t._onPlayEnd.bind(t)},!1))},i.getClipBuffer=function(){return Fire.error("Audio does not contain the <Buffer> attribute!"),null},i.getClipLength=function(t){return t.rawData.duration},i.getClipSamples=function(){return Fire.error("Audio does not contain the <Samples> attribute!"),null},i.getClipChannels=function(){return Fire.error("Audio does not contain the <Channels> attribute!"),null},i.getClipFrequency=function(){return Fire.error("Audio does not contain the <Frequency> attribute!"),null},Fire.AudioContext=i}}(),Fire._RFpop()},{}],"audio-source":[function(t,e){Fire._RFpush(e,"audio-source");var i=function(){var t=Fire.extend("Fire.AudioSource",Fire.Component,function(){this._playing=!1,this._paused=!1,this._startTime=0,this._lastPlay=0,this._buffSource=null,this._volumeGain=null,this.onEnd=null});return Fire.addComponentMenu(t,"AudioSource"),Object.defineProperty(t.prototype,"isPlaying",{get:function(){return this._playing&&!this._paused}}),Object.defineProperty(t.prototype,"isPaused",{get:function(){return this._paused}}),Object.defineProperty(t.prototype,"time",{get:function(){return Fire.AudioContext.getCurrentTime(this)},set:function(t){Fire.AudioContext.updateTime(this,t)}}),t.prop("_clip",null,Fire.HideInInspector),t.getset("clip",function(){return this._clip},function(t){this._clip!==t&&(this._clip=t,Fire.AudioContext.updateAudioClip(this))},Fire.ObjectType(Fire.AudioClip)),t.prop("_playbackRate",1,Fire.HideInInspector),t.getset("playbackRate",function(){return this._playbackRate},function(t){this._playbackRate!==t&&(this._playbackRate=t,this._playing&&Fire.AudioContext.updatePlaybackRate(this))}),t.prop("_loop",!1,Fire.HideInInspector),t.getset("loop",function(){return this._loop},function(t){this._loop!==t&&(this._loop=t,Fire.AudioContext.updateLoop(this))}),t.prop("_mute",!1,Fire.HideInInspector),t.getset("mute",function(){return this._mute},function(t){this._mute!==t&&(this._mute=t,Fire.AudioContext.updateMute(this))}),t.prop("_volume",1,Fire.HideInInspector),t.getset("volume",function(){return this._volume},function(t){this._volume!==t&&(this._volume=Math.clamp01(t),Fire.AudioContext.updateVolume(this))},Fire.Range(0,1)),t.prop("playOnLoad",!0),t.prototype._onPlayEnd=function(){this.onEnd&&this.onEnd(),this._playing=!1,this._paused=!1},t.prototype.pause=function(){this._paused||(Fire.AudioContext.pause(this),this._paused=!0)},t.prototype.play=function(){(!this._playing||this._paused)&&(this._paused?Fire.AudioContext.play(this,this._startTime):Fire.AudioContext.play(this,0),this._playing=!0,this._paused=!1)},t.prototype.stop=function(){this._playing&&(Fire.AudioContext.stop(this),this._playing=!1,this._paused=!1)},t.prototype.onLoad=function(){this._playing&&this.stop()},t.prototype.onStart=function(){},t.prototype.onEnable=function(){this.playOnLoad&&this.play()},t.prototype.onDisable=function(){this.stop()},t}();Fire.AudioSource=i,Fire._RFpop()},{}],"audio-web-audio":[function(t,e){Fire._RFpush(e,"audio-web-audio"),function(){function t(t,e,i,r){var a=!1,o=setTimeout(function(){r('The operation of decoding audio data already timeout! Audio url: "'+i+'". Set Fire.AudioContext.MaxDecodeTime to a larger value if this error often occur. See fireball-x/dev#318 for details.',null)},n.MaxDecodeTime);t.decodeAudioData(e,function(t){a||(r(null,t),clearTimeout(o))},function(t){a||(r(null,'LoadAudioClip: "'+i+'" seems to be unreachable or the file is empty. InnerMessage: '+t),clearTimeout(o))})}function e(e,i,n){var r=i&&function(n,r){r?t(Fire.nativeAC,r.response,e,i):i('LoadAudioClip: "'+e+'" seems to be unreachable or the file is empty. InnerMessage: '+n,null)};Fire.LoadManager._loadFromXHR(e,r,n,"arraybuffer")}var i=window.AudioContext||window.webkitAudioContext||window.mozAudioContext;if(i){Fire.nativeAC||(Fire.nativeAC=new i),Fire.LoadManager.registerRawTypes("audio",e);var n={};n.MaxDecodeTime=4e3,n.getCurrentTime=function(t){return t._paused?t._startTime:t._playing?t._startTime+this.getPlayedTime(t):0},n.getPlayedTime=function(t){return(Fire.nativeAC.currentTime-t._lastPlay)*t._playbackRate},n.updateTime=function(t,e){t._lastPlay=Fire.nativeAC.currentTime,t._startTime=e,t.isPlaying&&(this.pause(t),this.play(t))},n.updateMute=function(t){t._volumeGain&&(t._volumeGain.gain.value=t.mute?-1:t.volume-1)},n.updateVolume=function(t){t._volumeGain&&(t._volumeGain.gain.value=t.volume-1)},n.updateLoop=function(t){t._buffSource&&(t._buffSource.loop=t.loop)},n.updateAudioClip=function(t){t.isPlaying&&(this.stop(t,!1),this.play(t))},n.updatePlaybackRate=function(t){this.isPaused||(this.pause(t),this.play(t))},n.pause=function(t){t._buffSource&&(t._startTime+=this.getPlayedTime(t),t._buffSource.onended=null,t._buffSource.stop(0))},n.stop=function(t,e){t._buffSource&&(e||(t._buffSource.onended=null),t._buffSource.stop(0))},n.play=function(t,e){if(t.clip&&t.clip.rawData){var i=Fire.nativeAC.createBufferSource(),n=Fire.nativeAC.createGain();i.connect(n),n.connect(Fire.nativeAC.destination),i.connect(Fire.nativeAC.destination),i.buffer=t.clip.rawData,i.loop=t.loop,i.playbackRate.value=t.playbackRate,i.onended=t._onPlayEnd.bind(t),n.gain.value=t.mute?-1:t.volume-1,t._buffSource=i,t._volumeGain=n,t._startTime=e||0,t._lastPlay=Fire.nativeAC.currentTime,i.start(0,this.getCurrentTime(t))}},n.getClipBuffer=function(t){return t.rawData},n.getClipLength=function(t){return t.rawData?t.rawData.duration:-1},n.getClipSamples=function(t){return t.rawData?t.rawData.length:-1},n.getClipChannels=function(t){return t.rawData?t.rawData.numberOfChannels:-1},n.getClipFrequency=function(t){return t.rawData?t.rawData.sampleRate:-1},Fire.AudioContext=n}}(),Fire._RFpop()},{}],"sprite-animation-clip":[function(t,e){Fire._RFpush(e,"sprite-animation-clip");var i=Fire.defineEnum({Default:-1,Once:-1,Loop:-1,PingPong:-1,ClampForever:-1}),n=Fire.defineEnum({DoNothing:-1,DefaultSprite:1,Hide:-1,Destroy:-1}),r=Fire.define("FrameInfo").prop("sprite",null,Fire.ObjectType(Fire.Sprite)).prop("frames",0,Fire.Integer_Obsoleted),a=Fire.Class({name:"Fire.SpriteAnimationClip","extends":Fire.CustomAsset,constructor:function(){this._frameInfoFrames=null},properties:{wrapMode:{"default":i.Default,type:i},stopAction:{"default":n.DoNothing,type:n},speed:1,_frameRate:60,frameRate:{get:function(){return this._frameRate},set:function(){value!==this._frameRate&&(this._frameRate=Math.round(Math.max(value,1)))}},frameInfos:{"default":[],type:r}},getTotalFrames:function(){for(var t=0,e=0;e<this.frameInfos.length;++e)t+=this.frameInfos[e].frames;return t},getFrameInfoFrames:function(){if(null===this._frameInfoFrames){this._frameInfoFrames=new Array(this.frameInfos.length);for(var t=0,e=0;e<this.frameInfos.length;++e)t+=this.frameInfos[e].frames,this._frameInfoFrames[e]=t}return this._frameInfoFrames}});a.WrapMode=i,a.StopAction=n,Fire.addCustomAssetMenu(a,"New Sprite Animation"),Fire.SpriteAnimationClip=a,e.exports=a,Fire._RFpop()},{}],"sprite-animation-state":[function(t,e){function i(t,e){for(var i=0,n=t.length-1;n>=i;){var r=i+n>>1;if(t[r]===e)return r;t[r]>e?n=r-1:i=r+1}return~i}function n(t,e,i){if(0===e)return 0;if(0>t&&(t=-t),i===r.WrapMode.Loop)return t%(e+1);if(i===r.WrapMode.PingPong){var n=Math.floor(t/e);if(t%=e,n%2===1)return e-t}else{if(0>t)return 0;if(t>e)return e}return t}Fire._RFpush(e,"sprite-animation-state");var r=t("sprite-animation-clip"),a=function(t){return t?(this.name=t.name,this.clip=t,this.wrapMode=t.wrapMode,this.stopAction=t.stopAction,this.speed=t.speed,this._frameInfoFrames=t.getFrameInfoFrames(),this.totalFrames=this._frameInfoFrames.length>0?this._frameInfoFrames[this._frameInfoFrames.length-1]:0,this.length=this.totalFrames/t.frameRate,this.frame=-1,this.time=0,void(this._cachedIndex=-1)):void Fire.error("Unspecified sprite animation clip")};a.prototype.getCurrentIndex=function(){if(this.totalFrames>1){this.frame=Math.floor(this.time*this.clip.frameRate),this.frame<0&&(this.frame=-this.frame);var t;if(this.wrapMode!==r.WrapMode.PingPong)t=n(this.frame,this.totalFrames-1,this.wrapMode);else{t=this.frame;var e=Math.floor(t/this.totalFrames);t%=this.totalFrames,1===(1&e)&&(t=this.totalFrames-1-t)}if(this._cachedIndex-1>=0&&t>=this._frameInfoFrames[this._cachedIndex-1]&&t<this._frameInfoFrames[this._cachedIndex])return this._cachedIndex;var a=i(this._frameInfoFrames,t+1);return 0>a&&(a=~a),this._cachedIndex=a,a}return 1===this.totalFrames?0:-1},Fire.SpriteAnimationState=a,e.exports=a,Fire._RFpop()},{"sprite-animation-clip":"sprite-animation-clip"}],"sprite-animation":[function(t,e){Fire._RFpush(e,"sprite-animation");var i=t("sprite-animation-clip"),n=t("sprite-animation-state"),r=Fire.Class({name:"Fire.SpriteAnimation","extends":Fire.Component,constructor:function(){this._nameToState=null,this._curAnimation=null,this._spriteRenderer=null,this._defaultSprite=null,this._lastFrameIndex=-1,this._curIndex=-1,this._playStartFrame=0},properties:{defaultAnimation:{"default":null,type:Fire.SpriteAnimationClip},animations:{"default":[],type:Fire.SpriteAnimationClip},_playAutomatically:!0,playAutomatically:{get:function(){return this._playAutomatically},set:function(t){this._playAutomatically=t}}},_init:function(){var t=null!==this._nameToState;if(t===!1){this._spriteRenderer=this.entity.getComponent(Fire.SpriteRenderer),this._defaultSprite=this._spriteRenderer.sprite,this._nameToState={};for(var e=null,i=0;i<this.animations.length;++i){var r=this.animations[i];null!==r&&(e=new n(r),this._nameToState[e.name]=e)}this.getAnimState(this.defaultAnimation.name)||(e=new n(this.defaultAnimation),this._nameToState[e.name]=e)}},getAnimState:function(t){return this._nameToState&&this._nameToState[t]},isPlaying:function(t){var e=this.enabled&&this._curAnimation;return!(!e||t&&e.name!==t)},play:function(t,e){this._curAnimation="string"==typeof t?this.getAnimState(t):t||new n(this.defaultAnimation),null!==this._curAnimation&&(this._curIndex=-1,this._curAnimation.time=e||0,this._playStartFrame=Fire.Time.frameCount,this._sample())},stop:function(t){if(this._curAnimation="string"==typeof t?this.getAnimState(t):t||new n(this.defaultAnimation),null!==this._curAnimation){this._curAnimation.time=0;var e=this._curAnimation.stopAction;switch(e){case i.StopAction.DoNothing:break;case i.StopAction.DefaultSprite:this._spriteRenderer.sprite=this._defaultSprite;break;case i.StopAction.Hide:this._spriteRenderer.enabled=!1;break;case i.StopAction.Destroy:this.entity.destroy()}this._curAnimation=null}},onLoad:function(){if(this._init(),this.enabled&&this._playAutomatically&&this.defaultAnimation){var t=this.getAnimState(this.defaultAnimation.name);this.play(t,0)}},lateUpdate:function(){if(null!==this._curAnimation&&Fire.Time.frameCount>this._playStartFrame){var t=Fire.Time.deltaTime*this._curAnimation.speed;this._step(t)}},_step:function(t){if(null!==this._curAnimation){this._curAnimation.time+=t,this._sample();var e=!1;(this._curAnimation.wrapMode===i.WrapMode.Once||this._curAnimation.wrapMode===i.WrapMode.Default||this._curAnimation.wrapMode===i.WrapMode.ClampForever)&&(this._curAnimation.speed>0&&this._curAnimation.frame>=this._curAnimation.totalFrames?this._curAnimation.wrapMode===i.WrapMode.ClampForever?(e=!1,this._curAnimation.frame=this._curAnimation.totalFrames,this._curAnimation.time=this._curAnimation.frame/this._curAnimation.clip.frameRate):(e=!0,this._curAnimation.frame=this._curAnimation.totalFrames):this._curAnimation.speed<0&&this._curAnimation.frame<0&&(this._curAnimation.wrapMode===i.WrapMode.ClampForever?(e=!1,this._curAnimation.time=0,this._curAnimation.frame=0):(e=!0,this._curAnimation.frame=0))),e&&this.stop(this._curAnimation)}else this._curIndex=-1},_sample:function(){if(null!==this._curAnimation){var t=this._curAnimation.getCurrentIndex();t>=0&&t!=this._curIndex&&(this._spriteRenderer.sprite=this._curAnimation.clip.frameInfos[t].sprite),this._curIndex=t}else this._curIndex=-1}});Fire.SpriteAnimation=r,Fire.addComponentMenu(r,"Sprite Animation"),Fire._RFpop()},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["audio-clip","audio-legacy","audio-source","audio-web-audio","sprite-animation-clip","sprite-animation-state","sprite-animation","Game","GameOverMenu","MainMenu","PipeGroup","PipeGroupManager","ScrollPicture","Sheep"]);
//# sourceMappingURL=project.js.map