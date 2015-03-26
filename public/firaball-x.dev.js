(function () {
    var root = this;
    /**
     * Fire module hoding global functions
     * @module Fire
     */
    /**
     * Global object with properties and methods you can access from anywhere
     * @class Fire
     * @static
     */
    var Fire = root.Fire || {};

// global definitions

Fire.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
Fire.isNodeWebkit = !!(Fire.isNode && 'node-webkit' in process.versions);   // node-webkit
Fire.isAtomShell = !!(Fire.isNode && 'atom-shell' in process.versions);     // atom-shell
Fire.isApp = Fire.isNodeWebkit || Fire.isAtomShell;                         // native client
Fire.isPureWeb = !Fire.isNode && !Fire.isApp;                               // common web browser
Fire.isEditor = Fire.isApp;     // by far there is no standalone client version, so app == editor

if (Fire.isAtomShell) {
    Fire.isWeb = typeof process !== 'undefined' && process.type === 'renderer';
}
else {
    Fire.isWeb = (typeof __dirname === 'undefined' || __dirname === null); // common web browser, or window's render context in node-webkit or atom-shell
}
Fire.isEditorCore = Fire.isApp && !Fire.isWeb;

if (Fire.isNode) {
    Fire.isDarwin = process.platform === 'darwin';
    Fire.isWin32 = process.platform === 'win32';
}
else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var platform = window.navigator.platform;
    Fire.isDarwin = platform.substring(0, 3) === 'Mac';
    Fire.isWin32 = platform.substring(0, 3) === 'Win';
}

if (Fire.isPureWeb) {
    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();
    Fire.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
    Fire.isIOS = !!ua.match(/(iPad|iPhone|iPod)/i);
    Fire.isAndroid = !!(ua.match(/android/i) || nav.platform.match(/android/i));
}
else {
    Fire.isAndroid = Fire.isIOS = Fire.isMobile = false;
}

/**
 * Check if running in retina device, 这个属性会随着浏览器窗口所在的显示器变化而变化
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Fire, 'isRetina', {
    get: function () {
        return Fire.isWeb && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
});

/**
 * Retina support is enabled by default for Apple device but disabled for other devices,
 * Fire.isRetina 只表示浏览器的当前状态，而游戏的 Canvas 只有在 Fire.isRetinaEnabled 为 true 时才会使用高清分辨率。
 * 由于安卓太卡，所以默认不启用 retina。
 */
Fire.isRetinaEnabled = (Fire.isIOS || Fire.isDarwin) && !Fire.isEditor && Fire.isRetina;


// definitions for FObject._objFlags

var Destroyed = 1 << 0;
var ToDestroy = 1 << 1;
var DontSave = 1 << 2;
var EditorOnly  = 1 << 3; // dont save in build
var Dirty = 1 << 4; // used in editor
var DontDestroy = 1 << 5; // dont destroy automatically when loading a new scene

/**
 *
 * Mark object with different flags.
 * @type object
 * @property _ObjectFlags
 */
var ObjectFlags = {
    // public flags

    DontSave: DontSave,
    EditorOnly: EditorOnly,
    Dirty: Dirty,
    DontDestroy: DontDestroy,

    // public flags for engine

    Destroying: 1 << 9,
    /**
     * Hide in game and hierarchy.
     * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
     * @property _ObjectFlags.HideInGame
     * @type number
     */
    HideInGame: 1 << 10,

    // public flags for editor

    /**
     * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
     * @property _ObjectFlags.HideInEditor
     * @type number
     */
    HideInEditor: 1 << 11,

    // flags for Component
    IsOnEnableCalled: 1 << 12,
    IsOnLoadCalled: 1 << 13,
    IsOnStartCalled: 1 << 14,
    IsEditorOnEnabledCalled: 1 << 15

};

/**
 * Hide in game view, hierarchy, and scene view... etc.
 * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
 * @property _ObjectFlags.Hide
 * @type number
 */
ObjectFlags.Hide = ObjectFlags.HideInGame | ObjectFlags.HideInEditor;

Fire._ObjectFlags = ObjectFlags;

var PersistentMask = ~(ToDestroy | Dirty | ObjectFlags.Destroying | DontDestroy |     // can not clone these flags
                       ObjectFlags.IsOnEnableCalled |
                       ObjectFlags.IsEditorOnEnabledCalled |
                       ObjectFlags.IsOnLoadCalled |
                       ObjectFlags.IsOnStartCalled);

/**
 * !#en Get property descriptor
 * descriptor is blah blah
 * !#zh 获取 property 的描述物体
 * 描述物体是这样的
 * @method _getPropertyDescriptor
 * @param {object} obj - !#en !#zh 获取属性的对象
 * @param {string} name
 * @return {Object}
 */
function _getPropertyDescriptor(obj, name) {
    if (obj) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        return pd || _getPropertyDescriptor(Object.getPrototypeOf(obj), name);
    }
}

function _copyprop(name, source, target) {
    var pd = _getPropertyDescriptor(source, name);
    Object.defineProperty(target, name, pd);
}

var JS = Fire.JS = {

    /**
     * copy all properties not defined in obj from arguments[1...n]
     * @method addon
     * @param {object} obj object to extend its properties
     * @param {object} sourceObj source object to copy properties from
     * @return {object} the result obj
     */
    addon: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            for ( var name in source) {
                if ( !(name in obj) ) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * copy all properties from arguments[1...n] to obj
     * @method mixin
     * @param {object} obj
     * @param {object} source
     * @return {object} the result obj
     */
    mixin: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    Fire.error('Fire.mixin called on non-object:', source);
                    continue;
                }
                for ( var name in source) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * Derive the class from the supplied base class.
     * Both classes are just native javascript constructors, not created by Fire.define, so
     * usually you will want to inherit using {% crosslink Fire.define define %} instead.
     *
     * @method extend
     * @param {function} cls
     * @param {function} base - the baseclass to inherit
     * @return {function} the result class
     */
    extend: function (cls, base) {
        if ( !base ) {
            Fire.error('The base class to extend from must be non-nil');
            return;
        }
        if ( !cls ) {
            Fire.error('The class to extend must be non-nil');
            return;
        }
        for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
        function __() { this.constructor = cls; }
        __.prototype = base.prototype;
        cls.prototype = new __();
        return cls;
    },

    clear: function (obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            delete obj[keys[i]];
        }
    }
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from <a href="http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class">the code from this stackoverflow post</a>)
 * @method getClassName
 * @param {object|function} obj - instance or constructor
 * @return {string}
 */
JS.getClassName = function (obj) {
    if (typeof obj === 'function' && obj.prototype.__classname__) {
        return obj.prototype.__classname__;
    }
    if (obj && obj.constructor) {
        if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__classname__')) {
            return obj.__classname__;
        }
        var retval;
        //  for browsers which have name property in the constructor of the object, such as chrome
        if (obj.constructor.name) {
            retval = obj.constructor.name;
        }
        if (obj.constructor.toString) {
            var arr, str = obj.constructor.toString();
            if (str.charAt(0) === '[') {
                // str is "[object objectClass]"
                arr = str.match(/\[\w+\s*(\w+)\]/);
            }
            else {
                // str is function objectClass () {} for IE Firefox
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length === 2) {
                retval = arr[1];
            }
        }
        return retval !== 'Object' ? retval : null;
    }
    return null;
};

// id 注册
(function () {
    var _idToClass = {};
    var _nameToClass = {};

    function getRegister (key, table) {
        return function (id, constructor) {
            // deregister old
            if (constructor.prototype.hasOwnProperty(key)) {
                delete table[constructor.prototype[key]];
            }
            constructor.prototype[key] = id;
            // register class
            if (id) {
                var registered = table[id];
                if (registered && registered !== constructor) {
                    var error = 'A Class already exists with the same ' + key + ' : "' + id + '".';
                    Fire.error(error);
                }
                else {
                    table[id] = constructor;
                }
                //if (id === "") {
                //    console.trace("", table === _nameToClass);
                //}
            }
        };
    }

    /**
     * Register the class by specified id, if its classname is not defined, the class name will also be set.
     * @method _setClassId
     * @param {string} classId
     * @param {function} constructor
     */
    JS._setClassId = getRegister('__cid__', _idToClass);

    var doSetClassName = getRegister('__classname__', _nameToClass);

    /**
     * Register the class by specified name
     * @method setClassName
     * @param {string} className
     * @param {function} constructor
     */
    JS.setClassName = function (className, constructor) {
        doSetClassName(className, constructor);
        // auto set class id
        if (className && !constructor.prototype.hasOwnProperty('__cid__')) {
            JS._setClassId(className, constructor);
        }
    };

    /**
     * If you dont need a class (which defined by Fire.define or Fire.setClassName) anymore,
     * You should unregister the class so that Fireball will not keep its reference anymore.
     * Please note that its still your responsibility to free other references to the class.
     *
     * @method unregisterClass
     * @param {function} [constructor] - the class you will want to unregister, any number of classes can be added
     */
    JS.unregisterClass = function (constructor) {
        'use strict';
        for (var i = 0; i < arguments.length; i++) {
            var p = arguments[i].prototype;
            var classId = p.__cid__;
            if (classId) {
                delete _idToClass[classId];
            }
            var classname = p.__classname__;
            if (classname) {
                delete _nameToClass[classname];
            }
        }
    };

    /**
     * Get the registered class by id
     * @method _getClassById
     * @param {string} classId
     * @return {function} constructor
     */
    JS._getClassById = function (classId) {
        var cls = _idToClass[classId];
        return cls;
    };

    /**
     * Get the registered class by name
     * @method getClassByName
     * @param {string} classname
     * @return {function} constructor
     */
    JS.getClassByName = function (classname) {
        return _nameToClass[classname];
    };

    /**
     * Get class id of the object
     * @method _getClassId
     * @param {object|function} obj - instance or constructor
     * @return {string}
     */
    JS._getClassId = function (obj) {
        if (typeof obj === 'function' && obj.prototype.__cid__) {
            return obj.prototype.__cid__;
        }
        if (obj && obj.constructor) {
            if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__cid__')) {
                return obj.__cid__;
            }
        }
        return '';
    };

})();

// logs

Fire.log = function () {
    console.log.apply(console, arguments);
};
Fire.info = function () {
    (console.info || console.log).apply(console, arguments);
};
Fire.warn = function () {
    console.warn.apply(console, arguments);
};
if (console.error.bind) {
    // error会dump call stack，用bind可以避免dump Fire.error自己。
    Fire.error = console.error.bind(console);
}
else {
    Fire.error = function () {
        console.error.apply(console, arguments);
    };
}

// enum

Fire.defineEnum = function (obj) {
    var enumType = {};
    Object.defineProperty(enumType, '__enums__', {
        value: undefined,
        writable: true
    });

    var lastIndex = -1;
    for (var key in obj) {
        var val = obj[key];
        if (val === -1) {
            val = ++lastIndex;
        }
        else {
            lastIndex = val;
        }
        enumType[key] = val;

        var reverseKey = '' + val;
        if (key !== reverseKey) {
            Object.defineProperty(enumType, reverseKey, {
                value: key,
                enumerable: false
            });
        }
    }
    return enumType;
};

// check key order in object literal
var _TestEnum = Fire.defineEnum({
    ZERO: -1,
    ONE: -1,
    TWO: -1,
    THREE: -1
});
if (_TestEnum.ZERO !== 0 || _TestEnum.ONE !== 1 || _TestEnum.TWO !== 2 || _TestEnum.THREE !== 3) {
    Fire.error('Sorry, "Fire.defineEnum" not available on this platform, ' +
               'please report this error here: https://github.com/fireball-x/fireball/issues/new !');
}


(function () {
    var _d2r = Math.PI/180.0;
    var _r2d = 180.0/Math.PI;

    /**
     * Helper class for math operation
     * @class Math
     * @static
     */
    JS.mixin ( Math, {
        TWO_PI: 2.0 * Math.PI,
        HALF_PI: 0.5 * Math.PI,

        /**
         * degree to radius
         * @method deg2rad
         * @param {number} degree
         * @return {number}
         */
        deg2rad: function ( degree ) {
            return degree * _d2r;
        },

        /**
         * radius to degree
         * @method rad2deg
         * @param {number} radius
         * @return {number}
         */
        rad2deg: function ( radius ) {
            return radius * _r2d;
        },

        /**
         * let radius in -pi to pi
         * @method rad180
         * @param {number} radius
         * @return {number}
         */
        rad180: function ( radius ) {
            if ( radius > Math.PI || radius < -Math.PI ) {
                radius = (radius + Math.TOW_PI) % Math.TOW_PI;
            }
            return radius;
        },

        /**
         * let radius in 0 to 2pi
         * @method rad360
         * @param {number} radius
         * @return {number}
         */
        rad360: function ( radius ) {
            if ( radius > Math.TWO_PI )
                return radius % Math.TOW_PI;
            else if ( radius < 0.0 )
                return Math.TOW_PI + radius % Math.TOW_PI;
            return radius;
        },

        /**
         * let degree in -180 to 180
         * @method deg180
         * @param {number} degree
         * @return {number}
         */

        deg180: function ( degree ) {
            if ( degree > 180.0 || degree < -180.0 ) {
                degree = (degree + 360.0) % 360.0;
            }
            return degree;
        },

        /**
         * let degree in 0 to 360
         * @method deg360
         * @param {number} degree
         * @return {number}
         */
        deg360: function ( degree ) {
            if ( degree > 360.0 )
                return degree % 360.0;
            else if ( degree < 0.0 )
                return 360.0 + degree % 360.0;
            return degree;
        },

        randomRange: function (min, max) {
            return Math.random() * (max - min) + min;
        },

        randomRangeInt: function (min, max) {
            return Math.floor(this.randomRange(min, max));
        },

        clamp: function ( val, min, max ) {
            if (typeof min !== 'number') {
                Fire.error('[clamp] min value must be type number');
                return;
            }
            if (typeof max !== 'number') {
                Fire.error('[clamp] max value must be type number');
                return;
            }
            if (min > max) {
                Fire.error('[clamp] max value must not less than min value');
                return;
            }
            return Math.min( Math.max( val, min ), max );
        },

        clamp01: function ( val ) {
            return Math.min( Math.max( val, 0 ), 1 );
        },

        /**
         * @method calculateMaxRect
         * @param {Rect} out
         * @param {Vec2} p0
         * @param {Vec2} p1
         * @param {Vec2} p2
         * @param {Vec2} p3
         * @return {Vec2}
         */
        calculateMaxRect: function (out, p0, p1, p2, p3) {
            var minX = Math.min(p0.x, p1.x, p2.x, p3.x);
            var maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
            var minY = Math.min(p0.y, p1.y, p2.y, p3.y);
            var maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
            out.x = minX;
            out.y = minY;
            out.width = maxX - minX;
            out.height = maxY - minY;
            return out;
        }

    } );

})();

/**
 * @class Intersection
 * @static
 */
Fire.Intersection = (function () {
    var Intersection = {};

    function _lineLine ( a1, a2, b1, b2 ) {
        var result;

        var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if ( u_b !== 0 ) {
            var ua = ua_t / u_b;
            var ub = ub_t / u_b;

            if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @method lineLine
     * @param {Fire.Vec2} a1
     * @param {Fire.Vec2} a2
     * @param {Fire.Vec2} b1
     * @param {Fire.Vec2} b2
     * @return {boolean}
     */
    Intersection.lineLine = _lineLine;

    function _lineRect ( a1, a2, b ) {
        var r0 = new Fire.Vec2( b.x, b.y );
        var r1 = new Fire.Vec2( b.x, b.yMax );
        var r2 = new Fire.Vec2( b.xMax, b.yMax );
        var r3 = new Fire.Vec2( b.xMax, b.y );

        if ( _lineLine( a1, a2, r0, r1 ) )
            return true;

        if ( _lineLine( a1, a2, r1, r2 ) )
            return true;

        if ( _lineLine( a1, a2, r2, r3 ) )
            return true;

        if ( _lineLine( a1, a2, r3, r0 ) )
            return true;

        return false;
    }

    /**
     * @method lineRect
     * @param {Fire.Vec2} a1
     * @param {Fire.Vec2} a2
     * @param {Fire.Vec2} b
     * @return {boolean}
     */
    Intersection.lineRect = _lineRect;

    function _linePolygon ( a1, a2, b ) {
        var length = b.points.length;

        for ( var i = 0; i < length; ++i ) {
            var b1 = b.points[i];
            var b2 = b.points[(i+1)%length];

            if ( _lineLine( a1, a2, b1, b2 ) )
                return true;
        }

        return false;
    }
    Intersection.linePolygon = _linePolygon;

    function _rectRect ( a, b ) {
        var a_min_x = a.x;
        var a_min_y = a.y;
        var a_max_x = a.x + a.width;
        var a_max_y = a.y + a.height;

        var b_min_x = b.x;
        var b_min_y = b.y;
        var b_max_x = b.x + b.width;
        var b_max_y = b.y + b.height;

        return a_min_x <= b_max_x &&
               a_max_x >= b_min_x &&
               a_min_y <= b_max_y &&
               a_max_y >= b_min_y
               ;
    }
    Intersection.rectRect = _rectRect;

    function _rectPolygon ( a, b ) {
        var i;
        var r0 = new Fire.Vec2( a.x, a.y );
        var r1 = new Fire.Vec2( a.x, a.yMax );
        var r2 = new Fire.Vec2( a.xMax, a.yMax );
        var r3 = new Fire.Vec2( a.xMax, a.y );

        // intersection check
        if ( _linePolygon( r0, r1, b ) )
            return true;

        if ( _linePolygon( r1, r2, b ) )
            return true;

        if ( _linePolygon( r2, r3, b ) )
            return true;

        if ( _linePolygon( r3, r0, b ) )
            return true;

        // check if a contains b
        for ( i = 0; i < b.points.length; ++i ) {
            if ( a.contains( b.points[i] ) )
                return true;
        }

        // check if b contains a
        if ( b.contains(r0) )
            return true;

        if ( b.contains(r1) )
            return true;

        if ( b.contains(r2) )
            return true;

        if ( b.contains(r3) )
            return true;

        return false;
    }
    Intersection.rectPolygon = _rectPolygon;

    function _polygonPolygon ( a, b ) {
        var i;

        // check if a intersects b
        for ( i = 0; i < length; ++i ) {
            var a1 = a.points[i];
            var a2 = a.points[(i+1)%length];

            if ( _linePolygon( a1, a2, b ) )
                return true;
        }

        // check if a contains b
        for ( i = 0; i < b.points.length; ++i ) {
            if ( a.contains( b.points[i] ) )
                return true;
        }

        // check if b contains a
        for ( i = 0; i < a.points.length; ++i ) {
            if ( b.contains( a.points[i] ) )
                return true;
        }

        return false;
    }
    Intersection.polygonPolygon = _polygonPolygon;

    return Intersection;
})();

(function () {

    /**
     * The CallbacksHandler is an abstract class that can register and unregister callbacks by key.
     * Subclasses should implement their own methods about how to invoke the callbacks.
     * @class CallbacksHandler
     * @constructor
     */
    var CallbacksHandler = (function () {
        this._callbackTable = {};
    });

    Fire._CallbacksHandler = CallbacksHandler;

    /**
     * @method add
     * @param {string} key
     * @param {function} callback
     * @return {boolean} whether the key is new
     */
    CallbacksHandler.prototype.add = function (key, callback) {
        var list = this._callbackTable[key];
        if (typeof list !== 'undefined') {
            if (callback) {
                if (list !== null) {
                    list.push(callback);
                }
                else {
                    list = [callback];
                    this._callbackTable[key] = list;
                }
            }
            return false;
        }
        else {
            // new key
            list = callback ? [callback] : null;
            this._callbackTable[key] = list;
            return true;
        }
    };

    /**
     * Check if the specified key has any registered callback. If a callback is also specified,
     * it will only return true if the callback is registered.
     * @method has
     * @param {string} key
     * @param {function} [callback]
     * @return {boolean}
     */
    CallbacksHandler.prototype.has = function (key, callback) {
        var list = this._callbackTable[key];
        if (list && list.length > 0) {
            if (callback) {
                return list.indexOf(callback) !== -1;
            }
            return true;
        }
        return false;
    };

    /**
     * @method removeAll
     * @param {string} key
     */
    CallbacksHandler.prototype.removeAll = function (key) {
        delete this._callbackTable[key];
    };

    /**
     * @method remove
     * @param {string} key
     * @param {function} callback
     * @return {boolean} removed
     */
    CallbacksHandler.prototype.remove = function (key, callback) {
        var list = this._callbackTable[key];
        if (list) {
            var index = list.indexOf(callback);
            if (index !== -1) {
                list.splice(index, 1);
                return true;
            }
        }
        return false;
    };



    /**
     * The callbacks invoker to handle and invoke callbacks by key
     * @class CallbacksInvoker
     * @extends CallbacksHandler
     * @constructor
     */
    var CallbacksInvoker = function () {
        this._callbackTable = {}; // 直接赋值，省得调用父构造函数
    };
    JS.extend(CallbacksInvoker, CallbacksHandler);

    /**
     * This is a property accessible from {% crosslink Fire Fire %} global object
     * @property Fire.CallbacksInvoker
     * @type CallbacksInvoker
     */
    Fire.CallbacksInvoker = CallbacksInvoker;

    /**
     * @method invoke
     * @param {string} key
     * @param {*} [p1]
     * @param {*} [p2]
     * @param {*} [p3]
     * @param {*} [p4]
     * @param {*} [p5]
     */
    CallbacksInvoker.prototype.invoke = function (key, p1, p2, p3, p4, p5) {
        var list = this._callbackTable[key];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                list[i](p1, p2, p3, p4, p5);
            }
        }
    };

    /**
     * @method invokeAndRemove
     * @param {string} key
     * @param {*} [p1]
     * @param {*} [p2]
     * @param {*} [p3]
     * @param {*} [p4]
     * @param {*} [p5]
     */
    CallbacksInvoker.prototype.invokeAndRemove = function (key, p1, p2, p3, p4, p5) {
        // this.invoke(key, p1, p2, p3, p4, p5);
        // 这里不直接调用invoke仅仅是为了减少调用堆栈的深度，方便调试
        var list = this._callbackTable[key];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                list[i](p1, p2, p3, p4, p5);
            }
        }
        this.removeAll(key);
    };

    /**
     * @method bindKey
     * @param {string} key
     * @param {boolean} [remove=false] - remove callbacks after invoked
     * @return {function} the new callback which will invoke all the callbacks binded with the same supplied key
     */
    CallbacksInvoker.prototype.bindKey = function (key, remove) {
        var self = this;
        return function bindedInvocation (p1, p2, p3, p4, p5) {
            // this.invoke(key, p1, p2, p3, p4, p5);
            // 这里不直接调用invoke仅仅是为了减少调用堆栈的深度，方便调试
            var list = self._callbackTable[key];
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    list[i](p1, p2, p3, p4, p5);
                }
            }
            if (remove) {
                self.removeAll(key);
            }
        };
    };

    return CallbacksInvoker;
})();

/**
 * @module Fire
 * @class Fire
 * @static
 */

/**
 * @method padLeft
 * @param {string} text
 * @param {number} width
 * @param {string} ch
 * @return {string}
 */
Fire.padLeft = function ( text, width, ch ) {
    text = text.toString();
    width -= text.length;
    if ( width > 0 ) {
        return new Array( width + 1 ).join(ch) + text;
    }
    return text;
};

/**
 * @method fitRatio
 * @param {number} ratio (w/h)
 * @param {number} destWidth
 * @param {number} destHeight
 * @return {array}
 */
Fire.fitRatio = function ( ratio, destWidth, destHeight ) {
    var srcWidth, srcHeight;
    if ( ratio > 1 ) {
        srcWidth = destWidth;
        srcHeight = srcWidth / ratio;
    }
    else {
        srcHeight = destHeight;
        srcWidth = srcHeight * ratio;
    }
    return Fire.fitSize( srcWidth, srcHeight, destWidth, destHeight );
};

Fire.fitSize = function ( srcWidth, srcHeight, destWidth, destHeight ) {
    var width, height;
    if ( srcWidth > destWidth &&
         srcHeight > destHeight )
    {
        width = destWidth;
        height = srcHeight * destWidth/srcWidth;

        if ( height > destHeight ) {
            height = destHeight;
            width = srcWidth * destHeight/srcHeight;
        }
    }
    else if ( srcWidth > destWidth ) {
        width = destWidth;
        height = srcHeight * destWidth/srcWidth;
    }
    else if ( srcHeight > destHeight ) {
        width = srcWidth * destHeight/srcHeight;
        height = destHeight;
    }
    else {
        width = srcWidth;
        height = srcHeight;
    }

    return [width,height];
};

//
Fire.getEnumList = function (enumDef) {
    if ( enumDef.__enums__ !== undefined )
        return enumDef.__enums__;

    var enums = [];
    for ( var entry in enumDef ) {
        if ( enumDef.hasOwnProperty(entry) ) {
            var value = enumDef[entry];
            var isInteger = typeof value === 'number' && (value | 0) === value; // polyfill Number.isInteger
            if ( isInteger ) {
                enums.push( { name: entry, value: value } );
            }
        }
    }
    enums.sort( function ( a, b ) { return a.value - b.value; } );

    enumDef.__enums__ = enums;
    return enums;
};

//
Fire.getVarFrom = function ( obj, text ) {
    var res = text.split('.');
    var curObj = obj;
    for ( var i = 0; i < res.length; ++i ) {
        var name = res[i];
        curObj = curObj[name];
        if ( curObj === undefined || curObj === null )
            return null;
    }
    return curObj;
};

// r, g, b must be [0.0, 1.0]
Fire.rgb2hsv = function ( r, g, b ) {
    var hsv = { h: 0, s: 0, v: 0 };
    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    var delta = 0;
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) hsv.h = 0;
    else {
        delta = max - min;
        if (r === max) hsv.h = (g - b) / delta;
        else if (g === max) hsv.h = 2 + (b - r) / delta;
        else hsv.h = 4 + (r - g) / delta;
        hsv.h /= 6;
        if (hsv.h < 0) hsv.h += 1.0;
    }
    return hsv;
};

// the return rgb will be in [0.0, 1.0]
Fire.hsv2rgb = function ( h, s, v ) {
    var rgb = { r: 0, g: 0, b: 0 };
    if (s === 0) {
        rgb.r = rgb.g = rgb.b = v;
    }
    else {
        if (v === 0) {
            rgb.r = rgb.g = rgb.b = 0;
        }
        else {
            if (h === 1) h = 0;
            h *= 6;
            s = s;
            v = v;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - (s * f));
            var t = v * (1 - (s * (1 - f)));
            switch (i) {
                case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;

                case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;

                case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;

                case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;

                case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;

                case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
            }
        }
    }
    return rgb;
};

function _isDomNode(obj) {
    return (
        typeof Node === "object" ? obj instanceof Node :
        obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
    );
}

/**
 * @param {object} obj
 * @return {boolean} is {} ?
 */
var _isPlainEmptyObj_DEV = function (obj) {
    if (!obj || obj.constructor !== ({}).constructor) {
        return false;
    }
    // jshint ignore: start
    for (var k in obj) {
        return false;
    }
    // jshint ignore: end
    return true;
};
var _cloneable_DEV = function (obj) {
    return obj && typeof obj.clone === 'function' && (obj.constructor.prototype.hasOwnProperty('clone') || obj.hasOwnProperty('clone'));
};

/**
 * Tag the class with any meta attributes, then return all current attributes assigned to it.
 * This function holds only the attributes, not their implementations.
 *
 * @method attr
 * @param {function|object} constructor - the class or instance. If instance, the attribute will be dynamic and only available for the specified instance.
 * @param {string} propertyName - the name of property or function, used to retrieve the attributes
 * @param {object} [attributes] - the attribute table to mark, new attributes will merged with existed attributes. Attribute whose key starts with '_' will be ignored.
 * @return {object|undefined} return all attributes associated with the property. if none undefined will be returned
 *
 * @example
 *  var klass = function () { this.value = 0.5 };
 *  Fire.attr(klass, 'value');              // return undefined
 *  Fire.attr(klass, 'value', {}).min = 0;  // assign new attribute table associated with 'value', and set its min = 0
 *  Fire.attr(klass, 'value', {             // set values max and default
 *      max: 1,
 *      default: 0.5,
 *  });
 *  Fire.attr(klass, 'value');              // return { default: 0.5, min: 0, max: 1 }
 */
Fire.attr = function (constructor, propertyName, attributes) {
    var key = '_attr$' + propertyName;
    var instance, attrs, name;
    if (typeof constructor === 'function') {
        // attributes in class
        instance = constructor.prototype;
        attrs = instance[key];
        if (typeof attributes !== 'undefined') {
            // set
            if (typeof attributes === 'object') {
                if (!attrs) {
                    instance[key] = attrs = {};
                }
                for (name in attributes) {
                    if (name[0] !== '_') {
                        attrs[name] = attributes[name];
                    }
                }
            }
            else {
                instance[key] = attributes;
                return attributes;
            }
        }
        return attrs;
    }
    else {
        // attributes in instance
        instance = constructor;
        if (typeof attributes !== 'undefined') {
            // set
            if (typeof attributes === 'object') {
                if (instance.hasOwnProperty(key)) {
                    attrs = instance[key];
                }
                if (!attrs) {
                    instance[key] = attrs = {};
                }
                for (name in attributes) {
                    if (name[0] !== '_') {
                        attrs[name] = attributes[name];
                    }
                }
                return JS.addon({}, attrs, instance.constructor.prototype[key]);
            }
            else {
                instance[key] = attributes;
                return attributes;
            }
        }
        else {
            // get
            attrs = instance[key];
            if (typeof attrs === 'object') {
                return JS.addon({}, attrs, instance.constructor.prototype[key]);
            }
            else {
                return attrs;
            }
        }
    }
};

/*

BuiltinAttributes: {
    default: defaultValue,
    _canUsedInGetter: true, (default true)
    _canUsedInSetter: false, (default false) (NYI)
}
Getter or Setter: {
    hasGetter: true,
    hasSetter: true,
}
Callbacks: {
    _onAfterProp: function (constructor, propName) {},
    _onAfterGetter: function (constructor, propName) {}, (NYI)
    _onAfterSetter: function (constructor, propName) {}, (NYI)
}
 */

/**
 * By default, all properties declared by "Class.prop" is serializable.
 * The NonSerialized attribute marks a variable to not be serialized,
 * so you can keep a property show in the Editor and Fireball will not attempt to serialize it.
 * See {% crosslink EditorOnly Fire.EditorOnly %} for more details.
 *
 * @property NonSerialized
 * @type object
 */
Fire.NonSerialized = {
    serializable: false,
    _canUsedInGetter: false
};

/**
 * The EditorOnly attribute marks a variable to be serialized in editor project, but non-serialized
 * in exported products.
 *
 * @property EditorOnly
 * @type object
 */
Fire.EditorOnly = {
    editorOnly: true,
    _canUsedInGetter: false,
};

/**
 * Specify that the input value must be integer in Inspector.
 * Also used to indicates that the type of elements in array or the type of value in dictionary is integer.
 * @property Integer
 * @type object
 */
Fire.Integer = { type: 'int' };

/**
 * Indicates that the type of elements in array or the type of value in dictionary is double.
 * @property Float
 * @type object
 */
Fire.Float = { type: 'float' };

Fire.SingleText = { textMode: 'single' };
Fire.MultiText = { textMode: 'multi' };

function getTypeChecker (type, attrName, objectTypeCtor) {
    return function (constructor, mainPropName) {
        var mainPropAttrs = Fire.attr(constructor, mainPropName) || {};
        if (mainPropAttrs.type !== type) {
            Fire.warn('Can only indicate one type attribute for %s.%s.', JS.getClassName(constructor), mainPropName);
            return;
        }
        if (!mainPropAttrs.hasOwnProperty('default')) {
            return;
        }
        var defaultVal = mainPropAttrs.default;
        if (typeof defaultVal === 'undefined') {
            return;
        }
        var isContainer = Array.isArray(defaultVal) || _isPlainEmptyObj_DEV(defaultVal);
        if (isContainer) {
            return;
        }
        var defaultType = typeof defaultVal;
        if (defaultType === type) {
            if (type === 'object') {
                if (defaultVal && !(defaultVal instanceof objectTypeCtor)) {
                    Fire.warn('The default value of %s.%s is not instance of %s.',
                               JS.getClassName(constructor), mainPropName, JS.getClassName(objectTypeCtor));
                }
                else {
                    return;
                }
            }
            else {
                Fire.warn('No needs to indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                           attrName, JS.getClassName(constructor), mainPropName, type);
            }
        }
        else {
            Fire.warn('Can not indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                       attrName, JS.getClassName(constructor), mainPropName, defaultType);
        }
        delete mainPropAttrs.type;
    };
}
/**
 * Indicates that the type of elements in array or the type of value in dictionary is boolean.
 * @property Boolean
 * @type
 */
Fire.Boolean = {
    type: 'boolean',
    _onAfterProp: getTypeChecker('boolean', 'Fire.Boolean')
};

/**
 * Indicates that the type of elements in array or the type of value in dictionary is string.
 * @property String
 * @type object
 */
Fire.String = {
    type: 'string',
    _onAfterProp: getTypeChecker('string', 'Fire.String')
};

/**
 * Makes a property only accept the supplied object type in Inspector.
 * If the type is derived from Fire.Asset, it will be serialized to uuid.
 *
 * @method ObjectType
 * @param {function} constructor - the special type you want
 * @param {boolean} [useUuid=false] - the value will be represented as a uuid string
 * @return {object} the attribute
 */
Fire.ObjectType = function (constructor, useUuid) {
    return {
        type: useUuid ? 'uuid' : 'object',
        ctor: constructor,
    };
};

/**
 * Makes a property show up as a enum in Inspector.
 *
 * @method Enum
 * @param {object} enumType
 * @return {object} the enum attribute
 */
Fire.Enum = function (enumType) {
    return { type: 'enum', enumList: Fire.getEnumList(enumType) };
};

/**
 * Makes a property referenced to a javascript host object which needs to load before deserialzation.
 * The property will not be serialized but will be referenced to the loaded host object while deserialzation.
 *
 * @method RawType
 * @param {string} [typename]
 * @return {object} the attribute
 */
Fire.RawType = function (typename) {
    var NEED_EXT_TYPES = ['image', 'json', 'text', 'audio'];  // the types need to specify exact extname
    return {
        // type: 'raw',
        rawType: typename,
        serializable: false,
        // hideInInspector: true,
        _canUsedInGetter: false,

        _onAfterProp: function (constructor, mainPropName) {
            // check raw object
            var checked = (function checkRawType(constructor) {
                if (! Fire.isChildClassOf(constructor, Asset)) {
                    Fire.error('RawType is only available for Assets');
                    return false;
                }
                var found = false;
                for (var p = 0; p < constructor.__props__.length; p++) {
                    var propName = constructor.__props__[p];
                    var attrs = Fire.attr(constructor, propName);
                    var rawType = attrs.rawType;
                    if (rawType) {
                        var containsUppercase = (rawType.toLowerCase() !== rawType);
                        if (containsUppercase) {
                            Fire.error('RawType name cannot contain uppercase');
                            return false;
                        }
                        if (found) {
                            Fire.error('Each asset cannot have more than one RawType');
                            return false;
                        }
                        found = true;
                    }
                }
                return true;
            })(constructor);

            if (checked) {
                var mainPropAttr = Fire.attr(constructor, mainPropName) || {};
                var needExtname = (NEED_EXT_TYPES.indexOf(mainPropAttr.rawType) !== -1);
                if (needExtname) {
                    // declare extname field
                    constructor.prop('_rawext', '', Fire.HideInInspector);
                }
            }
        }
    };
};

///**
// * @property {object} Fire.Float
// * @deprecated - No need to define Fire.Float, you should just set default value to any number
// */
//Object.defineProperty(Fire, 'Float', { get: function () {
//    Fire.warn('No need to use "Fire.Float", you just need to set default value to any number');
//    return {};
//}});
///**
// * @property {object} Fire.Serializable
// * @deprecated - No need to use Fire.Serializable, all properties defined by "Class.prop" is already serializable.
// */
//Object.defineProperty(Fire, 'Serializable', { get: function () {
//    Fire.warn('No need to use "Fire.Serializable", all properties defined by "Class.prop" is already serializable.');
//    return {};
//}});

/**
 * Makes a custom property
 *
 * @method Custom
 * @param {string} name
 * @return {object}
 */
Fire.Custom = function (type) {
    return { custom: type };
};

/**
 * Makes a property not show up in the Inspector but be serialized.
 * @property HideInInspector
 * @type object
 */
Fire.HideInInspector = { hideInInspector: true };

/**
 * Set a custom property name for display in the editor
 *
 * @method Fire.DisplayName
 * @param {string} name
 * @return {object} the attribute
 */
Fire.DisplayName = function (name) {
    return { displayName: name };
};

/**
 * The ReadOnly attribute indicates that the property field is disabled in Inspector.
 * @property ReadOnly
 * @type object
 */
Fire.ReadOnly = {
    readOnly: true
};

/**
 * Specify a tooltip for a property
 *
 * @method Tooltip
 * @param {string} tooltip
 * @return {object} the attribute
 */
Fire.Tooltip = function (tooltip) {
    return { tooltip: tooltip };
};

/**
 * @method Nullable
 * @param {string} boolPropName
 * @param {boolean} hasValueByDefault
 * @return {object} the attribute
 */
Fire.Nullable = function (boolPropName, hasValueByDefault) {
    return {
        nullable: boolPropName,

        _onAfterProp: function (constructor, mainPropName) {
            // declare boolean
            constructor.prop(boolPropName, hasValueByDefault, Fire.HideInInspector);
            // copy attributes from main property
            var mainPropAttr = Fire.attr(constructor, mainPropName) || {};
            if (mainPropAttr.serializable === false) {
                Fire.attr(constructor, boolPropName, Fire.NonSerialized);
            }
            else if (mainPropAttr.editorOnly) {
                Fire.attr(constructor, boolPropName, Fire.EditorOnly);
            }
        }
    };
};

/**
 * @method Watch
 * @param {string} names - the name of target property to watch, array is also acceptable.
 * @param {function} callback - the callback function to invoke when target property(s) is changed.
 * @return {object} the attribute
 */
Fire.Watch = function (names, callback) {
    return {
        watch: [].concat(names),  // array of property name to watch
        watchCallback: callback
    };
};

/**
 * @method Range
 * @param {number} min: null mins infinite
 * @param {number} max: null mins infinite
 * @return {object} the attribute
 */
Fire.Range = function (min, max) {
   return { min: min, max: max };
};

/**
 * both getter and prop must register the name into __props__ array
 * @method _appendProp
 * @param {string} name - prop name
 * @private
 */
var _appendProp = function (name/*, isGetter*/) {
    var JsVarReg = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!JsVarReg.test(name)) {
        Fire.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        return;
    }
    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        // 这里不进行报错，因为重写 prop 可以是一个合法的行为，可以用于设置新的默认值。
        //else {
        //    Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
        //}
    }
};

/**
 * the metaclass of the "fire class" created by Fire.define, all its static members
 * will inherited by fire class.
 * @property _metaClass
 * @type object
 */
var _metaClass = {

    /**
     * @property {string[]} class.__props__
     * @private
     */
    __props__: null,

    /**
     * Add new instance field, propertie, or method made available on the class.
     * 该方法定义的变量默认情况下都会被序列化，也会在inspector中显示。
     * 如果传入属性包含Fire.HideInInspector则仍会序列化但不在inspector中显示。
     * 如果传入属性包含Fire.NonSerialized则不会序列化并且不会在inspector中显示。
     * 如果传入属性包含Fire.EditorOnly则只在编辑器下序列化，打包时不序列化。
     *
     * @method class.prop
     * @param {string} name - the property name
     * @param {*} defaultValue - the default value
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     */
    prop: function (name, defaultValue, attribute) {
        'use strict';
        // check default object value
        if (typeof defaultValue === 'object' && defaultValue) {
            if (Array.isArray(defaultValue)) {
                // check array empty
                if (defaultValue.length > 0) {
                    Fire.error('Default array must be empty, set default value of ' + JS.getClassName(this) + '.prop("' + name +
                        '", ...) to null or [], and initialize in constructor please. (just like "this.' +
                        name + ' = [...];")');
                    return this;
                }
            }
            else if (!_isPlainEmptyObj_DEV(defaultValue)) {
                // check cloneable
                if (!_cloneable_DEV(defaultValue)) {
                    Fire.error('Do not set default value to non-empty object, unless the object defines its own "clone" function. Set default value of ' + JS.getClassName(this) + '.prop("' + name +
                        '", ...) to null or {}, and initialize in constructor please. (just like "this.' +
                        name + ' = {foo: bar};")');
                    return this;
                }
            }
        }
        // check base prototype to avoid name collision
        for (var base = this.$super; base; base = base.$super) {
            // 这个循环只能检测到最上面的FireClass的父类，如果再上还有父类，将不做检测。（Fire.extend 将 prototype.constructor 设为子类）
            if (base.prototype.hasOwnProperty(name)) {
                Fire.error('Can not declare ' + JS.getClassName(this) + '.' + name +
                           ', it is already defined in the prototype of ' + JS.getClassName(base));
                return;
            }
        }
        // set default value
        Fire.attr(this, name, { 'default': defaultValue });

        // register property
        _appendProp.call(this, name);

        // 禁用，因为getter/setter需要动态获得类型，所以类型统一由上层处理
        //// apply default type (NOTE: if user provide type attribute, this one will be overwrote)
        //var mytype = typeof defaultValue;
        //if ( mytype === 'number' ) {
        //    mytype = 'float';
        //}
        //Fire.attr( this, name, { 'type': mytype } );

        // apply attributes
        if (attribute) {
            var onAfterProp = null;
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // register callback
                if (attr._onAfterProp) {
                    onAfterProp = onAfterProp || [];
                    onAfterProp.push(attr._onAfterProp);
                }
            }
            // call callback
            if (onAfterProp) {
                for (var c = 0; c < onAfterProp.length; c++) {
                    onAfterProp[c](this, name);
                }
            }
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     */
    get: function (name, getter, attribute) {
        'use strict';

        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.get) {
            Fire.error(JS.getClassName(this) + ': the getter of "' + name + '" is already defined!');
            return this;
        }
        var displayInInspector = true;
        if (attribute) {
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                if (attr._canUsedInGetter === false) {
                    Fire.error('Can not apply the specified attribute to the getter of "' + JS.getClassName(this) + '.' + name + '", attribute index: ' + (i - AttrArgStart));
                    continue;
                }
                Fire.attr(this, name, attr);

                // check attributes
                if (attr.hideInInspector) {
                    displayInInspector = false;
                }
                if (attr.serializable === false || attr.editorOnly === true) {
                    Fire.warn('No need to use Fire.NonSerialized or Fire.EditorOnly for the getter of ' +
                        JS.getClassName(this) + '.' + name + ', every getter is actually non-serialized.');
                }
                if (attr.hasOwnProperty('default')) {
                    Fire.error(JS.getClassName(this) + ': Can not set default value of a getter!');
                    return this;
                }
            }
        }
        Fire.attr(this, name, Fire.NonSerialized);

        if (displayInInspector) {
            _appendProp.call(this, name/*, true*/);
        }
        else {
            var index = this.__props__.indexOf(name);
            if (index >= 0) {
                Fire.error(JS.getClassName(this) + '.' + name + ' is already defined!');
                return this;
            }
        }
        Object.defineProperty(this.prototype, name, {
            get: getter,
            configurable: true
        });
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，除非有对应的getter否则不在inspector中显示。
     *
     * @method class.set
     * @static
     * @param {string} name - the setter property
     * @param {function} setter - the setter function
     * @return {function} the class itself
     */
    set: function (name, setter) {
        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.set) {
            Fire.error(JS.getClassName(this) + ': the setter of "' + name + '" is already defined!');
            return this;
        }
        // ================================================================
        // ----------------------------------------------------------------
        Object.defineProperty(this.prototype, name, {
            set: setter,
            configurable: true
        });
        // ================================================================
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.getset
     * @static
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {function} setter - the setter function
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     */
    getset: function (name, getter, setter, attribute) {
        'use strict';
        if (attribute) {
            var getterArgs = [].slice.call(arguments);
            getterArgs.splice(2, 1);    // remove setter
            this.get.apply(this, getterArgs);
        }
        else {
            this.get(name, getter);
        }
        this.set(name, setter);
        return this;
    }
};

var _createInstanceProps = function (instance, itsClass) {
    var propList = itsClass.__props__;
    if (propList) {
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            var attrs = Fire.attr(itsClass, prop);
            if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default, default maybe 0
                var def = attrs.default;
                if (typeof def === 'object' && def) {
                    // 防止多个实例引用相同对象
                    if (def.clone) {
                        def = def.clone();
                    }
                    else if (Array.isArray(def)) {
                        def = [];
                    }
                    else {
                        def = {};
                    }
                }
                instance[prop] = def;
            }
        }
    }
};

/**
 * Checks whether the constructor is created by Fire.define
 *
 * @method _isFireClass
 * @param {function} constructor
 * @return {boolean}
 * @private
 */
Fire._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

/**
 * Checks whether subclass is child of superclass or equals to superclass
 *
 * @method isChildClassOf
 * @param {function} subclass
 * @param {function} superclass
 * @return {boolean}
 */
Fire.isChildClassOf = function (subclass, superclass) {
    if (subclass && superclass) {
        if (typeof subclass !== 'function') {
            Fire.warn('[isChildClassOf] subclass should be function type, not', subclass);
            return false;
        }
        if (typeof superclass !== 'function') {
            Fire.warn('[isChildClassOf] superclass should be function type, not', superclass);
            return false;
        }
        // fireclass
        for (; subclass && subclass.$super; subclass = subclass.$super) {
            if (subclass === superclass) {
                return true;
            }
        }
        if (subclass === superclass) {
            return true;
        }
        // js class
        var dunderProto = Object.getPrototypeOf(subclass.prototype);
        while (dunderProto) {
            subclass = dunderProto.constructor;
            if (subclass === superclass) {
                return true;
            }
            dunderProto = Object.getPrototypeOf(subclass.prototype);
        }
    }
    return false;
};

function _initClass(className, fireClass) {
    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(fireClass, staticMember, {
            value: _metaClass[staticMember],
            // __props__ is writable
            writable: staticMember === '__props__',
            // __props__ is enumerable so it can be inherited by Fire.extend
            enumerable: staticMember === '__props__'
        });
    }
}

Fire._doDefine = function (className, baseClass, constructor) {
    var fireClass = _createCtor(constructor, baseClass);
    _initClass(className, fireClass);

    if (baseClass) {
        // inherit
        JS.extend(fireClass, baseClass);
        fireClass.$super = baseClass;
        if (baseClass.__props__) {
            // copy __props__
            fireClass.__props__ = baseClass.__props__.slice();
        }
    }

    JS.setClassName(className, fireClass);

    return fireClass;
};

/**
 * Defines a FireClass using the given constructor.
 *
 * @method define
 * @param {string} [className] - the name of class that is used to deserialize this class
 * @param {function} [constructor] - a constructor function that is used to instantiate this class
 * @return {function} the constructor of newly defined class
 */
Fire.define = function (className, constructor) {
    return Fire.extend(className, null, constructor);
};

/**
 * Creates a sub FireClass based on the specified baseClass parameter.
 * See also {% crosslink extend Fire.JS.extend %}.
 *
 * @method extend
 * @param {string} [className] - the name of class that is used to deserialize this class
 * @param {function} baseClass - !#en The base class to inherit from
 *                               !#zh 继承的基类
 * @param {function} [constructor] - a constructor function that is used to instantiate this class,
 *                                   if not supplied, the constructor of baseClass will be called automatically.
 * @return {function} the constructor of newly defined class
 */
Fire.extend = function (className, baseClass, constructor) {
    if (typeof className === 'function') {
        if (constructor) {
            Fire.error('[Fire.extend] invalid type of arguments');
            return null;
        }
        constructor = baseClass;
        baseClass = className;
        className = '';
    }
    if (typeof className === 'string') {
        return Fire._doDefine(className, baseClass, constructor);
    }
    else if (className) {
        Fire.error('[Fire.extend] unknown typeof first argument');
    }
    else {
        Fire.error('[Fire.extend] first argument must be non-nil');
    }
    return null;
};

function _createCtor (constructor, baseClass) {
    var fireClass;
    if (constructor) {
        _checkCtor(constructor);
        if (baseClass) {
            fireClass = function () {
                baseClass.apply(this, arguments);
                _createInstanceProps(this, fireClass);
                constructor.apply(this, arguments);
            };
        }
        else {
            fireClass = function () {
                _createInstanceProps(this, fireClass);
                constructor.apply(this, arguments);
            };
        }
    }
    else {
        if (baseClass) {
            fireClass = function () {
                baseClass.apply(this, arguments);
                _createInstanceProps(this, fireClass);
            };
        }
        else {
            // no constructor
            fireClass = function () {
                _createInstanceProps(this, fireClass);
            };
        }
    }
    return fireClass;
}

function _checkCtor (ctor) {
    if (Fire._isFireClass(ctor)) {
        Fire.error("Constructor can not be another FireClass");
        return;
    }
    if (typeof ctor !== 'function') {
        Fire.error("Constructor of FireClass must be function type");
        return;
    }
    if (ctor.length > 0) {
        // fireball-x/dev#138: To make a unified FireClass serialization process,
        // we don't allow parameters for constructor when creating instances of FireClass.
        // For advance user, construct arguments can still get from 'arguments'.
        Fire.warn("Can not instantiate FireClass with arguments.");
        return;
    }
}
/**
 * Specially optimized define function only for internal base classes
 * @private
 */
Fire._fastDefine = function (className, constructor, serializableFields) {
    JS.setClassName(className, constructor);
    constructor.__props__ = serializableFields;
    for (var i = 0; i < serializableFields.length; i++) {
        Fire.attr(constructor, serializableFields[i], Fire.HideInInspector);
    }
};


Fire.Class = function (options) {
    var name = options.name;
    var base = options.extends;
    var ctor = options.hasOwnProperty('constructor') && options.constructor;

    // create constructor
    var cls;
    if (base) {
        if (name) {
            cls = Fire.extend(name, base, ctor);
        }
        else {
            cls = Fire.extend(base, ctor);
            name = Fire.JS.getClassName(cls);
        }
    }
    else {
        if (name) {
            cls = Fire.define(name, ctor);
        }
        else {
            cls = Fire.define(ctor);
            name = Fire.JS.getClassName(cls);
        }
    }

    // define properties
    var properties = options.properties;
    if (properties) {
        for (var propName in properties) {
            var val = properties[propName];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                var attrs = parseAttributes(val, name, propName);
                if (val.hasOwnProperty('default')) {
                    cls.prop.apply(cls, [propName, val.default].concat(attrs));
                }
                else {
                    var getter = val.get;
                    var setter = val.set;
                    if (getter) {
                        cls.get.apply(cls, [propName, getter].concat(attrs));
                    }
                    if (setter) {
                        cls.set(propName, setter);
                    }
                }
                //Fire.error('属性 %s.%s 不能定义为 null', name, propName);
            }
            else {
                cls.prop(propName, val);
            }
        }
    }

    // define functions
    for (var funcName in options) {
        if (funcName === 'name' || funcName === 'extends' || funcName === 'constructor' || funcName === 'properties') {
            continue;
        }
        var func = options[funcName];
        var type = typeof func;
        if (type === 'function') {
            cls.prototype[funcName] = func;
        }
    }

    return cls;
};

var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        if (type === 'Integer') {
            result.push(Fire.Integer);
        }
        else if (type === 'Float' || type === Number) {
            result.push(Fire.Float);
        }
        else if (type === 'Boolean' || type === Boolean) {
            result.push(Fire.Boolean);
        }
        else if (type === 'String' || type === String) {
            result.push(Fire.String);
        }
        else if (type === 'Object' || type === Object) {
        }
        else if (typeof type === 'object') {
            if (type.hasOwnProperty('__enums__')) {
                result.push(Fire.Enum(type));
            }
        }
        else if (typeof type === 'function') {
            result.push(Fire.ObjectType(type));
        }
    }

    function applyAttr (attrName, expectType, attrCreater) {
        var val = attrs[attrName];
        if (val) {
            if (typeof val === expectType) {
                result.push(typeof attrCreater === 'function' ? attrCreater(val) : attrCreater);
            }
        }
    }

    applyAttr('rawType', 'string', Fire.RawType);
    applyAttr('hideInInspector', 'boolean', Fire.HideInInspector);
    applyAttr('editorOnly', 'boolean', Fire.EditorOnly);
    applyAttr('displayName', 'string', Fire.DisplayName);
    applyAttr('multiline', 'boolean', Fire.MultiText);
    applyAttr('readOnly', 'boolean', Fire.ReadOnly);
    applyAttr('tooltip', 'string', Fire.Tooltip);

    if (attrs.serializable === false) {
        result.push(Fire.NonSerialized);
    }
    //if (attrs.custom) {
    //    result.push(Fire.Custom(attrs.custom));
    //}

    var range = attrs.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                result.push(Fire.Range(range[0], range[1]));
            }
        }
    }

    var nullable = attrs.nullable;
    if (nullable) {
        if (typeof nullable === 'object') {
            var boolPropName = nullable.propName;
            if (typeof boolPropName === 'string') {
                var def = nullable.default;
                if (typeof def === 'boolean') {
                    result.push(Fire.Nullable(boolPropName, def));
                }
            }
        }
    }

    var watch = attrs.watch;
    if (watch) {
        if (typeof watch === 'object') {
            for (var watchKey in watch) {
                var watchCallback = watch[watchKey];
                if (typeof watchCallback === 'function') {
                    result.push(Fire.Watch(watchKey.split(' '), watchCallback));
                }
            }
        }
    }

    return result;
}

// The utils for path operation

/**
 * @class Path
 * @static
 */
if (Fire.isNode) {
    Fire.Path = require('path');
}
else {
    // implement a simple fallback if node not available
    Fire.Path = (function () {

        var splitPath;
        if (Fire.isWin32) {
            // copied from node.js/lib/path.js
            // Regex to split a windows path into three parts: [*, device, slash,
            // tail] windows-only
            var splitDeviceRe =
                /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

            // Regex to split the tail part of the above into [*, dir, basename, ext]
            var splitTailRe =
                /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

            // Function to split a filename into [root, dir, basename, ext]
            // windows version
            splitPath = function(filename) {
                // Separate device+slash from tail
                var result = splitDeviceRe.exec(filename),
                    device = (result[1] || '') + (result[2] || ''),
                    tail = result[3] || '';
                // Split the tail into dir, basename and extension
                var result2 = splitTailRe.exec(tail),
                    dir = result2[1],
                    basename = result2[2],
                    ext = result2[3];
                return [device, dir, basename, ext];
            };
        }
        else {
            // copied from node.js/lib/path.js
            // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.
            var splitPathRe =
                /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            splitPath = function(filename) {
                return splitPathRe.exec(filename).slice(1);
            };
        }

        path = {
            basename: function (path) {
                return path.replace(/^.*(\\|\/|\:)/, '');
            },
            extname: function (path) {
                return path.substring((~-path.lastIndexOf(".") >>> 0) + 1);
            },
            dirname: function (path) {
                // copied from node.js/lib/path.js
                var result = splitPath(path),
                    root = result[0],
                    dir = result[1];

                if (!root && !dir) {
                    // No dirname whatsoever
                    return '.';
                }

                if (dir) {
                    // It has a dirname, strip trailing slash
                    dir = dir.substr(0, dir.length - 1);
                }

                return root + dir;
            },
            sep: (Fire.isWin32 ? '\\' : '/'),
        };
        return path;
    })();
}

/**
 * @method setExtname
 * @param {string} path
 * @param {string} newExtension - extension to replace with
 * @return {string} result
 */
Fire.Path.setExtname = function (path, newExtension) {
    // if (Fire.isNode) return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path))) + newExtension;
    var dotIndex = (~-path.lastIndexOf(".") >>> 0) + 1;
    return path.substring(0, dotIndex) + newExtension;
};

/**
 * @method setEndWithSep
 * @param {string} path
 * @param {boolean} [endWithSep = true]
 * @return {string} result
 */
Fire.Path.setEndWithSep = function (path, endWithSep) {
    endWithSep = (typeof endWithSep !== 'undefined') ? endWithSep : true;

    var endChar = path[path.length - 1];
    var oldEndWithSep = (endChar === '\\' || endChar === '/');
    if (!oldEndWithSep && endWithSep) {
        path += Fire.Path.sep;
    }
    else if (oldEndWithSep && !endWithSep) {
        path = path.substring(0, path.length - 1);
    }
    return path;
};

/**
 * @class FObject
 * @constructor
 */
FObject = (function () {

    // constructor

    function FObject () {
        this._name = '';
        this._objFlags = 0;
    }

    // TODO: 统一FireClass和FObject
    Fire._fastDefine('Fire.FObject', FObject, ['_name', '_objFlags']);

    // static

    /**
     * Checks whether the object is not destroyed
     * @method Fire.isValid
     * @return {boolean} whether it is not destroyed
     */
    Fire.isValid = function (object) {
        return !!object && !(object._objFlags & Destroyed);
    };

    // internal static

    var objectsToDestroy = [];

    Object.defineProperty(FObject, '_deferredDestroy', {
        value: function () {
            // if we called b.destory() in a.onDestroy(), objectsToDestroy will be resized,
            // but we only destroy the objects which called destory in this frame.
            var deleteCount = objectsToDestroy.length;
            for (var i = 0; i < deleteCount; ++i) {
                var obj = objectsToDestroy[i];
                if (!(obj._objFlags & Destroyed)) {
                    obj._destroyImmediate();
                }
            }
            if (deleteCount === objectsToDestroy.length) {
                objectsToDestroy.length = 0;
            }
            else {
                objectsToDestroy.splice(0, deleteCount);
            }
        },
        enumerable: false
    });

    // instance

    /**
     * @property name
     * @type boolean
     */
    Object.defineProperty(FObject.prototype, 'name', {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: false
    });

    Object.defineProperty(FObject.prototype, 'isValid', {
        get: function () {
            return !(this._objFlags & Destroyed);
        }
    });

    /**
     * Destroy this FObject, and release all its own references to other resources.
     * After destory, this FObject is not usable any more.
     * You can use Fire.isValid(obj) (or obj.isValid if obj is non-nil) to check whether the object is destroyed before accessing it.
     * @method destroy
     * @return {boolean} whether it is the first time the destroy being called
     */
    FObject.prototype.destroy = function () {
        if (this._objFlags & Destroyed) {
            Fire.error('object already destroyed');
            return;
        }
        if (this._objFlags & ToDestroy) {
            return false;
        }
        this._objFlags |= ToDestroy;
        objectsToDestroy.push(this);
        return true;
    };

    /**
     * Clear all references in the instance.
     * NOTE: this method will not clear the getter or setter functions which defined in the INSTANCE of FObject.
     *       You can override the _destruct method if you need.
     */
    FObject.prototype._destruct = function () {
        // 允许重载destroy
        // 所有可枚举到的属性，都会被清空
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                var type = typeof this[key];
                switch (type) {
                    case 'string':
                        this[key] = '';
                        break;
                    case 'object':
                        this[key] = null;
                        break;
                    case 'function':
                        this[key] = null;
                        break;
                    default:
                        break;
                }
            }
        }
    };

    FObject.prototype._onPreDestroy = null;

    FObject.prototype._destroyImmediate = function () {
        if (this._objFlags & Destroyed) {
            Fire.error('object already destroyed');
            return;
        }
        // engine internal callback
        if (this._onPreDestroy) {
            this._onPreDestroy();
        }
        // do destroy
        this._destruct();
        // mark destroyed
        this._objFlags |= Destroyed;
    };

    return FObject;
})();

Fire.FObject = FObject;

var HashObject = (function () {

    /**
     * 提供获取对象ID的功能，该ID全局唯一但不会被序列化，可用于索引对象。
     * 如果你将对象索引起来，必须记住清除索引，否则对象将永远不会被销毁。
     * @class HashObject
     * @static
     */
    var HashObject = Fire.extend('Fire.HashObject', Fire.FObject, function () {
        Object.defineProperty(this, '_hashCode', {
            value: 0,
            writable: true,
            enumerable: false
        });
        Object.defineProperty(this, '_id', {
            value: '',
            writable: true,
            enumerable: false
        });
    });

    // Yes, the id might have a conflict problem once every 365 days
    // if the game runs at 60 FPS and each frame 4760273 counts of new HashObject's id are requested.
    var globalId = 0;

    /**
     * @property hashCode
     * @type number
     * @readOnly
     */
    Object.defineProperty ( HashObject.prototype, 'hashCode', {
        get: function () {
            return this._hashCode || (this._hashCode = ++globalId);
        }
    });

    /**
     * @property id
     * @type string
     * @readOnly
     */
    Object.defineProperty ( HashObject.prototype, 'id', {
        get: function () {
            return this._id || (this._id = '' + this.hashCode);
        }
    });

    return HashObject;
})();

Fire.HashObject = HashObject;

Vec2 = (function () {

    /**
     * @class Vec2
     * @constructor
     * @param {number} x
     * @param {number} y
     */
    function Vec2( x, y ) {
        this.x = (typeof x === 'number' ? x : 0.0);
        this.y = (typeof y === 'number' ? y : 0.0);
    }
    JS.setClassName('Fire.Vec2', Vec2);

    // static

    /**
     * return a Vec2 object with x = 1 and y = 1
     * @property one
     * @type Vec2
     */
    Object.defineProperty(Vec2, 'one', {
        get: function () {
            return new Vec2(1.0, 1.0);
        }
    });

    Object.defineProperty(Vec2, 'zero', {
        get: function () {
            return new Vec2(0.0, 0.0);
        }
    });

    Object.defineProperty(Vec2, 'up', {
        get: function () {
            return new Vec2(0.0, 1.0);
        }
    });

    Object.defineProperty(Vec2, 'right', {
        get: function () {
            return new Vec2(1.0, 0.0);
        }
    });

    // member

    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };

    Vec2.prototype.set = function ( newValue ) {
        this.x = newValue.x;
        this.y = newValue.y;
    };

    Vec2.prototype.equals = function (other) {
        if ( other && other.constructor === Fire.Vec2 )
            return this.x === other.x && this.y === other.y;
        return false;
    };

    Vec2.prototype.toString = function () {
        return "(" +
            this.x.toFixed(2) + ", " +
            this.y.toFixed(2) + ")"
        ;
    };

    /**
     * Adds this vector. If you want to save result to another vector, use add() instead.
     * @method addSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     */
    Vec2.prototype.addSelf = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };

    /**
     * Adds tow vectors, and returns the new result.
     * @method add
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.add = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x + vector.x;
        out.y = this.y + vector.y;
        return out;
    };

    /**
     * Subtracts one vector from this. If you want to save result to another vector, use sub() instead.
     * @method subSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     */
    Vec2.prototype.subSelf = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };

    /**
     * Subtracts one vector from this, and returns the new result.
     * @method sub
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.sub = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        return out;
    };

    /**
     * Multiplies this by a number. If you want to save result to another vector, use mul() instead.
     * @method mulSelf
     * @param {number} num
     * @return {Vec2} returns this
     */
    Vec2.prototype.mulSelf = function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    };

    /**
     * Multiplies by a number, and returns the new result.
     * @method mul
     * @param {number} num
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.mul = function (num, out) {
        out = out || new Vec2();
        out.x = this.x * num;
        out.y = this.y * num;
        return out;
    };

    /**
     * Multiplies two vectors.
     * @method scaleSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     */
    Vec2.prototype.scaleSelf = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    };

    /**
     * Multiplies two vectors, and returns the new result.
     * @method scale
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.scale = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x * vector.x;
        out.y = this.y * vector.y;
        return out;
    };

    /**
     * Divides two vectors. If you want to save result to another vector, use div() instead.
     * @method divSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     */
    Vec2.prototype.divSelf = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    };

    /**
     * Divides two vectors, and returns the new result.
     * @method div
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.div = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x / vector.x;
        out.y = this.y / vector.y;
        return out;
    };

    /**
     * Negates the components. If you want to save result to another vector, use neg() instead.
     * @method negSelf
     * @return {Vec2} returns this
     */
    Vec2.prototype.negSelf = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * Negates the components, and returns the new result.
     * @method neg
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.neg = function (out) {
        out = out || new Vec2();
        out.x = -this.x;
        out.y = -this.y;
        return out;
    };

    /**
     * Dot product
     * @method dot
     * @param {Vec2} [vector]
     * @return {number} the result
     */
    Vec2.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    /**
     * Cross product
     * @method cross
     * @param {Vec2} [vector]
     * @return {number} the result
     */
    Vec2.prototype.cross = function (vector) {
        return this.y * vector.x - this.x * vector.y;
    };

    /**
     * Magnitude
     * @method mag
     * @return {number} the result
     */
    Vec2.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    /**
     * Magnitude Sqaure
     * @method magSqr
     * @return {number} the result
     */
    Vec2.prototype.magSqr = function () {
        return this.x * this.x + this.y * this.y;
    };

    /**
     * Normalize self
     * @method normalizeSelf
     * @return {Vec2} this
     */
    Vec2.prototype.normalizeSelf = function () {
        var magSqr = this.x * this.x + this.y * this.y;
        if ( magSqr === 1.0 )
            return this;

        if ( magSqr === 0.0 ) {
            console.warn( "Can't normalize zero vector" );
            return this;
        }

        var invsqrt = 1.0 / Math.sqrt(magSqr);
        this.x *= invsqrt;
        this.y *= invsqrt;

        return this;
    };

    /**
     * Get normalized vector
     * @method normalize
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} result
     */
    Vec2.prototype.normalize = function (out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        out.normalizeSelf();
        return out;
    };

    /**
     * Get angle between this and vector
     * @method angle
     * @param {Vec2} vector
     * @return {number} from 0 to Math.PI
     */
    Vec2.prototype.angle = function (vector) {
        var magSqr1 = this.magSqr();
        var magSqr2 = vector.magSqr();

        if ( magSqr1 === 0 || magSqr2 === 0 ) {
            console.warn( "Can't get angle between zero vector" );
            return 0.0;
        }

        var dot = this.dot(vector);
        var theta = dot / (Math.sqrt(magSqr1 * magSqr2));
        theta = Math.clamp( theta, -1.0, 1.0 );
        return Math.acos(theta);
    };

    /**
     * Get angle between this and vector with direction
     * @method signAngle
     * @param {Vec2} vector
     * @return {number} from -MathPI to Math.PI
     */
    Vec2.prototype.signAngle = function (vector) {
        // NOTE: this algorithm will return 0.0 without signed if vectors are parallex
        // var angle = this.angle(vector);
        // var cross = this.cross(vector);
        // return Math.sign(cross) * angle;

        return Math.atan2( this.y, this.x ) - Math.atan2( vector.y, vector.x );
    };

    /**
     * rotate
     * @method rotate
     * @param {number} radians
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.rotate = function (radians, out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        return out.rotateSelf(radians);
    };

    /**
     * rotate self
     * @method rotateSelf
     * @param {number} radians
     * @return {Vec2} this
     */
    Vec2.prototype.rotateSelf = function (radians) {
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        var x = this.x;
        this.x = cos * x - sin * this.y;
        this.y = sin * x + cos * this.y;
        return this;
    };

    return Vec2;
})();

/**
 * This is a property accessible from {% crosslink Fire Fire %} global object
 * @property Fire.Vec2
 * @type Vec2
 */
Fire.Vec2 = Vec2;

/**
 * The convenience method to create a new {% crosslink Vec2 Vec2 %}
 * @method Fire.v2
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @return {Vec2}
 */
Fire.v2 = function v2 (x, y) {
    if (Array.isArray(x)) {
        return new Vec2(x[0], x[1]);
    }
    else {
        return new Vec2(x, y);
    }
};

/**
 * Simple matrix to do 2D affine transformations.
 * It is actually 3x3 but the last row is [0 0 1].
 * @class Matrix23
 * @constructor
 */
var Matrix23 = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
};
JS.setClassName('Fire.Matrix23', Matrix23);
Fire.Matrix23 = Matrix23;

Matrix23.identity = new Matrix23();

Matrix23.prototype.clone = function () {
    var mat = new Matrix23();
    mat.a = this.a;
    mat.b = this.b;
    mat.c = this.c;
    mat.d = this.d;
    mat.tx = this.tx;
    mat.ty = this.ty;
    return mat;
};

Matrix23.prototype.set = function (other) {
    this.a = other.a;
    this.b = other.b;
    this.c = other.c;
    this.d = other.d;
    this.tx = other.tx;
    this.ty = other.ty;
};

Matrix23.prototype.equals = function (other) {
    return this.a === other.a &&
           this.b === other.b &&
           this.c === other.c &&
           this.d === other.d &&
           this.tx === other.tx &&
           this.ty === other.ty;
};

Matrix23.prototype.toString = function () {
    return '|' + this.a.toFixed(2) + ' ' + this.c.toFixed(2) + ' ' + this.tx.toFixed(2) +
        '|\n|' + this.b.toFixed(2) + ' ' + this.d.toFixed(2) + ' ' + this.ty.toFixed(2) +
        '|\n|0.00 0.00 1.00|';
};

Matrix23.prototype.identity = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

Matrix23.prototype.prepend = function (other) {
    var a = other.a;
    var b = other.b;
    var c = other.c;
    var d = other.d;
    if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
        var oa = this.a;
        var oc = this.c;
        this.a = oa * a + this.b * c;
        this.b = oa * b + this.b * d;
        this.c = oc * a + this.d * c;
        this.d = oc * b + this.d * d;
        var otx = this.tx;
        this.tx = otx * a + this.ty * c + other.tx;
        this.ty = otx * b + this.ty * d + other.ty;
    }
    else {
        this.tx += other.tx;
        this.ty += other.ty;
    }
    return this;
};

Matrix23.prototype.invert = function () {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var tx = this.tx;
    var determinant = 1 / (a * d - b * c);
    this.a = d * determinant;
    this.b = -b * determinant;
    this.c = -c * determinant;
    this.d = a * determinant;
    this.tx = (c * this.ty - d * tx) * determinant;
    this.ty = (b * tx - a * this.ty) * determinant;
    return this;
};

Matrix23.prototype.transformPoint = function (vector, out) {
    out = out || new Vec2();
    var x = vector.x;   // vector may === out
    out.x = this.a * x + this.c * vector.y + this.tx;
    out.y = this.b * x + this.d * vector.y + this.ty;
    return out;
};

//Matrix23.prototype.transformPointXY = function (x, y, out) {
//    out = out || new Vec2();
//    out.x = this.a * x + this.c * y + this.tx;
//    out.y = this.b * x + this.d * y + this.ty;
//    return out;
//};

// negative scaling (mirroring) is not supported
Matrix23.prototype.getScale = function (out) {
    out = out || new Vec2();
    out.x = Math.sqrt(this.a * this.a + this.b * this.b);
    out.y = Math.sqrt(this.c * this.c + this.d * this.d);
    return out;
};

Matrix23.prototype.setScale = function (scale) {
    var s = this.getScale();
    var x = scale.x / s.x;
    var y = scale.y / s.y;
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
};

Matrix23.prototype.getRotation = function () {
    var hasSkew = this.b / this.a !== -this.c / this.d;
    if ( !hasSkew ) {
        return Math.atan2(-this.c, this.d);
    }
    else {
        return (Math.atan2(this.b, this.a) + Math.atan2(-this.c, this.d)) * 0.5;
    }
};

Matrix23.prototype.getTranslation = function (out) {
    out = out || new Vec2();
    out.x = this.tx;
    out.y = this.ty;
    return out;
};

// rotate counterclockwise
Matrix23.prototype.rotate = function (radians) {
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    var a = this.a;
    var b = this.b;
    this.a = (a * cos + this.c * sin);
    this.b = (b * cos + this.d * sin);
    this.c = (this.c * cos - a * sin);
    this.d = (this.d * cos - b * sin);
    return this;
};

/*
Matrix23.prototype.translate = function (x, y) {
    this.tx += x;
    this.ty += y;
};

Matrix23.prototype.scale = function (x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
};
*/

var Rect = (function () {
    /**
     * @class Rect
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    function Rect( x, y, w, h ) {
        this.x = typeof x === 'number' ? x : 0.0;
        this.y = typeof y === 'number' ? y : 0.0;
        this.width = typeof w === 'number' ? w : 0.0;
        this.height = typeof h === 'number' ? h : 0.0;
    }
    JS.setClassName('Fire.Rect', Rect);

    /**
     * @method fromMinMax
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @return {Rect}
     */
    Rect.fromMinMax = function ( v1, v2 ) {
        var min_x = Math.min( v1.x, v2.x );
        var min_y = Math.min( v1.y, v2.y );
        var max_x = Math.max( v1.x, v2.x );
        var max_y = Math.max( v1.y, v2.y );

        return new Rect ( min_x, min_y, max_x - min_x, max_y - min_y );
    };

    /**
     * @method fromVec2
     * @param {Vec2} leftTop
     * @param {Vec2} size
     * @return {Rect}
     */
    Rect.fromVec2 = function ( leftTop, size ) {
        return new Rect ( leftTop.x, leftTop.y, size.x, size.y );
    };

    /**
     * Check if rect contains
     * @method contain
     * @param a {Rect} Rect a
     * @param b {Rect} Rect b
     * @return {Number} The contains result, 1 is a contains b, -1 is b contains a, 0 is no contains
     */
    Rect.contain = function _Contain ( a, b ) {
        if ( a.x <= b.x &&
             a.x + a.width >= b.x + b.width &&
             a.y <= b.y &&
             a.y + a.height >= b.y + b.height )
        {
            // a contains b
            return 1;
        }
        if ( b.x <= a.x &&
             b.x + b.width >= a.x + a.width &&
             b.y <= a.y &&
             b.y + b.height >= a.y + a.height )
        {
            // b contains a
            return -1;
        }
        return 0;
    };

    Rect.prototype.clone = function () {
        return new Rect(this.x, this.y, this.width, this.height);
    };

    Rect.prototype.equals = function (other) {
        return this.x === other.x &&
               this.y === other.y &&
               this.width === other.width &&
               this.height === other.height;
    };

    Rect.prototype.toString = function () {
        return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ', ' + this.width.toFixed(2) +
               ', ' + this.height.toFixed(2) + ')';
    };

    Object.defineProperty(Rect.prototype, 'xMax', {
        get: function () { return this.x + this.width; }
    });

    Object.defineProperty(Rect.prototype, 'yMax', {
        get: function () { return this.y + this.height; }
    });

    Object.defineProperty(Rect.prototype, 'center', {
        get: function () {
            return new Fire.Vec2( this.x + this.width * 0.5,
                                  this.y + this.height * 0.5 );
        }
    });

    Rect.prototype.intersects = function ( rect ) {
        return Fire.Intersection.rectRect( this, rect );
    };

    Rect.prototype.contains = function ( point ) {
        if ( this.x <= point.x &&
             this.x + this.width >= point.x &&
             this.y <= point.y &&
             this.y + this.height >= point.y )
        {
            return true;
        }
        return false;
    };

    Rect.prototype.containsRect = function ( rect ) {
        if ( this.x <= rect.x &&
             this.x + this.width >= rect.x + rect.width &&
             this.y <= rect.y &&
             this.y + this.height >= rect.y + rect.height )
        {
            return true;
        }
        return false;
    };

    return Rect;
})();

Fire.Rect = Rect;

/**
 * The convenience method to create a new Rect
 * @method Fire.rect
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [w=0]
 * @param {number} [h=0]
 * @return {Rect}
 */
Fire.rect = function rect (x, y, w, h) {
    if (Array.isArray(x)) {
        return new Rect(x[0], x[1], x[2], x[3]);
    }
    else {
        return new Rect(x, y, w, h);
    }
};

Fire.Polygon = (function () {
    function Polygon( points ) {
        this.points = points;

        if ( this.points.length < 3 ) {
            console.warn( "Invalid polygon, the data must contains 3 or more points." );
        }
    }
    JS.setClassName('Fire.Polygon', Polygon);

    Polygon.prototype.intersects = function ( polygon ) {
        return Intersection.polygonPolygon( this, polygon );
    };

    Polygon.prototype.contains = function ( point ) {
        var inside = false;
        var x = point.x;
        var y = point.y;

        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        var length = this.points.length;

        for ( var i = 0, j = length-1; i < length; j = i++ ) {
            var xi = this.points[i].x, yi = this.points[i].y,
                xj = this.points[j].x, yj = this.points[j].y,
                intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if ( intersect ) inside = !inside;
        }

        return inside;
    };

    Object.defineProperty(Polygon.prototype, 'center', {
        get: function () {
            if ( this.points.length < 3 )
                return null;

            var min_x = this.points[0].x;
            var min_y = this.points[0].y;
            var max_x = this.points[0].x;
            var max_y = this.points[0].y;

            for ( var i = 1; i < this.points.length; ++i ) {
                var x = this.points[i].x;
                var y = this.points[i].y;

                if ( x < min_x )
                    min_x = x;
                else if ( x > max_x )
                    max_x = x;

                if ( y < min_y )
                    min_y = y;
                else if ( y > max_y )
                    max_y = y;
            }

            return new Fire.Vec2( (max_x + min_x) * 0.5,
                                  (max_y + min_y) * 0.5 );
        }
    });

    return Polygon;
})();


var Color = (function () {

    var DefaultColors = {
        // color: [r, g, b, a]
        white:      [1, 1, 1, 1],
        black:      [0, 0, 0, 1],
        transparent:[0, 0, 0, 0],
        gray:       [0.5, 0.5, 0.5],
        red:        [1, 0, 0],
        green:      [0, 1, 0],
        blue:       [0, 0, 1],
        yellow:     [1, 235/255, 4/255],
        cyan:       [0, 1, 1],
        magenta:    [1, 0, 1]
    };

    /**
     * A class represents RGBA color
     * @class Color
     * @constructor
     * @param {number} r - red component of the color
     * @param {number} g - green component of the color
     * @param {number} b - blue component of the color
     * @param {number} a - alpha component of the color
     */
    function Color( r, g, b, a ) {
        this.r = typeof r === 'number' ? r : 0.0;
        this.g = typeof g === 'number' ? g : 0.0;
        this.b = typeof b === 'number' ? b : 0.0;
        this.a = typeof a === 'number' ? a : 1.0;
    }
    JS.setClassName('Fire.Color', Color);

    for (var colorName in DefaultColors) {
        var colorGetter = (function (r, g, b, a) {
            return function () {
                return new Color(r, g, b, a);
            };
        }).apply(null, DefaultColors[colorName]);
        Object.defineProperty(Color, colorName, { get: colorGetter });
    }

    /**
     * Clone a new color from the current color.
     * @method clone
     * @return {Color} Newly created color.
     */
    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b, this.a);
    };

    Color.prototype.equals = function (other) {
        return this.r === other.r &&
               this.g === other.g &&
               this.b === other.b &&
               this.a === other.a;
    };

    Color.prototype.toString = function () {
        return "rgba(" +
            this.r.toFixed(2) + ", " +
            this.g.toFixed(2) + ", " +
            this.b.toFixed(2) + ", " +
            this.a.toFixed(2) + ")"
        ;
    };

    Color.prototype.toCSS = function ( opt ) {
        if ( opt === 'rgba' ) {
            return "rgba(" +
                (this.r * 255 | 0 ) + "," +
                (this.g * 255 | 0 ) + "," +
                (this.b * 255 | 0 ) + "," +
                this.a.toFixed(2) + ")"
            ;
        }
        else if ( opt === 'rgb' ) {
            return "rgb(" +
                (this.r * 255 | 0 ) + "," +
                (this.g * 255 | 0 ) + "," +
                (this.b * 255 | 0 ) + ")"
            ;
        }
        else {
            return '#' + this.toHEX(opt);
        }
    };

    Color.prototype.equalTo = function ( rhs ) {
        return (rhs instanceof Color &&
                this.r === rhs.r &&
                this.g === rhs.g &&
                this.b === rhs.b &&
                this.a === rhs.a);
    };

    Color.prototype.clamp = function () {
        this.r = Math.clamp01(this.r);
        this.g = Math.clamp01(this.g);
        this.b = Math.clamp01(this.b);
        this.a = Math.clamp01(this.a);
    };

    Color.prototype.fromHEX = function (hexString) {
        var hex = parseInt(((hexString.indexOf('#') > -1) ? hexString.substring(1) : hexString), 16);
        this.r = hex >> 16;
        this.g = (hex & 0x00FF00) >> 8;
        this.b = (hex & 0x0000FF);
        return this;
    };

    Color.prototype.toHEX = function ( fmt ) {
        var hex = [
            (this.r * 255 | 0 ).toString(16),
            (this.g * 255 | 0 ).toString(16),
            (this.b * 255 | 0 ).toString(16),
        ];
        var i = -1;
        if ( fmt === '#rgb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length > 1 ) {
                    hex[i] = hex[i][0];
                }
            }
        }
        else if ( fmt === '#rrggbb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length === 1 ) {
                    hex[i] = '0' + hex[i];
                }
            }
        }
        return hex.join('');
    };

    Color.prototype.toRGBValue = function () {
        return (Math.clamp01(this.r) * 255 << 16) +
               (Math.clamp01(this.g) * 255 << 8) +
               (Math.clamp01(this.b) * 255);
    };

    Color.prototype.fromHSV = function ( h, s, v ) {
        var rgb = Fire.hsv2rgb( h, s, v );
        this.r = rgb.r;
        this.g = rgb.g;
        this.b = rgb.b;
        return this;
    };

    Color.prototype.toHSV = function () {
        return Fire.rgb2hsv( this.r, this.g, this.b );
    };

    return Color;
})();

Fire.Color = Color;

/**
 * The convenience method to create a new <% crosslink Fire.Color Color %>
 * @method color
 * @param {number} [r=0]
 * @param {number} [g=0]
 * @param {number} [b=0]
 * @param {number} [a=1]
 * @return {Color}
 */
Fire.color = function color (r, g, b, a) {
    if (Array.isArray(r)) {
        return new Color(r[0], r[1], r[2], r[3]);
    }
    else {
        return new Color(r, g, b, a);
    }
};


var _Deserializer = (function () {
    /**
     * @param {boolean} isEditor - if false, property with Fire.EditorOnly will be discarded
     */
    function _Deserializer(jsonObj, result, target, isEditor, classFinder) {
        this._editor = isEditor;
        this._classFinder = classFinder;
        this._idList = [];
        this._idObjList = [];
        this._idPropList = [];
        this.result = result || new Fire._DeserializeInfo();

        if (Array.isArray(jsonObj)) {
            var jsonArray = jsonObj;
            var refCount = jsonArray.length;
            this.deserializedList = new Array(refCount);
            // deserialize
            for (var i = 0; i < refCount; i++) {
                if (jsonArray[i]) {
                    var mainTarget;
                    this.deserializedList[i] = _deserializeObject(this, jsonArray[i], mainTarget);
                }
            }
            this.deserializedData = refCount > 0 ? this.deserializedList[0] : [];

            //// callback
            //for (var j = 0; j < refCount; j++) {
            //    if (referencedList[j].onAfterDeserialize) {
            //        referencedList[j].onAfterDeserialize();
            //    }
            //}
        }
        else {
            this.deserializedList = [null];
            this.deserializedData = jsonObj ? _deserializeObject(this, jsonObj, target) : null;
            this.deserializedList[0] = this.deserializedData;

            //// callback
            //if (deserializedData.onAfterDeserialize) {
            //    deserializedData.onAfterDeserialize();
            //}
        }

        // dereference
        _dereference(this);
    }

    var _dereference = function (self) {
        // 这里不采用遍历反序列化结果的方式，因为反序列化的结果如果引用到复杂的外部库，很容易堆栈溢出。
        var deserializedList = self.deserializedList;
        for (var i = 0, len = self._idList.length; i < len; i++) {
            var propName = self._idPropList[i];
            var id = self._idList[i];
            self._idObjList[i][propName] = deserializedList[id];
        }
    };

    // 和 _deserializeObject 不同的地方在于会判断 id 和 uuid
    function _deserializeObjField (self, obj, jsonObj, propName, target) {
        var id = jsonObj.__id__;
        if (typeof id === 'undefined') {
            var uuid = jsonObj.__uuid__;
            if (uuid) {
                self.result.uuidList.push(uuid);
                self.result.uuidObjList.push(obj);
                self.result.uuidPropList.push(propName);
            }
            else {
                obj[propName] = _deserializeObject(self, jsonObj);
            }
        }
        else {
            var dObj = self.deserializedList[id];
            if (dObj) {
                obj[propName] = dObj;
            }
            else {
                self._idList.push(id);
                self._idObjList.push(obj);
                self._idPropList.push(propName);
            }
        }
    }

    function _deserializePrimitiveObject (self, instance, serialized) {
        for (var propName in serialized) {
            if (serialized.hasOwnProperty(propName)) {
                var prop = serialized[propName];
                if (typeof prop !== 'object') {
                    if (propName !== '__type__'/* && k != '__id__'*/) {
                        instance[propName] = prop;
                    }
                }
                else {
                    if (prop) {
                        if ( !prop.__uuid__ && typeof prop.__id__ === 'undefined' ) {
                            instance[propName] = _deserializeObject(self, prop);
                        }
                        else {
                            _deserializeObjField(self, instance, prop, propName);
                        }
                    }
                    else {
                        instance[propName] = null;
                    }
                }
            }
        }
    }

    function _deserializeTypedObject (self, instance, serialized) {
        //++self.stackCounter;
        //if (self.stackCounter === 100) {
        //    debugger;
        //}
        for (var propName in instance) {    // 遍历 instance，如果具有类型，才不会把 __type__ 也读进来
            var prop = serialized[propName];
            if (typeof prop !== 'undefined' && serialized.hasOwnProperty(propName)) {
                if (typeof prop !== 'object') {
                    instance[propName] = prop;
                }
                else {
                    if (prop) {
                        if ( !prop.__uuid__ && typeof prop.__id__ === 'undefined' ) {
                            instance[propName] = _deserializeObject(self, prop);
                        }
                        else {
                            _deserializeObjField(self, instance, prop, propName);
                        }
                    }
                    else {
                        instance[propName] = null;
                    }
                }
            }
        }
        //--self.stackCounter;
    }

    function _deserializeFireClass(self, obj, serialized, klass, target) {
        var props = klass.__props__;
        if (!props) {
            return;
        }
        for (var p = 0; p < props.length; p++) {
            var propName = props[p];
            var attrs = Fire.attr(klass, propName);
            // assume all prop in __props__ must have attr
            var rawType = attrs.rawType;
            if (!rawType) {
                if (attrs.serializable === false) {
                    continue;   // skip nonSerialized
                }
                if (!self._editor && attrs.editorOnly) {
                    continue;   // skip editor only if not editor
                }
                var prop = serialized[propName];
                if (typeof prop !== 'undefined') {
                    if (typeof prop !== 'object') {
                        obj[propName] = prop;
                    }
                    else {
                        if (prop) {
                            if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                                obj[propName] = _deserializeObject(self, prop);
                            }
                            else {
                                _deserializeObjField(self, obj, prop, propName);
                            }
                        }
                        else {
                            obj[propName] = null;
                        }
                    }
                }
            }
            else {
                // always load raw objects even if property not serialized
                if (self.result.rawProp) {
                    Fire.error('not support multi raw object in a file');
                    // 这里假定每个asset都有uuid，每个json只能包含一个asset，只能包含一个rawProp
                }
                self.result.rawProp = propName;
            }
        }
        if (props[props.length - 1] === '_$erialized') {
            // save original serialized data
            obj._$erialized = serialized;
            // parse the serialized data as primitive javascript object, so its __id__ will be dereferenced
            _deserializePrimitiveObject(self, obj._$erialized, serialized);
        }
    }

    /**
     * @param {object} serialized - The obj to deserialize, must be non-nil
     * @param {object} [target=null]
     */
    var _deserializeObject = function (self, serialized, target) {
        var propName, prop;
        var obj = null;     // the obj to return
        var klass = null;
        if (serialized.__type__) {

            // Type Object (including FireClass)

            klass = self._classFinder(serialized.__type__);
            if (!klass) {
                Fire.error('[Fire.deserialize] unknown type: ' + serialized.__type__);
                return null;
            }
            // instantiate a new object
            obj = new klass();
            if ( Fire._isFireClass(klass) ) {
                _deserializeFireClass(self, obj, serialized, klass, target);
            }
            else {
                _deserializeTypedObject(self, obj, serialized);
            }
        }
        else if ( !Array.isArray(serialized) ) {

            // embedded primitive javascript object

            obj = {};
            _deserializePrimitiveObject(self, obj, serialized);
        }
        else {

            // Array

            obj = new Array(serialized.length);
            for (var i = 0; i < serialized.length; i++) {
                prop = serialized[i];
                if (typeof prop === 'object' && prop) {
                    if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                        obj[i] = _deserializeObject(self, prop);
                    }
                    else {
                        _deserializeObjField(self, obj, prop, '' + i);
                    }
                }
                else {
                    obj[i] = prop;
                }
            }
        }
        return obj;
    };

    return _Deserializer;
})();

/**
 * Deserialize json to Fire.Asset
 * 当指定了 target 选项时，如果 target 引用的其它 asset 的 uuid 不变，则不会改变 target 对 asset 的引用，
 * 也不会将 uuid 保存到 result 对象中。
 *
 * @param {(string|object)} data - the serialized Fire.Asset json string or json object.
 *                                 Note: If data is an object, it will be modified.
 * @param {Fire._DeserializeInfo} [result] - additional loading result
 * @param {object} [options=null]
 * @return {object} the main data(asset)
 */
Fire.deserialize = function (data, result, options) {
    var isEditor = (options && 'isEditor' in options) ? options.isEditor : Fire.isEditor;
    var classFinder = (options && options.classFinder) || JS._getClassById;
    var createAssetRefs = (options && options.createAssetRefs) || Fire.isEditorCore;
    var target;
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    if (createAssetRefs && !result) {
        result = new Fire._DeserializeInfo();
    }

    Fire._isCloning = true;
    var deserializer = new _Deserializer(data, result, target, isEditor, classFinder);
    Fire._isCloning = false;

    if (createAssetRefs) {
        result.assignAssetsBy(Fire.serialize.asAsset);
    }

    return deserializer.deserializedData;
};

/**
 * 包含反序列化时的一些信息
 * @class Fire._DeserializeInfo
 */
Fire._DeserializeInfo = function () {

    //this.urlList = [];
    //this.callbackList = [];

    // uuids(assets) need to load

    /**
     * @property {string[]} uuidList - list of the depends assets' uuid
     */
    this.uuidList = [];
    /**
     * @property {object[]} uuidObjList - the obj list whose field needs to load asset by uuid
     */
    this.uuidObjList = [];
    /**
     * @property {string[]} uuidPropList - the corresponding field name which referenced to the asset
     */
    this.uuidPropList = [];

    // raw objects need to load
    // (不用存rawList因为它的uuid可以从asset上获得)

    /**
     * @property {string} rawProp - the corresponding field name which referenced to the raw object
     */
    this.rawProp = '';
    ///**
    // * @property {Fire.Asset[]} rawObjList - the obj list whose corresponding raw object needs to load
    // */
    //this.rawObjList = [];
    ///**
    // * @property {string[]} rawPropList - the corresponding field name which referenced to the raw object
    // */
    //this.rawPropList = [];
};

Fire._DeserializeInfo.prototype.reset = function () {
    this.uuidList.length = 0;
    this.uuidObjList.length = 0;
    this.uuidPropList.length = 0;
    this.rawProp = '';
    //this.rawObjList.length = 0;
    //this.rawPropList.length = 0;
};

Fire._DeserializeInfo.prototype.getUuidOf = function (obj, propName) {
    for (var i = 0; i < this.uuidObjList.length; i++) {
        if (this.uuidObjList[i] === obj && this.uuidPropList[i] === propName) {
            return this.uuidList[i];
        }
    }
    return "";
};

Fire._DeserializeInfo.prototype.assignAssetsBy = function (callback) {
    var success = true;
    for (var i = 0, len = this.uuidList.length; i < len; i++) {
        var uuid = this.uuidList[i];
        var asset = callback(uuid);
        if (asset) {
            var obj = this.uuidObjList[i];
            var prop = this.uuidPropList[i];
            obj[prop] = asset;
        }
        else {
            Fire.error('Failed to assign asset: ' + uuid);
            success = false;
        }
    }
    return success;
};

/**
 * Instantiate 时，对于不可序列化的字段(包含function和dom)，直接设为 null。
 * 对可以被序列化的字段则统一进行拷贝，不考虑引用是否该和现有场景共享，但能保证实例化后的对象间能共享一份引用。
 * 对于 Asset 永远只拷贝引用。对于 Entity / Component 等 Scene Object，如果对方也会被一起 Instantiate，则重定向到新的引用，否则设置为原来的引用。
 *
 * 另规定：B和C均由A实例化而来，则BC相等。A实例化出B，B再实例化出C的话，则BC相等。
 */

/**
 * @param {object} original
 */
Fire.instantiate = function (original) {
    if (typeof original !== 'object' || Array.isArray(original)) {
        Fire.error('The thing you want to instantiate must be an object');
        return null;
    }
    if (!original) {
        Fire.error('The thing you want to instantiate is nil');
        return null;
    }
    if (original instanceof Fire.FObject && !original.isValid) {
        Fire.error('The thing you want to instantiate is destroyed');
        return null;
    }
    var clone;
    // invoke _instantiate method if supplied
    if (original._instantiate) {
        Fire._isCloning = true;
        clone = original._instantiate();
        Fire._isCloning = false;
        return clone;
    }
    else if (original instanceof Fire.Asset) {
        // 不使用通用的方法实例化资源
        Fire.error('The instantiate method for given asset do not implemented');
        return null;
    }
    //
    Fire._isCloning = true;
    clone = Fire._doInstantiate(original);
    Fire._isCloning = false;
    return clone;
};

Fire._doInstantiate = (function () {

    var objsToClearTmpVar = [];   // 用于重设临时变量

    /**
     * Do instantiate object, the object to instantiate must be non-nil.
     * 这是一个实例化的通用方法，可能效率比较低。
     * 之后可以给各种类型重载快速实例化的特殊实现，但应该在单元测试中将结果和这个方法的结果进行对比。
     * 值得注意的是，这个方法不可重入。
     *
     * @param {object} obj - 该方法仅供内部使用，用户需负责保证参数合法。什么参数是合法的请参考 Fire.instantiate().
     * @return {object}
     * @private
     */
    function doInstantiate (obj) {
        if (Array.isArray(obj)) {
            Fire.error('Can not instantiate array');
            return null;
        }
        if (_isDomNode(obj)) {
            Fire.error('Can not instantiate DOM element');
            return null;
        }

        var clone = enumerateObject(obj);

        for (var i = 0, len = objsToClearTmpVar.length; i < len; ++i) {
            objsToClearTmpVar[i]._iN$t = null;
        }
        objsToClearTmpVar.length = 0;

        return clone;
    }

    /**
     * @param {object} obj - The object to instantiate, typeof mustbe 'object' and should not be an array.
     * @return {object} - the instantiated instance
     */
    var enumerateObject = function (obj) {
        var value, type;
        var klass = obj.constructor;
        var clone = new klass();
        obj._iN$t = clone;
        objsToClearTmpVar.push(obj);
        if (Fire._isFireClass(klass)) {
            // only __props__ will be serialized
            var props = klass.__props__;
            if (props) {
                for (var p = 0; p < props.length; p++) {
                    var propName = props[p];
                    var attrs = Fire.attr(klass, propName);
                    // assume all prop in __props__ must have attr

                    if (attrs.serializable !== false) {
                        value = obj[propName];
                        // instantiate field
                        type = typeof value;
                        clone[propName] = (type === 'object') ?
                                            (value ? instantiateObj(value) : value) :
                                            ((type !== 'function') ? value : null);
                    }
                }
            }
        }
        else {
            // primitive javascript object
            for (var key in obj) {
                //Fire.log(key);
                if (obj.hasOwnProperty(key) === false || (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95)) {  // starts with __
                    continue;
                }
                value = obj[key];
                if (value === clone) {
                    continue;   // value is obj._iN$t
                }
                // instantiate field
                type = typeof value;
                clone[key] = (type === 'object') ?
                                (value ? instantiateObj(value) : value) :
                                ((type !== 'function') ? value : null);
            }
        }
        if (obj instanceof FObject) {
            clone._objFlags &= PersistentMask;
        }
        return clone;
    };

    /**
     * @return {object} - the original non-nil object, typeof must be 'object'
     */
    function instantiateObj (obj) {
        // 目前使用“_iN$t”这个特殊字段来存实例化后的对象，这样做主要是为了防止循环引用
        // 注意，为了避免循环引用，所有新创建的实例，必须在赋值前被设为源对象的_iN$t
        var clone = obj._iN$t;
        if (clone) {
            // has been instantiated
            return clone;
        }

        if (obj instanceof Asset) {
            // 所有资源直接引用，不进行拷贝
            return obj;
        }
        else if (Array.isArray(obj)) {
            var len = obj.length;
            clone = new Array(len);
            obj._iN$t = clone;
            for (var i = 0; i < len; ++i) {
                var value = obj[i];
                // instantiate field
                var type = typeof value;
                clone[i] = (type === 'object') ?
                                (value ? instantiateObj(value) : value) :
                                ((type !== 'function') ? value : null);
            }
            objsToClearTmpVar.push(obj);
            return clone;
        }
        else if (!_isDomNode(obj)) {
            // instantiate common object
            return enumerateObject(obj);
        }
        else {
            // dom
            return null;
        }
    }

    return doInstantiate;

})();

/**
 * @property {boolean} Fire._isCloning
 */
Fire._isCloning = false;

var Asset = (function () {

    var Asset = Fire.extend('Fire.Asset', Fire.HashObject, function () {
        // define uuid, uuid can not destroy
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destroy,
                                // so the _uuid can not display in console.
        });

        this.dirty = false;
    });

    Asset.prototype._setRawExtname = function (extname) {
        if (this.hasOwnProperty('_rawext')) {
            if (extname.charAt(0) === '.') {
                extname = extname.substring(1);
            }
            this._rawext = extname;
        }
        else {
            Fire.error('Have not defined any RawTypes yet, no need to set raw file\'s extname.');
        }
    };

    return Asset;
})();

Fire.Asset = Asset;

var CustomAsset = (function () {

    var CustomAsset = Fire.extend('Fire.CustomAsset', Fire.Asset);

    return CustomAsset;
})();

Fire.CustomAsset = CustomAsset;

/**
 * Register a Custom Asset to the "Asset" menu.
 * @param {function} constructor - the class you want to register, must inherit from Custom Asset
 * @param {string} menuPath - the menu path name. Eg. "Rendering/Camera"
 * @param {number} [priority] - the order which the menu item are displayed
 */
Fire.addCustomAssetMenu = Fire.addCustomAssetMenu || function (constructor, menuPath, priority) {
    // implement only available in editor
};

Fire.ScriptAsset = (function () {
    var ScriptAsset = Fire.extend("Fire.ScriptAsset", Fire.Asset);

    ScriptAsset.prop( 'text', '',
                      Fire.MultiText,
                      Fire.RawType('text'),
                      Fire.HideInInspector
                    );

    return ScriptAsset;
})();

Fire.Texture = (function () {

    /**
     * @param {Image} [img] - the html image element to render
     */
    var Texture = Fire.extend('Fire.Texture', Fire.Asset, function () {
        var img = arguments[0];
        if (img) {
            this.image = img;
            this.width = img.width;
            this.height = img.height;
        }
    });

    // enum WrapMode
    Texture.WrapMode = Fire.defineEnum({
        Repeat: -1,
        Clamp: -1
    });

    // enum FilterMode
    Texture.FilterMode = Fire.defineEnum({
        Point: -1,
        Bilinear: -1,
        Trilinear: -1
    });

    Texture.prop('image', null, Fire.RawType('image'), Fire.HideInInspector);
    Texture.prop('width', 0, Fire.Integer, Fire.ReadOnly);
    Texture.prop('height', 0, Fire.Integer, Fire.ReadOnly);
    Texture.prop('wrapMode', Texture.WrapMode.Clamp, Fire.Enum(Texture.WrapMode), Fire.ReadOnly);
    Texture.prop('filterMode', Texture.FilterMode.Bilinear, Fire.Enum(Texture.FilterMode), Fire.ReadOnly);

    //Texture.prototype.onAfterDeserialize = function () {
    //    this.width = this.image.width;
    //    this.height = this.image.height;
    //};

    return Texture;
})();

Fire.Sprite = (function () {

    /**
     * @param {Image} [img] - Specify the html image element to render so you can create Sprite dynamically.
     */
    var Sprite = Fire.extend('Fire.Sprite', Fire.Asset, function () {
        var img = arguments[0];
        if (img) {
            this.texture = new Fire.Texture(img);
            this.width = img.width;
            this.height = img.height;
        }
    });

    //
    Sprite.prop('pivot', new Fire.Vec2(0.5, 0.5), Fire.Tooltip('The pivot is normalized, like a percentage.\n' +
                                                               '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                                                               'But you can use values higher than (1,1) and lower than (0,0) too.'));

    // trim info
    Sprite.prop('trimX', 0, Fire.Integer);
    Sprite.prop('trimY', 0, Fire.Integer);
    Sprite.prop('width', 0, Fire.Integer);
    Sprite.prop('height', 0, Fire.Integer);

    //
    Sprite.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);
    Sprite.prop('rotated', false, Fire.HideInInspector);

    // raw texture info (used for texture-offset calculation)
    Sprite.prop('x', 0, Fire.Integer, Fire.HideInInspector); // uv of the sprite in atlas-texture
    Sprite.prop('y', 0, Fire.Integer, Fire.HideInInspector); // uv of the sprite in atlas-texture
    Sprite.prop('rawWidth', 0, Fire.Integer, Fire.HideInInspector);
    Sprite.prop('rawHeight', 0, Fire.Integer, Fire.HideInInspector);

    Object.defineProperty(Sprite.prototype, 'rotatedWidth', {
        get: function () { return this.rotated ? this.height : this.width; }
    });

    Object.defineProperty(Sprite.prototype, 'rotatedHeight', {
        get: function () { return this.rotated ? this.width : this.height; }
    });

    return Sprite;
})();

Fire.Atlas = (function () {

    var Atlas = Fire.extend("Fire.Atlas", Fire.Asset);

    // enum Algorithm
    Atlas.Algorithm = Fire.defineEnum({
        Basic: -1,
        Tree: -1,
        MaxRect: -1
    });

    // enum SortBy
    Atlas.SortBy = Fire.defineEnum({
        UseBest: -1,
        Width: -1,
        Height: -1,
        Area: -1,
        Name: -1
    });

    // enum SortOrder
    Atlas.SortOrder = Fire.defineEnum({
        UseBest: -1,
        Ascending: -1,
        Descending: -1
    });

    // basic settings
    Atlas.prop('width', 512, Fire.Integer, Fire.ReadOnly );
    Atlas.prop('height', 512, Fire.Integer, Fire.ReadOnly );

    Atlas.prop('sprites', [], Fire.ObjectType(Fire.Sprite), Fire.HideInInspector);

    //
    Atlas.prototype.add = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sp = this.sprites[i];
            if ( sp._uuid === sprite._uuid ) {
                return false;
            }
        }

        this.sprites.push(sprite);
        return true;
    };

    // remove sprite
    Atlas.prototype.remove = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sp = this.sprites[i];
            if ( sp._uuid === sprite._uuid ) {
                this.sprites.splice(i,1);
                return true;
            }
        }

        return false;
    };

    // clear all sprites
    Atlas.prototype.clear = function () {
        this.sprites = [];
    };

    Atlas.prototype.layout = function ( opts ) {
        if ( opts.algorithm === undefined )
            opts.algorithm = Fire.Atlas.Algorithm.MaxRect;

        if ( opts.sortBy === undefined )
            opts.sortBy = Fire.Atlas.SortBy.UseBest;

        if ( opts.sortOrder === undefined )
            opts.sortOrder = Fire.Atlas.SortOrder.UseBest;

        if ( opts.allowRotate === undefined )
            opts.allowRotate = true;

        if ( opts.autoSize === undefined )
            opts.autoSize = true;

        if ( opts.padding === undefined )
            opts.padding = 2;

        Fire.AtlasUtils.sort( this, opts.algorithm, opts.sortBy, opts.sortOrder, opts.allowRotate );
        Fire.AtlasUtils.layout( this, opts.algorithm, opts.autoSize, opts.padding, opts.allowRotate );
    };

    return Atlas;
})();

var AtlasUtils = {};

// ==================
// AtlasUtils.layout
// ==================

var _basicLayout = function (atlas, padding) {
    var curX = 0;
    var curY = 0;
    var maxY = 0;

    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        if ( curX + sprite.rotatedWidth > atlas.width ) {
            curX = 0;
            curY = curY + maxY + padding;
            maxY = 0;
        }
        if ( curY + sprite.rotatedHeight > atlas.height ) {
            throw new Error("Warning: Failed to layout element " + sprite.name);
        }
        sprite.x = curX;
        sprite.y = curY;

        curX = curX + sprite.rotatedWidth + padding;
        if ( sprite.rotatedHeight > maxY ) {
            maxY = sprite.rotatedHeight;
        }
    }
};

//
var _insertNode = function ( node, sprite, padding, allowRotate ) {
    // when this node is already occupied (when it has children),
    // forward to child nodes recursively
    if ( node.right !== null ) {
        var pos = _insertNode( node.right, sprite, padding, allowRotate );
        if ( pos !== null )
            return pos;
        return _insertNode( node.bottom, sprite, padding, allowRotate );
    }

    // determine trimmed and padded sizes
    var elWidth = sprite.rotatedWidth;
    var elHeight = sprite.rotatedHeight;
    var paddedWidth = elWidth + padding;
    var paddedHeight = elHeight + padding;
    var rect = node.rect;

    // trimmed element size must fit within current node rect
    if ( elWidth > rect.width || elHeight > rect.height ) {

        if ( allowRotate === false )
            return null;

        if ( elHeight > rect.width || elWidth > rect.height ) {
            return null;
        }
        else {
            sprite.rotated = !sprite.rotated;
            elWidth = sprite.rotatedWidth;
            elHeight = sprite.rotatedHeight;
            paddedWidth = elWidth + padding;
            paddedHeight = elHeight + padding;
        }
    }

    // create first child node in remaining space to the right, using elHeight
    // so that only other elements with the same height or less can be added there
    // (we do not use paddedHeight, because the padding area is reserved and should
    // never be occupied)
    node.right = {
        rect: new Fire.Rect (
            rect.x + paddedWidth,
            rect.y,
            rect.width - paddedWidth,
            elHeight
        ),
        right: null,
        bottom: null,
    };

    // create second child node in remaining space at the bottom, occupying the entire width
    node.bottom = {
        rect: new Fire.Rect (
            rect.x,
            rect.y + paddedHeight,
            rect.width,
            rect.height - paddedHeight
        ),
        right: null,
        bottom: null,
    };

    // return position where to put element
    return [ rect.x, rect.y ];
};
var _treeLayout = function (atlas, padding, allowRotate ) {
    var root = {
        rect: new Fire.Rect(
            0,
            0,
            atlas.width,
            atlas.height ),
        right: null,
        bottom: null,
    };
    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        var pos = _insertNode ( root, sprite, padding, allowRotate );
        if ( pos !== null ) {
            sprite.x = pos[0];
            sprite.y = pos[1];
        }
        else {
            // log warning but continue processing other elements
            throw new Error("Warning: Failed to layout element " + sprite.name);
        }
    }
};

var _splitFreeNode = function ( freeRects, freeNode, usedNode ) {
    // Test with SAT if the rectangles even intersect.
    if ( usedNode.x >= freeNode.x + freeNode.width || usedNode.x + usedNode.width <= freeNode.x ||
         usedNode.y >= freeNode.y + freeNode.height || usedNode.y + usedNode.height <= freeNode.y )
        return false;

    var newNode;
    if ( usedNode.x < freeNode.x + freeNode.width && usedNode.x + usedNode.width > freeNode.x ) {
        // New node at the top side of the used node.
        if ( usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.height ) {
            newNode = freeNode.clone();
            newNode.height = usedNode.y - newNode.y;
            freeRects.push(newNode);
        }
        // New node at the bottom side of the used node.
        if ( usedNode.y + usedNode.height < freeNode.y + freeNode.height ) {
            newNode = freeNode.clone();
            newNode.y = usedNode.y + usedNode.height;
            newNode.height = freeNode.y + freeNode.height - (usedNode.y + usedNode.height);
            freeRects.push(newNode);
        }
    }
    if ( usedNode.y < freeNode.y + freeNode.height && usedNode.y + usedNode.height > freeNode.y ) {
        // New node at the left side of the used node.
        if ( usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.width ) {
            newNode = freeNode.clone();
            newNode.width = usedNode.x - newNode.x;
            freeRects.push(newNode);
        }
        // New node at the right side of the used node.
        if ( usedNode.x + usedNode.width < freeNode.x + freeNode.width ) {
            newNode = freeNode.clone();
            newNode.x = usedNode.x + usedNode.width;
            newNode.width = freeNode.x + freeNode.width - (usedNode.x + usedNode.width);
            freeRects.push(newNode);
        }
    }

    return true;
};

var _placeRect = function ( freeRects, rect ) {
    var i;
    for ( i = 0; i < freeRects.length; ++i ) {
        if ( _splitFreeNode( freeRects, freeRects[i], rect ) ) {
            freeRects.splice(i, 1);
            --i;
        }
    }
    // cleanUpFreeRects
    for ( i = 0; i < freeRects.length; ++i ) {
        for ( var j = i + 1; j < freeRects.length; ++j ) {
            if ( freeRects[j].containsRect(freeRects[i]) ) {
                freeRects.splice(i, 1);
                --i;
                break;
            }
            if ( freeRects[i].containsRect(freeRects[j]) ) {
                freeRects.splice(j, 1);
                --j;
            }
        }
    }
};

//
var _maxRectLayout = function (atlas, padding, allowRotate) {
    var freeRects = [];
    freeRects.push ( new Fire.Rect( 0, 0, atlas.width + padding, atlas.height + padding ) );
    var score1, scroe2;
    var scoreRect = function (_freeRects, _width, _height, _allowRotate) {
        score1 = Number.MAX_VALUE;
        score2 = Number.MAX_VALUE;
        var newRect = new Fire.Rect(0, 0, 1, 1);
        var found = false;

        //
        for (var i = 0; i < _freeRects.length; ++i) {
            var freeRect = _freeRects[i];

            var leftoverHoriz, leftoverVert, shortSideFit, longSideFit;
            //
            if (freeRect.width >= _width && freeRect.height >= _height) {
                leftoverHoriz = Math.abs(Math.floor(freeRect.width) - _width);
                leftoverVert = Math.abs(Math.floor(freeRect.height) - _height);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                    newRect.x = freeRect.x;
                    newRect.y = freeRect.y;
                    newRect.width = _width;
                    newRect.height = _height;
                    score1 = shortSideFit;
                    score2 = longSideFit;

                    found = true;
                }
            }

            // rotated
            if (_allowRotate && freeRect.width >= _height && freeRect.height >= _width) {
                leftoverHoriz = Math.abs(Math.floor(freeRect.width) - _height);
                leftoverVert = Math.abs(Math.floor(freeRect.height) - _width);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                    newRect.x = freeRect.x;
                    newRect.y = freeRect.y;
                    newRect.width = _height;
                    newRect.height = _width;
                    score1 = shortSideFit;
                    score2 = longSideFit;

                    found = true;
                }
            }
        }

        //
        if (found === false) {
            score1 = Number.MAX_VALUE;
            score2 = Number.MAX_VALUE;
        }

        return newRect;
    };

    var processElements = atlas.sprites.slice();   // clone
    while ( processElements.length > 0 ) {
        var bestScore1 = Number.MAX_VALUE;
        var bestScore2 = Number.MAX_VALUE;
        var bestElementIdx = -1;
        var bestRect = new Fire.Rect( 0, 0, 1, 1 );

        for ( var i = 0; i < processElements.length; ++i ) {
            var newRect = scoreRect ( freeRects,
                                      processElements[i].width + padding,
                                      processElements[i].height + padding,
                                      allowRotate );

            if ( score1 < bestScore1 || (score1 === bestScore1 && score2 < bestScore2) ) {
                bestScore1 = score1;
                bestScore2 = score2;
                bestRect = newRect;
                bestElementIdx = i;
            }
        }

        if ( bestElementIdx === -1 ) {
            throw new Error( "Error: Failed to layout atlas element" );
        }

        _placeRect( freeRects, bestRect );

        // apply the best-element
        var bestElement = processElements[bestElementIdx];
        bestElement.x = Math.floor(bestRect.x);
        bestElement.y = Math.floor(bestRect.y);
        bestElement.rotated = (bestElement.width + padding !== bestRect.width);
        // remove the processed(inserted) element
        processElements.splice( bestElementIdx, 1 );
    }
};

AtlasUtils.layout = function ( atlas, algorithm, autoSize, padding, allowRotate ) {
    try {
        switch ( algorithm ) {
            case Fire.Atlas.Algorithm.Basic:
                _basicLayout(atlas, padding);
            break;

            case Fire.Atlas.Algorithm.Tree:
                _treeLayout(atlas, padding, allowRotate );
            break;

            case Fire.Atlas.Algorithm.MaxRect:
                _maxRectLayout(atlas, padding, allowRotate);
            break;
        }
    }
    catch ( err ) {
        if ( autoSize === false ) {
            Fire.error(err.message);
            return;
        }

        if ( atlas.width === 4096 && atlas.height === 4096 ) {
            Fire.error(err.message);
            return;
        }

        if ( atlas.width === atlas.height ) {
            atlas.width *= 2;
        }
        else {
            atlas.height = atlas.width;
        }
        AtlasUtils.layout( atlas, algorithm, autoSize, padding, allowRotate );
    }
};

// ==================
// AtlasUtils.sort
// ==================

//
var _compareByWidth = function (a,b) {
    var ret = a.width - b.width;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByHeight = function (a,b) {
    var ret = a.height - b.height;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByArea = function (a,b) {
    var ret = a.width * a.height - b.width * b.height;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByName = function (a,b) {
    return a.name.localeCompare( b.name );
};
var _compareByRotateWidth = function (a,b) {
    var a_size = a.width;
    if ( a.height > a.width ) {
        a_size = a.height;
        a.rotated = true;
    }
    var b_size = b.width;
    if ( b.height > b.width ) {
        b_size = b.height;
        b.rotated = true;
    }
    var ret = a_size - b_size;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByRotateHeight = function (a,b) {
    var a_size = a.height;
    if ( a.width > a.height ) {
        a_size = a.width;
        a.rotated = true;
    }
    var b_size = b.height;
    if ( b.width > b.height ) {
        b_size = b.width;
        b.rotated = true;
    }
    var ret = a_size - b_size;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};

AtlasUtils.sort = function ( atlas, algorithm, sortBy, sortOrder, allowRotate ) {
    // reset rotation
    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        sprite.rotated = false;
    }
    //
    var mySortBy = sortBy;
    var mySortOrder = sortOrder;
    if ( mySortBy === Fire.Atlas.SortBy.UseBest ) {
        switch ( algorithm ) {
        case Fire.Atlas.Algorithm.Basic:
            mySortBy = Fire.Atlas.SortBy.Height;
            break;

        case Fire.Atlas.Algorithm.Tree:
            mySortBy = Fire.Atlas.SortBy.Area;
            break;

        case Fire.Atlas.Algorithm.MaxRect:
            mySortBy = Fire.Atlas.SortBy.Area;
            break;

        default:
            mySortBy = Fire.Atlas.SortBy.Height;
            break;
        }
    }
    if ( mySortOrder === Fire.Atlas.SortOrder.UseBest ) {
        mySortOrder = Fire.Atlas.SortOrder.Descending;
    }

    //
    switch ( mySortBy ) {
        case Fire.Atlas.SortBy.Width:
            if ( allowRotate )
                atlas.sprites.sort( _compareByRotateWidth );
            else
                atlas.sprites.sort( _compareByWidth );
            break;

        case Fire.Atlas.SortBy.Height:
            if ( allowRotate )
                atlas.sprites.sort( _compareByRotateHeight );
            else
                atlas.sprites.sort( _compareByHeight );
            break;

        case Fire.Atlas.SortBy.Area:
            atlas.sprites.sort( _compareByArea );
            break;

        case Fire.Atlas.SortBy.Name:
            atlas.sprites.sort( _compareByName );
            break;
    }

    // sort order
    if ( mySortOrder === Fire.Atlas.SortOrder.Descending ) {
        atlas.sprites.reverse();
    }
};

Fire.AtlasUtils = AtlasUtils;

var JsonAsset = (function () {

    var JsonAsset = Fire.extend('Fire.JsonAsset', Asset)
                        .prop('json', null, Fire.RawType('json'));

    return JsonAsset;
})();

Fire.JsonAsset = JsonAsset;

Fire.TextAsset = (function () {
    var TextAsset = Fire.extend("Fire.TextAsset", Fire.Asset);

    TextAsset.prop('text', '', Fire.MultiText, Fire.RawType('text'));

    return TextAsset;
})();


var BitmapFont = (function () {

    //var CharInfo = {
    //    id: -1,
    //    trim_x: 0,
    //    trim_y: 0,
    //    x: 0,
    //    y: 0,
    //    width: 0,
    //    height: 0,
    //    xOffset: 0,
    //    yOffset: 0,
    //    xAdvance: 0,
    //    rotated: false,
    //};

    //var Kerning = {
    //    first: 0,
    //    second: 0,
    //    amount: 0,
    //};

    var BitmapFont = Fire.extend("Fire.BitmapFont", Fire.Asset);

    BitmapFont.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);
    BitmapFont.prop('charInfos', [], Fire.HideInInspector);
    BitmapFont.prop('kernings', [], Fire.HideInInspector);
    BitmapFont.prop('baseLine', 0, Fire.Integer, Fire.ReadOnly);
    BitmapFont.prop('lineHeight', 0, Fire.Integer, Fire.ReadOnly);
    BitmapFont.prop('size', 0, Fire.Integer, Fire.ReadOnly);
    BitmapFont.prop('face', null, Fire.HideInInspector);

    return BitmapFont;
})();

Fire.BitmapFont = BitmapFont;


    var __TESTONLY__ = {};
    Fire.__TESTONLY__ = __TESTONLY__;
    // The codes below is generated by script automatically:
    // 

// Listen to assets change event, if changed, invoke Component's setters.
var AssetsWatcher = {
    initComponent: function () { },
    start: function () { },
    stop: function () { }
};

Fire._AssetsWatcher = AssetsWatcher;


/**
 * overridable callbacks for editor
 * @property {object} Fire.Engine._editorCallback
 * @private
 */
var editorCallback = {

    onEnginePlayed: null,
    onEngineStopped: null,
    onEnginePaused: null,

    /**
     * This will be called before component callbacks
     * @callback Fire.Engine._editorCallback~onEntityCreated
     * @param {Fire.Entity} entity
     */
    /**
     * @property {Fire.Engine._editorCallback~onEntityCreated} Fire.Engine._editorCallback.onEntityCreated
     */
    onEntityCreated: null,

    /**
     * removes an entity and all its children from scene, this method will NOT be called if it is removed by hierarchy.
     * @callback Fire.Engine._editorCallback~onEntityRemoved
     * @param {Fire.Entity} entity - the entity to remove
     * // @param {boolean} isTopMost - indicates whether it is the most top one among the entities who will be deleted in one operation
     */
    /**
     * @property {Fire.Engine._editorCallback~onEntityRemoved} Fire.Engine._editorCallback.onEntityRemoved
     */
    onEntityRemoved: null,

    /**
     * @callback Fire.Engine._editorCallback~onEntityParentChanged
     * @param {Fire.Entity} entity
     */
    /**
     * @property {Fire.Engine._editorCallback~onEntityParentChanged} Fire.Engine._editorCallback.onEntityParentChanged
     */
    onEntityParentChanged: null,

    /**
     * @callback Fire.Engine._editorCallback~onEntityIndexChanged
     * @param {Fire.Entity} entity
     * @param {number} oldIndex
     * @param {number} newIndex
     */
    /**
     * @property {Fire.Engine._editorCallback~onEntityIndexChanged} Fire.Engine._editorCallback.onEntityIndexChanged
     */
    onEntityIndexChanged: null,

    /**
     * @callback Fire.Engine._editorCallback~onEntityRenamed
     * @param {Fire.Entity} entity
     */
    /**
     * @property {Fire.Engine._editorCallback~onEntityRenamed} Fire.Engine._editorCallback.onEntityRenamed
     */
    onEntityRenamed: null,

    /**
     * @callback Fire.Engine._editorCallback~onStartUnloadScene
     * @param {Scene} scene
     */
    /**
     * @property {Fire.Engine._editorCallback~onStartUnloadScene} Fire.Engine._editorCallback.onStartUnloadScene
     */
    onStartUnloadScene: null,

    /**
     * @callback Fire.Engine._editorCallback~onSceneLaunched
     * @param {Scene} scene
     */
    /**
     * @property {Fire.Engine._editorCallback~onSceneLaunched} Fire.Engine._editorCallback.onSceneLaunched
     */
    onSceneLaunched: null,

    ///**
    // * @callback Fire.Engine._editorCallback~onSceneLoaded
    // * @param {Scene} scene
    // */
    ///**
    // * @property {Fire.Engine._editorCallback~onSceneLoaded} Fire.Engine._editorCallback.onSceneLoaded
    // */
    //onSceneLoaded: null,

    /**
     * @callback Fire.Engine._editorCallback~onComponentEnabled
     * @param {Fire.Component} component
     */
    /**
     * @property {Fire.Engine._editorCallback~onComponentEnabled} Fire.Engine._editorCallback.onComponentEnabled
     */
    onComponentEnabled: null,

    /**
     * @callback Fire.Engine._editorCallback~onComponentDisabled
     * @param {Fire.Component} component
     */
    /**
     * @property {Fire.Engine._editorCallback~onComponentDisabled} Fire.Engine._editorCallback.onComponentDisabled
     */
    onComponentDisabled: null,

    /**
     * @callback Fire.Engine._editorCallback~onComponentAdded
     * @param {Fire.Entity} entity
     * @param {Fire.Component} component
     */
    /**
     * @property {Fire.Engine._editorCallback~onComponentAdded} Fire.Engine._editorCallback.onComponentAdded
     */
    onComponentAdded: null,

    /**
     * @callback Fire.Engine._editorCallback~onComponentRemoved
     * @param {Fire.Entity} entity
     * @param {Fire.Component} component
     */
    /**
     * @property {Fire.Engine._editorCallback~onComponentRemoved} Fire.Engine._editorCallback.onComponentRemoved
     */
    onComponentRemoved: null
};

// Mockers for editor-core

var ImageLoader, JsonLoader, TextLoader, _LoadFromXHR;
var ModifierKeyStates, KeyboardEvent, MouseEvent;

function RenderContext () {
}

RenderContext.initRenderer = function () {
};

Fire._RenderContext = RenderContext;

/**
 * !#en
 *
 * !#zh 除了类已经定义的变量外，以下是其它 Fireball-x 中已经使用的变量名，请避免冲突。这些变量有一些是保留用途，只有特殊情况才会声明。
 * ### 全局变量
 * - `Fire`
 * - `PIXI`
 * - `require`
 * ### 可能定义在任意对象上的变量
 *
 * - `__id__`
 * - `__type__`
 * - `_iN$t`
 * - `_rawext`
 *
 * ### 可能定义在任意类型或 prototype 上的变量
 *
 * - 任何以 `_attrs$` 开头的变量
 * - `__classname__`
 * - `__cid__`
 *
 * ### FireClass 上的静态变量
 *
 * - `get`
 * - `set`
 * - `getset`
 * - `prop`
 * - `$super`
 * - `__props__`
 *
 * ### FireClass 上的成员变量
 *
 * - `_observing`
 * - `_$erialized`
 *
 * @module Reserved-Words
 */

var Destroying = Fire._ObjectFlags.Destroying;
var DontDestroy = Fire._ObjectFlags.DontDestroy;
var Hide = Fire._ObjectFlags.Hide;
var HideInGame = Fire._ObjectFlags.HideInGame;
var HideInEditor = Fire._ObjectFlags.HideInEditor;


var ContentStrategyType = Fire.defineEnum({

    NoScale: -1,

    /**
     * The application takes the height of the design resolution size and modifies the width of the internal canvas,
     * so that it fits the aspect ratio of the device and no distortion will occur,
     * however you must make sure your application works on different aspect ratios
     */
    FixedHeight: -1
});
Fire.ContentStrategyType = ContentStrategyType;

/**
 * @module Fire
 * @class Time
 * @static
 */

var Time = (function () {
    var Time = {};

    Time.time = 0;
    Time.realTime = 0;
    Time.deltaTime = 0;
    Time.frameCount = 0;
    Time.maxDeltaTime = 0.3333333;

    var lastUpdateTime = 0;
    var startTime = 0;

    /**
     * @method Fire.Time._update
     * @param {boolean} [paused=false] if true, only realTime will be updated
     * @private
     */
    Time._update = function (timestamp, paused) {
        if (!paused) {
            var delta = timestamp - lastUpdateTime;
            delta = Math.min(Time.maxDeltaTime, delta);
            lastUpdateTime = timestamp;

            ++Time.frameCount;
            Time.deltaTime = delta;
            Time.time += delta;
        }
        Time.realTime = timestamp - startTime;
    };

    Time._restart = function (timestamp) {
        Time.time = 0;
        Time.realTime = 0;
        Time.deltaTime = 0;
        Time.frameCount = 0;
        lastUpdateTime = timestamp;
        startTime = timestamp;
    };

    return Time;
})();

Fire.Time = Time;

var Event = (function () {

    /**
     * An event allows for signaling that something has occurred. E.g. that an asset has completed downloading.
     * @param {string} type - The name of the event (case-sensitive), e.g. "click", "fire", or "submit"
     * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
     */
    function Event (type, bubbles) {
        //HashObject.call(this);
        if (typeof bubbles === 'undefined') { bubbles = false; }

        /**
         * The name of the event (case-sensitive), e.g. "click", "fire", or "submit"
         * @property {string}
         */
        this.type = type;

        /**
         * A reference to the target to which the event was originally dispatched
         * @property {object}
         */
        this.target = null;

        /**
         * A reference to the currently registered target for the event
         * @property {object}
         */
        this.currentTarget = null;

        /**
         * Indicates which phase of the event flow is currently being evaluated.
         * Returns an integer value represented by 4 constants:
         *  - Event.NONE = 0
         *  - Event.CAPTURING_PHASE = 1
         *  - Event.AT_TARGET = 2
         *  - Event.BUBBLING_PHASE = 3
         * The phases are explained in the [section 3.1, Event dispatch and DOM event flow]
         * (http://www.w3.org/TR/DOM-Level-3-Events/#event-flow), of the DOM Level 3 Events specification.
         *
         * @property {number}
         */
        this.eventPhase = 0;

        /**
         * A boolean indicating whether the event bubbles up through the hierarchy or not
         * @property {boolean}
         */
        this.bubbles = bubbles;

        /**
         * Indicates whether or not event.preventDefault() has been called on the event
         * @property {boolean}
         */
        this._defaultPrevented = false;

        /**
         * Indicates whether or not event.stop() has been called on the event
         * @property {boolean}
         */
        this._propagationStopped = false;

        /**
         * Indicates whether or not event.stop(true) has been called on the event
         * @property {boolean}
         */
        this._propagationImmediateStopped = false;

        //this.cancelable = false;
        //this.clipboardData = undefined;
        //this.path = NodeList[0];
        //this.returnValue = true;
        //this.srcElement = null;
        //this.timeStamp = 1415761681529;
    }

    /**
	 * Events not currently dispatched are in this phase
	 * @constant {number}
     */
    Event.NONE = 0;
    /**
	 * The capturing phase comprises the journey from the root to the last node before the event target's node
	 * see http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
	 * @constant {number}
     */
    Event.CAPTURING_PHASE = 1;
    /**
	 * The target phase comprises only the event target node
	 * see http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
	 * @constant {number}
     */
    Event.AT_TARGET = 2;
    /**
	 * The bubbling phase comprises any subsequent nodes encountered on the return trip to the root of the hierarchy
	 * see http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
	 * @constant {number}
     */
    Event.BUBBLING_PHASE = 3;

    /**
     * Stop propagation. When dispatched in a tree, invoking this method prevents event from reaching any other objects than the current.
     * @param {boolean} [immediate=false] - Indicates whether or not to immediate stop the propagation, default is false.
     *                                      If true, for this particular event, no other callback will be called. Neither those attached on the same event target,
     *                                      nor those attached on targets which will be traversed later.
     */
    Event.prototype.stop = function (immediate) {
        this._propagationStopped = true;
        if (immediate) {
            this._propagationImmediateStopped = true;
        }
    };

    /**
     * If invoked when the cancelable attribute value is true, signals to the operation that caused event to be dispatched that it needs to be canceled.
     */
    Event.prototype.preventDefault = function () {
        this._defaultPrevented = true;
    };

    Event.prototype._reset = function () {
        this.target = null;
        this.currentTarget = null;
        this.eventPhase = 0;
        this._defaultPrevented = false;
        this._propagationStopped = false;
        this._propagationImmediateStopped = false;
    };

    return Event;
})();

Fire.Event = Event;

var EventListeners = (function () {

    /**
     * Extends Fire._CallbacksHandler to handle and invoke event callbacks.
     */
    function EventListeners () {
        Fire._CallbacksHandler.call(this);
    }
    JS.extend(EventListeners, Fire._CallbacksHandler);

    /**
     * @param {Fire.Event} event
     */
    EventListeners.prototype.invoke = function (event) {
        var list = this._callbackTable[event.type];
        if (list && list.length > 0) {
            if (list.length === 1) {
                list[0](event);
                return;
            }
            var endIndex = list.length - 1;
            var lastFunc = list[endIndex];
            for (var i = 0; i <= endIndex; ++i) {
                var callingFunc = list[i];
                callingFunc(event);
                if (event._propagationImmediateStopped || i === endIndex) {
                    break;
                }
                // 为了不每次触发消息时都创建一份回调数组的拷贝，这里需要对消息的反注册做检查和限制
                // check last one to see if any one removed
                if (list[endIndex] !== lastFunc) {          // 如果变短
                    if (list[endIndex - 1] === lastFunc) {  // 只支持删一个
                        if (list[i] !== callingFunc) {      // 如果删了前面的回调，索引不变
                            --i;
                        }
                        --endIndex;
                    }
                    else {
                        // 只允许在一个回调里面移除一个回调。如果要移除很多，只能用 event.stop(true)
                        Fire.error('Call event.stop(true) when you remove more than one callbacks in a event callback.');
                        return;
                    }
                }
            }
        }
    };

    return EventListeners;
})();

var EventTarget = (function () {

    /**
     * EventTarget is an object to which an event is dispatched when something has occurred.
     * Entity are the most common event targets, but other objects can be event targets too.
     *
     * Event targets are an important part of the Fireball event model.
     * The event target serves as the focal point for how events flow through the scene graph.
     * When an event such as a mouse click or a keypress occurs, Fireball dispatches an event object
     * into the event flow from the root of the hierarchy. The event object then makes its way through
     * the scene graph until it reaches the event target, at which point it begins its return trip through
     * the scene graph. This round-trip journey to the event target is conceptually divided into three phases:
     * - The capture phase comprises the journey from the root to the last node before the event target's node
     * - The target phase comprises only the event target node
     * - The bubbling phase comprises any subsequent nodes encountered on the return trip to the root of the tree
	 * See also: http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
     *
     * Event targets can implement the following methods:
     *  - _getCapturingTargets
     *  - _getBubblingTargets
     */
    function EventTarget() {
        HashObject.call(this);

        this._capturingListeners = null;
        this._bubblingListeners = null;
    }
    JS.extend(EventTarget, HashObject);

    /**
     * Register an callback of a specific event type on the EventTarget.
     * This method is merely an alias to addEventListener.
     *
     * @param {string} type - A string representing the event type to listen for.
     * @param {function} callback - The callback that will be invoked when the event is dispatched.
     *                              The callback is ignored if it is a duplicate (the callbacks are unique).
     * @param {boolean} [useCapture=false] - When set to true, the capture argument prevents callback
     *                              from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE.
     *                              When false, callback will NOT be invoked when event's eventPhase attribute value is CAPTURING_PHASE.
     *                              Either way, callback will be invoked when event's eventPhase attribute value is AT_TARGET.
     */
    EventTarget.prototype.on = function (type, callback, useCapture) {
        useCapture = typeof useCapture !== "undefined" ? useCapture : false;
        if (!callback) {
            Fire.error('Callback of event must be non-nil');
            return;
        }
        var listeners = null;
        if (useCapture) {
            listeners = this._capturingListeners = this._capturingListeners || new EventListeners();
        }
        else {
            listeners = this._bubblingListeners = this._bubblingListeners || new EventListeners();
        }
        if ( ! listeners.has(type, callback) ) {
            listeners.add(type, callback);
        }
    };

    /**
     * Removes the callback previously registered with the same type, callback, and capture.
     * This method is merely an alias to removeEventListener.
     *
     * @param {string} type - A string representing the event type being removed.
     * @param {function} callback - The callback to remove.
     * @param {boolean} [useCapture=false] - Specifies whether the callback being removed was registered as a capturing callback or not.
     *                              If not specified, useCapture defaults to false. If a callback was registered twice,
     *                              one with capture and one without, each must be removed separately. Removal of a capturing callback
     *                              does not affect a non-capturing version of the same listener, and vice versa.
     */
    EventTarget.prototype.off = function (type, callback, useCapture) {
        useCapture = typeof useCapture !== "undefined" ? useCapture : false;
        if (!callback) {
            return;
        }
        var listeners = useCapture ? this._capturingListeners : this._bubblingListeners;
        if (listeners) {
            listeners.remove(type, callback);
        }
    };

    /**
     * Register an callback of a specific event type on the EventTarget, the callback will remove itself after the first time it is triggered.
     *
     * @param {string} type - A string representing the event type to listen for.
     * @param {function} callback - The callback that will be invoked when the event is dispatched.
     *                              The callback is ignored if it is a duplicate (the callbacks are unique).
     * @param {boolean} [useCapture=false] - When set to true, the capture argument prevents callback
     *                              from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE.
     *                              When false, callback will NOT be invoked when event's eventPhase attribute value is CAPTURING_PHASE.
     *                              Either way, callback will be invoked when event's eventPhase attribute value is AT_TARGET.
     */
    EventTarget.prototype.once = function (type, callback, useCapture) {
        var self = this;
        var cb = function (event) {
            self.off(type, cb, useCapture);
            callback(event);
        };
        this.on(type, cb, useCapture);
    };

    ///**
    // * Checks whether the EventTarget object has any callback registered for a specific type of event.
    // *
    // * @param {string} type - The type of event.
    // * @param {boolean} A value of true if a callback of the specified type is registered; false otherwise.
    // */
    //EventTarget.prototype.hasEventListener = function (type) {};

    var cachedArray = new Array(16);
    cachedArray.length = 0;

    EventTarget.prototype._doDispatchEvent = function (event) {
        event.target = this;

        // Event.CAPTURING_PHASE
        this._getCapturingTargets(event.type, cachedArray);
        // propagate
        event.eventPhase = 1;
        var target, i;
        for (i = cachedArray.length - 1; i >= 0; --i) {
            target = cachedArray[i];
            if (target.isValid && target._capturingListeners) {
                event.currentTarget = target;
                // fire event
                target._capturingListeners.invoke(event);
                // check if propagation stopped
                if (event._propagationStopped) {
                    return;
                }
            }
        }
        cachedArray.length = 0;

        // Event.AT_TARGET
        // checks if destroyed in capturing callbacks
        if (this.isValid) {
            this._doSendEvent(event);
            if (event._propagationStopped) {
                return;
            }
        }

        if (event.bubbles) {
            // Event.BUBBLING_PHASE
            this._getBubblingTargets(event.type, cachedArray);
            // propagate
            event.eventPhase = 3;
            for (i = 0; i < cachedArray.length; ++i) {
                target = cachedArray[i];
                if (target.isValid && target._bubblingListeners) {
                    event.currentTarget = target;
                    // fire event
                    target._bubblingListeners.invoke(event);
                    // check if propagation stopped
                    if (event._propagationStopped) {
                        return;
                    }
                }
            }
        }
    };

    /**
     * Dispatches an event into the event flow. The event target is the EventTarget object upon which the dispatchEvent() method is called.
     *
     * @param {Fire.Event} event - The Event object that is dispatched into the event flow
     * @return {boolean} - returns true if either the event's preventDefault() method was not invoked,
     *                      or its cancelable attribute value is false, and false otherwise.
     */
    EventTarget.prototype.dispatchEvent = function (event) {
        this._doDispatchEvent(event);
        cachedArray.length = 0;
        var notPrevented = ! event._defaultPrevented;
        event._reset();
        return notPrevented;
    };

    /**
     * Send an event to this object directly, this method will not propagate the event to any other objects.
     *
     * @param {Fire.Event} event - The Event object that is sent to this event target.
     */
    EventTarget.prototype._doSendEvent = function (event) {
        // Event.AT_TARGET
        event.eventPhase = 2;
        event.currentTarget = this;
        if (this._capturingListeners) {
            this._capturingListeners.invoke(event);
            if (event._propagationStopped) {
                return;
            }
        }
        if (this._bubblingListeners) {
            this._bubblingListeners.invoke(event);
        }
    };

    ///**
    // * Send an event to this object directly, this method will not propagate the event to any other objects.
    // *
    // * @param {Fire.Event} event - The Event object that is sent to this event target.
    // * @return {boolean} - returns true if either the event's preventDefault() method was not invoked,
    // *                      or its cancelable attribute value is false, and false otherwise.
    // */
    //EventTarget.prototype.sendEvent = function (event) {
    //    // Event.AT_TARGET
    //    event.reset();
    //    event.target = this;
    //    this._doSendEvent(event);
    //    return ! event._defaultPrevented;
    //};

    /**
     * Get all the targets listening to the supplied type of event in the target's capturing phase.
     * The capturing phase comprises the journey from the root to the last node BEFORE the event target's node.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     * Subclasses can override this method to make event propagable.
     *
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     */
    EventTarget.prototype._getCapturingTargets = function (type, array) {
        /**
         * Subclasses can override this method to make event propagable, E.g.
         * ```
         * for (var target = this._parent; target; target = target._parent) {
         *     if (target._capturingListeners && target._capturingListeners.has(type)) {
         *         array.push(target);
         *     }
         * }
         * ```
         */
    };

    /**
     * Get all the targets listening to the supplied type of event in the target's bubbling phase.
	 * The bubbling phase comprises any SUBSEQUENT nodes encountered on the return trip to the root of the tree.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     * Subclasses can override this method to make event propagable.
     *
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     */
    EventTarget.prototype._getBubblingTargets = function (type, array) {
        // Subclasses can override this method to make event propagable.
    };

    return EventTarget;
})();

Fire.EventTarget = EventTarget;

var Ticker = (function () {
    var Ticker = {};

    var _frameRate = 60;

    // Ticker.requestAnimationFrame

    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.webkitRequestAnimationFrame ||
                                   window.msRequestAnimationFrame ||
                                   window.mozRequestAnimationFrame ||
                                   window.oRequestAnimationFrame;
    if (_frameRate !== 60 || !window.requestAnimationFrame) {
        Ticker.requestAnimationFrame = function (callback) {
            return window.setTimeout(callback, 1000 / _frameRate);
        };
    }
    else {
        Ticker.requestAnimationFrame = function (callback) {
            return window.requestAnimationFrame(callback);
        };
    }

    // Ticker.cancelAnimationFrame

    window.cancelAnimationFrame = window.cancelAnimationFrame ||
                                  window.webkitCancelAnimationFrame ||
                                  window.msCancelAnimationFrame ||
                                  window.mozCancelAnimationFrame ||
                                  window.oCancelAnimationFrame;
    if (window.cancelAnimationFrame) {
        Ticker.cancelAnimationFrame = function (requestId) {
            window.cancelAnimationFrame(requestId);
        };
    }
    else {
        Ticker.cancelAnimationFrame = function (requestId) {
            window.clearTimeout(requestId);
        };
    }

    // Ticker.now

    if (window.performance && window.performance.now) {
        Ticker.now = function () {
            return window.performance.now() / 1000;
        };
    }
    else {
        Ticker.now = function () {
            return Date.now() / 1000;
        };
    }

    return Ticker;
})();

__TESTONLY__.Ticker = Ticker;
(function () {
    // Tweak PIXI
    PIXI.dontSayHello = true;
    var EMPTY_METHOD = function () {};
    PIXI.DisplayObject.prototype.updateTransform = EMPTY_METHOD;
    PIXI.DisplayObject.prototype.displayObjectUpdateTransform = EMPTY_METHOD;
    PIXI.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = EMPTY_METHOD;
})();

/**
 * The web renderer implemented rely on pixi.js
 */
var RenderContext = (function () {

    /**
     * render context 将在 pixi 中维护同样的 scene graph，这样做主要是为之后的 clipping 和 culling 提供支持。
     * 这里采用空间换时间的策略，所有 entity 都有对应的 PIXI.DisplayObjectContainer。
     * 毕竟一般 dummy entity 不会很多，因此这样产生的冗余对象可以忽略。
     * 值得注意的是，sprite 等 pixi object，被视为 entity 对应的 PIXI.DisplayObjectContainer 的子物体，
     * 并且排列在所有 entity 之前，以达到最先渲染的效果。
     *
     * @param {number} width
     * @param {number} height
     * @param {Canvas} [canvas]
     * @param {boolean} [transparent = false]
     */
    function RenderContext (width, height, canvas, transparent) {
        width = width || 800;
        height = height || 600;
        transparent = transparent || false;

        var antialias = false;
        this.stage = new PIXI.Stage(0x000000);
        this.stage.interactive = false;

        this.root = this.stage;
        this.renderer = PIXI.autoDetectRenderer(width, height, {
            view: canvas,
            transparent: transparent,
            antialias: antialias
        } );

        // the shared render context that allows display the object which marked as Fire._ObjectFlags.HideInGame
        this.sceneView = null;

        this.isSceneView = false;

        // binded camera, if supplied the scene will always rendered by this camera
        this._camera = null;
    }

    var emptyTexture = new PIXI.Texture(new PIXI.BaseTexture());

    // static

    RenderContext.initRenderer = function (renderer) {
        renderer._renderObj = null;
        renderer._renderObjInScene = null;
        renderer._tempMatrix = new Fire.Matrix23();
    };

    // properties

    Object.defineProperty(RenderContext.prototype, 'canvas', {
        get: function () {
            return this.renderer.view;
        }
    });

    Object.defineProperty(RenderContext.prototype, 'width', {
        get: function () {
            return this.renderer.width;
        },
        set: function (value) {
            this.renderer.resize(value, this.renderer.height);
        }
    });

    Object.defineProperty(RenderContext.prototype, 'height', {
        get: function () {
            return this.renderer.height;
        },
        set: function (value) {
            this.renderer.resize(this.renderer.width, value);
        }
    });

    Object.defineProperty(RenderContext.prototype, 'size', {
        get: function () {
            return new Vec2(this.renderer.width, this.renderer.height);
        },
        set: function (value) {
            this.renderer.resize(value.x, value.y);
            // DISABLE
            // // auto resize scene view camera
            // if (this._camera && (this._camera.entity._objFlags & Fire._ObjectFlags.EditorOnly)) {
            //     this._camera.size = value.y;
            // }
        }
    });

    Object.defineProperty(RenderContext.prototype, 'background', {
        set: function (value) {
            this.stage.setBackgroundColor(value.toRGBValue());
        }
    });

    Object.defineProperty(RenderContext.prototype, 'camera', {
        get: function () {
            //return (this._camera && this._camera.isValid) || null;
            return this._camera;
        },
        set: function (value) {
            this._camera = value;
            if (Fire.isValid(value)) {
                value.renderContext = this;
            }
        }
    });

    // functions

    RenderContext.prototype.render = function () {
        this.renderer.render(this.stage);
    };

    /**
     * @param {Fire.Entity} entity
     */
    RenderContext.prototype.onRootEntityCreated = function (entity) {
        entity._pixiObj = this._createNode();
    };

    RenderContext.prototype._createNode = function () {
        // always create pixi node even if is scene gizmo, to keep all their indices sync with transforms' sibling indices.
        var node = new PIXI.DisplayObjectContainer();
        if (Engine._canModifyCurrentScene) {
            // attach node if created dynamically
            this.root.addChild(node);
        }
        return node;
    };

    /**
     * removes a entity and all its children from scene
     * @param {Fire.Entity} entity
     */
    RenderContext.prototype.onEntityRemoved = function (entity) {
        this._removeNode(entity._pixiObj);
        entity._pixiObj = null;
    };

    RenderContext.prototype._removeNode = function (node) {
        if (node && node.parent) {
            node.parent.removeChild(node);
        }
    };

    /**
     * @param {Fire.Entity} entity
     * @param {Fire.Entity} oldParent
     */
    RenderContext.prototype.onEntityParentChanged = function (entity, oldParent) {
        this._setParentNode(entity._pixiObj, entity._parent && entity._parent._pixiObj);
    };

    RenderContext.prototype._setParentNode = function (node, parent) {
        if (node) {
            if (parent) {
                parent.addChild(node);
            }
            else {
                this.root.addChild(node);
            }
        }
    };

    /**
     * @param {Fire.Entity} entityParent
     * @param {Fire.Entity} [customFirstChildEntity=null]
     * @return {number}
     */
    RenderContext.prototype._getChildrenOffset = function (entityParent, customFirstChildEntity) {
        if (entityParent) {
            var pixiParent = this.isSceneView ? entityParent._pixiObjInScene : entityParent._pixiObj;
            var firstChildEntity = customFirstChildEntity || entityParent._children[0];
            if (firstChildEntity) {
                var firstChildPixi = this.isSceneView ? firstChildEntity._pixiObjInScene : firstChildEntity._pixiObj;
                var offset = pixiParent.children.indexOf(firstChildPixi);
                if (offset !== -1) {
                    return offset;
                }
                else if (customFirstChildEntity) {
                    return pixiParent.children.length;
                }
                else {
                    Fire.error("%s's pixi object not contains in its pixi parent's children", firstChildEntity.name);
                    return -1;
                }
            }
            else {
                return pixiParent.children.length;
            }
        }
        else {
            return 0;   // the root of hierarchy
        }
    };

    /**
     * @param {Fire.Entity} entity
     * @param {number} oldIndex
     * @param {number} newIndex
     */
    RenderContext.prototype.onEntityIndexChanged = function (entity, oldIndex, newIndex) {
        var lastFirstSibling;
        if (newIndex === 0 && oldIndex > 0) {
            // insert to first
            lastFirstSibling = entity.getSibling(1);
        }
        else if (oldIndex === 0 && newIndex > 0) {
            // move first to elsewhere
            lastFirstSibling = entity;
        }

        if (entity._pixiObj) {
            this._setNodeIndex(entity, oldIndex, newIndex, lastFirstSibling);
        }
    };

    RenderContext.prototype._setNodeIndex = function (entity, oldIndex, newIndex, lastFirstSibling) {
        // skip renderers of entity
        var siblingOffset = this._getChildrenOffset(entity._parent, lastFirstSibling);
        //
        var node = this.isSceneView ? entity._pixiObjInScene : entity._pixiObj;
        if (node) {
            var array = node.parent.children;
            array.splice(oldIndex + siblingOffset, 1);
            var newPixiIndex = newIndex + siblingOffset;
            if (newPixiIndex < array.length) {
                array.splice(newPixiIndex, 0, node);
            }
            else {
                array.push(node);
            }
        }
    };

    RenderContext.prototype.onSceneLaunched = function (scene) {
        // attach root nodes
        this._addToScene(scene);
    };

    RenderContext.prototype._addToScene = function (scene) {
        var entities = scene.entities;
        for (var i = 0, len = entities.length; i < len; i++) {
            var node = this.isSceneView? entities[i]._pixiObjInScene : entities[i]._pixiObj;
            if (node) {
                this.root.addChild(node);
            }
        }
    };

    RenderContext.prototype.onSceneLoaded = function (scene) {
        var entities = scene.entities;
        for (var i = 0, len = entities.length; i < len; i++) {
            this.onEntityCreated(entities[i], false);
        }
    };

    /**
     * create child nodes recursively
     * 这个方法假定parent存在
     * @param {Fire.Entity} entity - must have parent, and not scene gizmo
     */
    var _onChildEntityCreated = function (entity, hasSceneView) {
        entity._pixiObj = new PIXI.DisplayObjectContainer();
        entity._parent._pixiObj.addChild(entity._pixiObj);
        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            _onChildEntityCreated(children[i], hasSceneView);
        }
    };

    /**
     * create pixi nodes recursively
     * @param {Entity} entity
     * @param {boolean} addToScene - add to pixi stage now if entity is root
     */
    RenderContext.prototype.onEntityCreated = function (entity, addToScene) {
        entity._pixiObj = new PIXI.DisplayObjectContainer();
        if (entity._parent) {
            entity._parent._pixiObj.addChild(entity._pixiObj);
        }
        else if (addToScene) {
            this.root.addChild(entity._pixiObj);
        }
        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            _onChildEntityCreated(children[i], this.sceneView);
        }
    };

    RenderContext.prototype._addSprite = function (tex, parentNode) {
        var sprite = new PIXI.Sprite(tex);
        parentNode.addChildAt(sprite, 0);
        return sprite;
    };

    /**
     * @param {Fire.SpriteRenderer} target
     */
    RenderContext.prototype.addSprite = function (target) {
        var tex = createTexture(target._sprite);

        var inGame = !(target.entity._objFlags & HideInGame);
        if (inGame) {
            target._renderObj = this._addSprite(tex, target.entity._pixiObj);
        }
        this.updateSpriteColor(target);
    };

    /**
     * @param {Fire.SpriteRenderer} target
     * @param {boolean} show
     */
    RenderContext.prototype.show = function (target, show) {
        if (target._renderObj) {
            target._renderObj.visible = show;
        }
        if (target._renderObjInScene) {
            target._renderObjInScene.visible = show;
        }
    };

    /**
     * @param target {Fire.SpriteRenderer}
     * @param show {boolean}
     */
    RenderContext.prototype.remove = function (target) {
        this._removeNode(target._renderObj);
        target._renderObj = null;
    };

    RenderContext.prototype.updateSpriteColor = function (target) {
        var tint = target._color.toRGBValue();
        if (target._renderObj) {
            target._renderObj.tint = tint;
        }
    };

    /**
     * @param target {Fire.SpriteRenderer}
     */
    RenderContext.prototype.updateMaterial = function (target) {
        var tex = createTexture(target._sprite);
        if (target._renderObj) {
            target._renderObj.setTexture(tex);
        }
    };

    /**
     * Set the final transform to render
     * @param {Fire.SpriteRenderer} target
     * @param {Fire.Matrix23} matrix - the matrix to render (Read Only)
     */
    RenderContext.prototype.updateTransform = function (target, matrix) {
        // caculate matrix for pixi
        var mat = target._tempMatrix;
        mat.a = matrix.a;
        // negate the rotation because our rotation transform not the same with pixi
        mat.b = - matrix.b;
        mat.c = - matrix.c;
        //
        mat.d = matrix.d;
        mat.tx = matrix.tx;
        // revert Y axis for pixi
        mat.ty = this.renderer.height - matrix.ty;

        var worldAlpha = Math.clamp01(target._color.a);

        // apply matrix
        if ( !this.isSceneView ) {
            if (target._renderObj) {
                target._renderObj.worldTransform = mat;
                target._renderObj.worldAlpha = worldAlpha;
            }
        }
    };

    ///**
    // * @param {Fire.SpriteRenderer} target
    // * @param {Fire.SpriteRenderer} transform
    // * @param {Fire.SpriteRenderer} oldParent
    // */
    //RenderContext.prototype.updateHierarchy = function (target, transform, oldParent) {
    //    if (target._renderObj || target._renderObjInScene) {
    //        if (transform._parent === oldParent) {
    //            // oldAncestor changed its sibling index
    //            if (target._renderObj) {
    //                this._updateSiblingIndex(transform);
    //            }
    //            if (target._renderObjInScene) {
    //                this.sceneView._updateSiblingIndex(transform);
    //            }
    //            return true;
    //        }
    //        else {
    //            // parent changed
    //        }
    //    }
    //    else {
    //        Fire.error('' + target + ' must be added to render context first!');
    //    }
    //    return false;
    //};

    //RenderContext.prototype._updateSiblingIndex = function (transform) {
    //    var pixiNode = this._pixiObjects[transform.id];
    //    var array = pixiNode.parent.children;
    //    var oldIndex = array.indexOf(pixiNode);
    //    var newIndex = transform.getSiblingIndex(); // TODO: 如果前面的节点包含空的entity，则这个new index会有问题
    //    // skip entities not exists in pixi
    //    while ((--newIndex) > 0) {
    //        var previous = transform.getSibling(newIndex);
    //        if (previous.id) {
    //        }
    //    }
    //    array.splice(oldIndex, 1);
    //    if (newIndex < array.length) {
    //        array.splice(newIndex, 0, pixiNode);
    //    }
    //    else {
    //        array.push(pixiNode);
    //    }
    //};

    /**
     * @param sprite {Fire.Sprite}
     */
    function createTexture(sprite) {
        if (sprite && sprite.texture && sprite.texture.image) {
            var img = new PIXI.BaseTexture(sprite.texture.image);
            var frame = new PIXI.Rectangle(sprite.x, sprite.y, Math.min(img.width - sprite.x, sprite.rotatedWidth), Math.min(img.height - sprite.y, sprite.rotatedHeight));
            return new PIXI.Texture(img, frame);
        }
        else {
            return emptyTexture;
        }
    }

    return RenderContext;
})();

/**
 * The debugging method that checks whether the render context matches the current scene or not.
 * @throws {string} error info
 */
RenderContext.prototype.checkMatchCurrentScene = function () {
    var entities = Engine._scene.entities;
    var pixiGameNodes = this.stage.children;
    var pixiSceneNodes;
    if (this.sceneView) {
        pixiSceneNodes = this.sceneView.stage.children;
        pixiSceneNodes = pixiSceneNodes[1].children;    // skip forground and background
    }
    var scope = this;
    function checkMatch (ent, gameNode, sceneNode) {
        if (sceneNode && ent._pixiObjInScene !== sceneNode) {
            throw new Error('entity does not match pixi scene node: ' + ent.name);
        }
        //if (!(ent._objFlags & HideInGame)) {
        //    var gameNode = gameNodes[g++];
        //}
        if (ent._pixiObj !== gameNode) {
            throw new Error('entity does not match pixi game node: ' + ent.name);
        }

        var childCount = ent._children.length;
        var sceneChildrenOffset;
        if (sceneNode) {
            sceneChildrenOffset = scope.sceneView._getChildrenOffset(ent);
            if (sceneNode.children.length !== childCount + sceneChildrenOffset) {
                console.error('Mismatched list of child elements in Scene view, entity: %s,\n' +
                    'pixi childCount: %s, entity childCount: %s, rcOffset: %s',
                    ent.name, sceneNode.children.length, childCount, sceneChildrenOffset);
                throw new Error('(see above error)');
            }
        }
        var gameChildrenOffset = scope._getChildrenOffset(ent);
        if (gameNode.children.length !== childCount + gameChildrenOffset) {
            throw new Error('Mismatched list of child elements in Game view, entity: ' + ent.name);
        }
        for (var i = 0; i < childCount; i++) {
            checkMatch(ent._children[i], gameNode.children[gameChildrenOffset + i], sceneNode && sceneNode.children[i + sceneChildrenOffset]);
        }
    }

    for (var i = 0; i < entities.length; i++) {
        if (pixiSceneNodes && pixiSceneNodes.length !== entities.length) {
            throw new Error('Mismatched list of root elements in scene view');
        }
        if (pixiGameNodes.length !== entities.length) {
            throw new Error('Mismatched list of root elements in game view');
        }
        checkMatch(entities[i], pixiGameNodes[i], pixiSceneNodes && pixiSceneNodes[i]);
    }

    //if (g !== pixiGameNodes.length) {
    //    Fire.error('pixi has extra game node, pixi count: ' + pixiGameNodes.length + ' expected count: ' + g);
    //    return false;
    //}
    // 目前不测试renderer
};
Fire._RenderContext = RenderContext;

PIXI.BitmapText.prototype.updateTransform = function () {
};

Fire.BitmapFont.prototype._onPreDestroy = function () {
    if (this._uuid) {
        PIXI.BitmapText.fonts[this._uuid] = null;
    }
};

var PixiBitmapFontUtil = {};

var defaultFace = "None";

function _getStyle (target) {
    if (target.bitmapFont && target.bitmapFont._uuid) {
        return {
            font : target.bitmapFont.size + " " + target.bitmapFont._uuid,
            align: BitmapText.TextAlign[target.align].toLowerCase(),
        };
    }
    else {
        return {
            font : 1 + " " + defaultFace,
            align: "left",
        };
    }
}

function _setStyle (target) {
    var style = _getStyle(target);
    if (target._renderObj) {
        target._renderObj.setStyle(style);
    }
    if (target._renderObjInScene) {
        target._renderObjInScene.setStyle(style);
    }
}

function _getNewMatrix23 (child, tempMatrix) {
    var mat = new Fire.Matrix23();
    mat.a = child.scale.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = child.scale.y;
    mat.tx = child.position.x;
    mat.ty = -child.position.y;

    mat.prepend(tempMatrix);

    mat.b = -mat.b;
    mat.c = -mat.c;
    mat.ty = Fire.Engine._curRenderContext.renderer.height - mat.ty;
    return mat;
}
var tempData = {
    face      : defaultFace,
    size      : 1,
    chars     : {},
    lineHeight: 1
};

function _registerFont (bitmapFont) {

    //var registered = _hasPixiBitmapFont(bitmapFont);
    //if (registered) {
    //    return;
    //}

    var data = {};
    if (bitmapFont && bitmapFont._uuid) {
        data.face = bitmapFont._uuid;
        data.size = bitmapFont.size;
        data.lineHeight = bitmapFont.lineHeight;
        data.chars = {};

        if (bitmapFont.texture) {
            var img = new PIXI.BaseTexture(bitmapFont.texture.image);

            var charInfos = bitmapFont.charInfos, len = charInfos.length;
            for (var i = 0; i < len; i++) {
                var charInfo = charInfos[i];
                var id = charInfo.id;
                var textureRect = new PIXI.Rectangle(
                    charInfo.x,
                    charInfo.y,
                    charInfo.width,
                    charInfo.height
                );

                if ((textureRect.x + textureRect.width) > img.width || (textureRect.y + textureRect.height) > img.height) {
                    Fire.error('Character in %s does not fit inside the dimensions of texture %s', bitmapFont.name, bitmapFont.texture.name);
                    break;
                }

                var texture = new PIXI.Texture(img, textureRect);

                data.chars[id] = {
                    xOffset : charInfo.xOffset,
                    yOffset : charInfo.yOffset,
                    xAdvance: charInfo.xAdvance,
                    kerning : {},
                    texture : texture
                };
            }
        }
        else {
            Fire.error('Invalid texture of bitmapFont: %s', bitmapFont.name);
        }

        var kernings = bitmapFont.kernings;
        for (var j = 0; j < kernings.length; j++) {
            var kerning = kernings[j];
            var first = kerning.first;
            var second = kerning.second;
            var amount = kerning.amount;
            data.chars[second].kerning[first] = amount;
        }
    }
    else {
        data = tempData;
    }
    PIXI.BitmapText.fonts[data.face] = data;
}

var _hasPixiBitmapFont = function (bitmapFont) {
    if (bitmapFont) {
        return PIXI.BitmapText.fonts[bitmapFont._uuid];
    }
    return null;
};

RenderContext.prototype.getTextSize = function (target) {
    var inGame = !(target.entity._objFlags & HideInGame);
    var w = 0, h = 0;
    if (inGame && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }

        w = target._renderObj.textWidth;
        h = target._renderObj.textHeight;
    }
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }

        w = target._renderObjInScene.textWidth;
        h = target._renderObjInScene.textHeight;
    }
    return new Vec2(w, h);
};

RenderContext.prototype.setText = function (target, newText) {
    if (target._renderObj) {
        target._renderObj.setText(newText);
    }
    if (this.sceneView) {
        target._renderObjInScene.setText(newText);
    }
};

RenderContext.prototype.setAlign = function (target) {
    _setStyle(target);
};

RenderContext.prototype.updateBitmapFont = function (target) {
    _registerFont(target.bitmapFont);
    _setStyle(target);
};

RenderContext.prototype.addBitmapText = function (target) {
    _registerFont(target.bitmapFont);

    var style = _getStyle(target);

    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        target._renderObj = new PIXI.BitmapText(target.text, style);
        target.entity._pixiObj.addChildAt(target._renderObj, 0);
    }
    if (this.sceneView) {
        target._renderObjInScene = new PIXI.BitmapText(target.text, style);
        target.entity._pixiObjInScene.addChildAt(target._renderObjInScene, 0);
    }
};

PixiBitmapFontUtil.updateTransform = function (target, tempMatrix) {
    var i = 0, childrens = null, len = 0, child = null;
    var isGameView = Engine._curRenderContext === Engine._renderContext;
    if (isGameView && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }
        childrens = target._renderObj.children;
        for (len = childrens.length; i < len; i++) {
            child = childrens[i];
            child.worldTransform = _getNewMatrix23(child, tempMatrix);
        }
    }
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }
        childrens = target._renderObjInScene.children;
        for (i = 0, len = childrens.length; i < len; i++) {
            child = childrens[i];
            child.worldTransform = _getNewMatrix23(child, tempMatrix);
        }
    }
};

/**
 *
 */
function ImageLoader(url, callback, onProgress) {
    var image = document.createElement('img');
    image.crossOrigin = 'Anonymous';

    var onload = function () {
        if (callback) {
            callback(null, this);
        }
        image.removeEventListener('load', onload);
        image.removeEventListener('error', onerror);
        image.removeEventListener('progress', onProgress);
    };
    var onerror = function (msg, line, url) {
        if (callback) {
            var error = 'Failed to load image: ' + msg + ' Url: ' + url;
            callback(error, null);
        }
        image.removeEventListener('load', onload);
        image.removeEventListener('error', onerror);
        image.removeEventListener('progress', onProgress);
    };

    image.addEventListener('load', onload);
    image.addEventListener('error', onerror);
    if (onProgress) {
        image.addEventListener('progress', onProgress);
    }
    image.src = url;
    return image;
}

/**
 * @param {string} [responseType="text"] - the XMLHttpRequestResponseType
 */
function _LoadFromXHR(url, callback, onProgress, responseType) {
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;   // INVALID_STATE_ERR: DOM Exception 11 in phantomjs
    var total = -1;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
            if (callback) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(null, xhr);
                }
                else {
                    callback('LoadFromXHR: Could not load "' + url + '", status: ' + xhr.status, null);
                }
            }
            xhr.onreadystatechange = null;
            //xhr.onload = null;
            if (addedProgressListener) {
                xhr.removeEventListener('progress', addedProgressListener);
            }
        }
        else {
            if (onProgress && xhr.readyState === xhr.LOADING && !('onprogress' in xhr)) {
                if (total === -1) {
                    total = xhr.getResponseHeader('Content-Length');
                }
                onProgress(xhr.responseText.length, total);
            }
            if (onProgress && xhr.readyState === xhr.HEADERS_RECEIVED) {
                total = xhr.getResponseHeader('Content-Length');
            }
        }
    };
    //xhr.onload = function () {
    //    if (callback) {
    //        if (xhr.status === 200 || xhr.status === 0) {
    //            callback(xhr);
    //        }
    //        else {
    //            callback(null, 'LoadFromXHR: Could not load "' + url + '", status: ' + xhr.status);
    //        }
    //    }
    //    xhr.onreadystatechange = null;
    //    xhr.onload = null;
    //    if (addedProgressListener) {
    //        xhr.removeEventListener('progress', addedProgressListener);
    //    }
    //};
    xhr.open('GET', url, true);
    if (responseType) {
        xhr.responseType = responseType;
    }
    var addedProgressListener;
    if (onProgress && 'onprogress' in xhr) {
        addedProgressListener = function (event) {
            if (event.lengthComputable) {
                onProgress(event.loaded, event.total);
            }
        };
        xhr.addEventListener('progress', onprogress);
    }
    xhr.send();
}

function TextLoader(url, callback, onProgress) {
    var cb = callback && function(error, xhr) {
        if (xhr && xhr.responseText) {
            callback(null, xhr.responseText);
        }
        else {
            callback('TextLoader: "' + url +
                '" seems to be unreachable or the file is empty. InnerMessage: ' + error, null);
        }
    };
    _LoadFromXHR(url, cb, onProgress);
}

function JsonLoader(url, callback, onProgress) {
    var cb = callback && function(error, xhr) {
        if (xhr && xhr.responseText) {
            var json;
            try {
                json = JSON.parse(xhr.responseText);
            }
            catch (e) {
                callback(e, null);
                return;
            }
            callback(null, json);
        }
        else {
            callback('JsonLoader: "' + url +
                '" seems to be unreachable or the file is empty. InnerMessage: ' + error, null);
        }
    };
    _LoadFromXHR(url, cb, onProgress);
}

Fire._JsonLoader = JsonLoader;

var Component = (function () {

    /**
     * used in _callOnEnable to ensure onEnable and onDisable will be called alternately
     * 从逻辑上来说OnEnable和OnDisable的交替调用不需要由额外的变量进行保护，但那样会使设计变得复杂
     * 例如Entity.destroy调用后但还未真正销毁时，会调用所有Component的OnDisable。
     * 这时如果又有addComponent，Entity需要对这些新来的Component特殊处理。将来调度器做了之后可以尝试去掉这个标记。
     */
    var IsOnEnableCalled = Fire._ObjectFlags.IsOnEnableCalled;

    // IsOnEnableCalled 会收到 executeInEditMode 的影响，IsEditorOnEnabledCalled 不会
    var IsEditorOnEnabledCalled = Fire._ObjectFlags.IsEditorOnEnabledCalled;
    var IsOnLoadCalled = Fire._ObjectFlags.IsOnLoadCalled;
    var IsOnStartCalled = Fire._ObjectFlags.IsOnStartCalled;

    var compCtor;
    /**
     *
     * Base class for everything attached to Entity
     * NOTE: Not allowed to use construction parameters for Component's subclasses,
     *       because Component is created by the engine.
     * @class Component
     * @static
     *
     */
    var Component = Fire.extend('Fire.Component', HashObject, compCtor);

    Component.prop('entity', null, Fire.HideInInspector);

    Component.getset('_scriptUuid',
        function () {
            return this._cacheUuid || '';
        },
        function (value) {
            if (this._cacheUuid !== value) {
                if (value && Fire.isUuid(value)) {
                    var classId = Fire.compressUuid(value);
                    var newComp = Fire.JS._getClassById(classId);
                    if (newComp) {
                        // TODO
                        console.log('@Jare');
                        //Fire.sendToWindows('reload:window-scripts', Fire._Sandbox.compiled);
                    }
                    else {
                        Fire.error('Can not find a component in the script which uuid is "%s".', value);
                    }
                }
                else {
                    Fire.error('invalid script');
                }
            }
        },
        Fire.DisplayName("Script"),
        Fire.ObjectType(Fire.ScriptAsset, true)
    );

    // enabled self
    Component.prop('_enabled', true, Fire.HideInInspector);

    // properties
    /**
     * If component is enabled.
     * @property enabled
     * @type boolean
     */
    Object.defineProperty(Component.prototype, 'enabled', {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            // jshint eqeqeq: false
            if (this._enabled != value) {
                // jshint eqeqeq: true
                this._enabled = value;
                if (this.entity._activeInHierarchy) {
                    _callOnEnable(this, value);
                }
            }
        }
    });

    /**
     * If the component is enabled in hierarchy.
     * @property enabledInHierarchy
     * @type Transform
     */
    Object.defineProperty(Component.prototype, 'enabledInHierarchy', {
        get: function () {
            return this._enabled && this.entity._activeInHierarchy;
        }
    });

    /**
     * Returns the {% crosslink Fire.Transform Transform %} attached to the entity.
     * @property transform
     * @type Transform
     */
    Object.defineProperty(Component.prototype, 'transform', {
        get: function () {
            return this.entity.transform;
        }
    });

    // callback functions
    /**
     * Update is called every frame, if the Component is enabled.
     * @event update
     */
    Component.prototype.update = null;

    /**
     * LateUpdate is called every frame, if the Component is enabled.
     * @event lateUpdate
     */
    Component.prototype.lateUpdate = null;
    //(NYI) Component.prototype.onCreate = null;  // customized constructor for template
    /**
     * When attaching to an active entity or its entity first activated
     * @event onLoad
     */
    Component.prototype.onLoad = null;    //
    Component.prototype.onStart = null;   // called before all scripts' update if the Component is enabled
    Component.prototype.onEnable = null;
    Component.prototype.onDisable = null;
    Component.prototype.onDestroy = null;
    Component.prototype.onPreRender = null;


    /**
     * @param {function|string} typeOrTypename
     * @return {Component}
     */
    Component.prototype.addComponent = function (typeOrTypename) {
        return this.entity.addComponent(typeOrTypename);
    };

    /**
     * @param {function|string} typeOrTypename
     * @return {Component}
     */
    Component.prototype.getComponent = function (typeOrTypename) {
        return this.entity.getComponent(typeOrTypename);
    };

    /**
     * This method will be invoked when the scene graph changed, which is means the parent of its transform changed,
     * or one of its ancestor's parent changed, or one of their sibling index changed.
     * NOTE: This callback only available after onLoad.
     *
     * @param {Fire.Transform} transform - the transform which is changed, can be any of this transform's ancestor.
     * @param {Fire.Transform} oldParent - the transform's old parent, if not changed, its sibling index changed.
     * @return {boolean} return whether stop propagation to this component's child components.
     */
    //Component.prototype.onHierarchyChanged = function (transform, oldParent) {};

    // overrides

    Component.prototype.destroy = function () {
        if (FObject.prototype.destroy.call(this)) {
            if (this._enabled && this.entity._activeInHierarchy) {
                _callOnEnable(this, false);
            }
        }
    };

    // Should not call onEnable/onDisable in other place
    function _callOnEnable (self, enable) {
        if ( enable ) {
            if ( !(self._objFlags & IsOnEnableCalled) ) {
                self._objFlags |= IsOnEnableCalled;
                if ( self.onEnable ) {
                    self.onEnable();
                }
            }

        }
        else {
            if ( self._objFlags & IsOnEnableCalled ) {
                self._objFlags &= ~IsOnEnableCalled;
                if ( self.onDisable ) {
                    self.onDisable();
                }
            }
        }
    }

    Component.prototype._onEntityActivated = function (active) {
        if ( !(this._objFlags & IsOnLoadCalled) ) {
            this._objFlags |= IsOnLoadCalled;
            if (this.onLoad) {
                this.onLoad();
            }
            //if (this.onHierarchyChanged) {
            //    this.entity.transform._addListener(this);
            //}
        }
        if (this._enabled) {
            _callOnEnable(this, active);
        }
    };

    /**
     * invoke starts on entities
     * @method _invokeStarts
     * @param {Fire.Entity} entity
     */
    Component._invokeStarts = function (entity) {
        var countBefore = entity._components.length;
        var c = 0, comp = null;
            for (; c < countBefore; ++c) {
                comp = entity._components[c];
                if ( !(comp._objFlags & IsOnStartCalled) ) {
                    comp._objFlags |= IsOnStartCalled;
                    if (comp.onStart) {
                        comp.onStart();
                    }
                }
            }
        // activate its children recursively
        for (var i = 0, children = entity._children, len = children.length; i < len; ++i) {
            var child = [i];
            if (child._active) {
                Component._invokeStarts(child);
            }
        }
    };

    Component.prototype._onPreDestroy = function () {
        // ensure onDisable called
        _callOnEnable(this, false);
        // onDestroy
        if (this.onDestroy) {
            this.onDestroy();
        }
        // remove component
        this.entity._removeComponent(this);
    };

    return Component;
})();

Fire.Component = Component;

////////////////////////////////////////////////////////////////////////////////
// Component helpers

// Register Component Menu

/**
 * Register a component to the "Component" menu.
 *
 * @method addComponentMenu
 * @static
 * @param {function} constructor - the class you want to register, must inherit from Component
 * @param {string} menuPath - the menu path name. Eg. "Rendering/Camera"
 * @param {number} [priority] - the order which the menu item are displayed
 */
Fire.addComponentMenu = function (constructor, menuPath, priority) {
};

/**
 * Makes a component execute in edit mode.
 * By default, all components are only executed in play mode,
 * which means they will not have their callback functions executed while the Editor is in edit mode.
 * By calling this function, each component will also have its callback executed in edit mode.
 *
 * @method executeInEditMode
 * @static
 * @param {function} constructor - the class you want to register, must inherit from Component
 */
Fire.executeInEditMode = function (constructor) {
};

var _requiringFrames = [];  // the requiring frame infos

Fire._RFpush = function (module, uuid, script) {
    if (arguments.length === 2) {
        script = uuid;
        uuid = '';
    }
    _requiringFrames.push({
        uuid: uuid,
        script: script,
        module: module,
        exports: module.exports,    // original exports
        comp: null
    });
};

Fire._RFpop = function () {
    var frameInfo = _requiringFrames.pop();
    // check exports
    var module = frameInfo.module;
    var exports = frameInfo.exports;
    if (exports === module.exports) {
        for (var key in exports) {
            return;
        }
        // auto export component
        module.exports = frameInfo.comp;
    }
};

Fire._RFget = function () {
    return _requiringFrames[_requiringFrames.length - 1];
};


function checkCompCtor (constructor, scopeName) {
    if (constructor) {
        if (Fire.isChildClassOf(constructor, Component)) {
            Fire.error(scopeName + ' Constructor can not be another Component');
            return false;
        }
        if (constructor.length > 0) {
            // To make a unified FireClass serialization process,
            // we don't allow parameters for constructor when creating instances of FireClass.
            // For advance user, construct arguments can get from 'arguments'.
            Fire.error(scopeName + ' Can not instantiate Component with arguments.');
            return false;
        }
    }
    return true;
}
var doDefine = Fire._doDefine;
Fire._doDefine = function (className, baseClass, constructor) {
    if ( Fire.isChildClassOf(baseClass, Fire.Component) ) {
        var frame = Fire._RFget();
        if (frame) {
            if ( !checkCompCtor(constructor, '[Fire.extend]') ) {
                return null;
            }
            if (frame.comp) {
                Fire.error('Sorry, each script can have at most one Component.');
                return;
            }
            if (frame.uuid) {
                // project component
                if (className) {
                    Fire.warn('Sorry, specifying class name for Component in project scripts is not allowed. Just use Fire.extend(baseComponent, constructor) please.');
                }
            }
            //else {
            //    builtin plugin component
            //}
            className = className || frame.script;
            var cls = doDefine(className, baseClass, constructor);
            if (frame.uuid) {
                JS._setClassId(frame.uuid, cls);
            }
            frame.comp = cls;
            return cls;
        }
    }
    // not component or engine component
    return doDefine(className, baseClass, constructor);
};

var Transform = (function () {

    /**
     * Position, rotation and scale of an object.
     * @class Transform
     * @extends Component
     */

    var Transform = Fire.extend('Fire.Transform', Component, function () {
        this._position = new Vec2(0, 0);
        this._scale = new Vec2(1, 1);

        this._worldTransform = new Matrix23();

        /**
         * @property {Fire.Transform} _parent - the cached reference to parent transform
         * @default null
         */
        this._parent = null;

        //this._hierarchyChangedListeners = null;
    });

    Fire.executeInEditMode(Transform);

    Transform.prop('_position', null, Fire.HideInInspector);
    Transform.prop('_rotation', 0, Fire.HideInInspector);
    Transform.prop('_scale', null, Fire.HideInInspector);

    // properties

    var ERR_NaN = 'The %s must not be NaN';

    /**
     * The local position in its parent's coordinate system
     * @member {Fire.Vec2} position
     * @instance
     */
    Transform.getset('position',
        function () {
            return new Vec2(this._position.x, this._position.y);
        },
        function (value) {
            var x = value.x;
            var y = value.y;
            if ( !isNaN(x) && !isNaN(y) ) {
                this._position.x = x;
                this._position.y = y;
            }
            else {
                Fire.error(ERR_NaN, 'xy of new position');
            }
        },
        Fire.Tooltip("The local position in its parent's coordinate system")
    );

    /**
     * The local x position in its parent's coordinate system
     * @member {number} x
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'x', {
        get: function () {
            return this._position.x;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                this._position.x = value;
            }
            else {
                Fire.error(ERR_NaN, 'new x');
            }
        }
    });

    /**
     * The local y position in its parent's coordinate system
     * @member {number} y
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'y', {
        get: function () {
            return this._position.y;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                this._position.y = value;
            }
            else {
                Fire.error(ERR_NaN, 'new y');
            }
        }
    });

    /**
     * The position of the transform in world space
     * @property {Fire.Vec2} Fire.Transform#worldPosition
     */
    Object.defineProperty(Transform.prototype, 'worldPosition', {
        get: function () {
            var l2w = this.getLocalToWorldMatrix();
            return new Vec2(l2w.tx, l2w.ty);
        },
        set: function (value) {
            var x = value.x;
            var y = value.y;
            if ( !isNaN(x) && !isNaN(y) ) {
                if ( this._parent ) {
                    var w2l = this._parent.getWorldToLocalMatrix();
                    this.position = w2l.transformPoint(value);
                }
                else {
                    this.position = value;
                }
            }
            else {
                Fire.error(ERR_NaN, 'xy of new worldPosition');
            }
        }
    });

    /**
     * The x position of the transform in world space
     * @member {number} x
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'worldX', {
        get: function () {
            return this.worldPosition.x;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                if ( this._parent ) {
                    var pl2w = this._parent.getLocalToWorldMatrix();
                    var l2w = this.getLocalMatrix().prepend(pl2w);
                    if (l2w.tx !== value) {
                        this._position.x = value;
                        this._position.y = l2w.ty;
                        pl2w.invert().transformPoint(this._position, this._position);
                    }
                }
                else {
                    this._position.x = value;
                }
                //将来优化做好了以后，上面的代码可以简化成下面这些
                //var pos = this.worldPosition;
                //if (pos.x !== value) {
                //    pos.x = value;
                //    this.worldPosition = pos;
                //}
            }
            else {
                Fire.error(ERR_NaN, 'new worldX');
            }
        }
    });

    /**
     * The y position of the transform in world space
     * @member {number} y
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'worldY', {
        get: function () {
            return this.worldPosition.y;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                if ( this._parent ) {
                    var pl2w = this._parent.getLocalToWorldMatrix();
                    var l2w = this.getLocalMatrix().prepend(pl2w);
                    if (l2w.ty !== value) {
                        this._position.x = l2w.tx;
                        this._position.y = value;
                        pl2w.invert().transformPoint(this._position, this._position);
                    }
                }
                else {
                    this._position.y = value;
                }
            }
            else {
                Fire.error(ERR_NaN, 'new worldY');
            }
        }
    });

    /**
     * The counterclockwise degrees of rotation relative to the parent
     * @property {number} Fire.Transform#rotation
     */
    Transform.getset('rotation',
        function () {
            return this._rotation;
        },
        function (value) {
            if ( !isNaN(value) ) {
                this._rotation = value;
            }
            else {
                Fire.error(ERR_NaN, 'new rotation');
            }
        },
        Fire.Tooltip('The counterclockwise degrees of rotation relative to the parent')
    );

    /**
     * The counterclockwise degrees of rotation in world space
     * @property {number} Fire.Transform#worldRotation
     */
    Object.defineProperty(Transform.prototype, 'worldRotation', {
        get: function () {
            if ( this._parent ) {
                return this.rotation + this._parent.worldRotation;
            }
            else {
                return this.rotation;
            }
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                if ( this._parent ) {
                    this.rotation = value - this._parent.worldRotation;
                }
                else {
                    this.rotation = value;
                }
            }
            else {
                Fire.error(ERR_NaN, 'new worldRotation');
            }
        }
    });

    /**
     * The local scale factor relative to the parent
     * @property {Fire.Vec2} Fire.Transform#scale
     * @default new Vec2(1, 1)
     */
    Transform.getset('scale',
        function () {
            return new Vec2(this._scale.x, this._scale.y);
        },
        function (value) {
            var x = value.x;
            var y = value.y;
            if ( !isNaN(x) && !isNaN(y) ) {
                this._scale.x = x;
                this._scale.y = y;
            }
            else {
                Fire.error(ERR_NaN, 'xy of new scale');
            }
        },
        Fire.Tooltip('The local scale factor relative to the parent')
    );

    /**
     * The local x scale factor relative to the parent
     * @member {number} x
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'scaleX', {
        get: function () {
            return this._scale.x;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                this._scale.x = value;
            }
            else {
                Fire.error(ERR_NaN, 'new scaleX');
            }
        }
    });

    /**
     * The local y scale factor relative to the parent
     * @member {number} y
     * @instance
     */
    Object.defineProperty(Transform.prototype, 'scaleY', {
        get: function () {
            return this._scale.y;
        },
        set: function (value) {
            if ( !isNaN(value) ) {
                this._scale.y = value;
            }
            else {
                Fire.error(ERR_NaN, 'new scaleY');
            }
        }
    });

    /**
     * The lossy scale of the transform in world space (Read Only)
     * @property {Fire.Vec2} Fire.Transform#worldScale
     */
    Object.defineProperty(Transform.prototype, 'worldScale', {
        get: function () {
            var l2w = this.getLocalToWorldMatrix();
            return l2w.getScale();
        }
    });

    // override functions

    Transform.prototype.onLoad = function () {
        this._parent = this.entity._parent && this.entity._parent.transform;
    };

    Transform.prototype.destroy = function () {
        Fire.error("Not allowed to destroy the transform. Please destroy the entity instead.");
    };

    // other functions

    Transform.prototype._updateTransform = function (parentMatrix) {
        //var mat = this._worldTransform;

        //var px = this._pivot.x;
        //var py = this._pivot.y;

        //var radians = this._rotation * 0.017453292519943295;
        //var sin = this._rotation === 0 ? 0 : Math.sin(radians);
        //var cos = this._rotation === 0 ? 1 : Math.cos(radians);

        //// get local
        //mat.a = this._scale.x * cos;
        //mat.b = this._scale.x * sin;   // 这里如果是pixi，b和c是反过来的
        //mat.c = this._scale.y * - sin;
        //mat.d = this._scale.y * cos;
        //mat.tx = this._position.x;
        //mat.ty = this._position.y;

        //// parent
        //var pa = parentMatrix.a;
        //var pb = parentMatrix.b;
        //var pc = parentMatrix.c;
        //var pd = parentMatrix.d;

        //// local x parent
        //if (pa !== 1 || pb !== 0 || pc !== 0 || pd !== 1) {
        //    mat.a = mat.a * pa + mat.b * pc;
        //    mat.b = mat.a * pb + mat.b * pd;
        //    mat.c = mat.c * pa + mat.d * pc;
        //    mat.d = mat.c * pb + mat.d * pd;
        //    mat.tx = mat.tx * pa + mat.ty * pc + parentMatrix.tx;
        //    mat.ty = mat.tx * pb + mat.ty * pd + parentMatrix.ty;
        //}
        //else {
        //    mat.tx += parentMatrix.tx;
        //    mat.ty += parentMatrix.ty;
        //}

        var mat = this._worldTransform;
        this.getLocalMatrix(mat);
        mat.prepend(parentMatrix);

        //this._worldAlpha = this._alpha * this._parent._worldAlpha;

        // update children
        var children = this.entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            children[i].transform._updateTransform(mat);
        }
    };

    Transform.prototype._updateRootTransform = function () {
        var mat = this._worldTransform;
        this.getLocalMatrix(mat);
        //this._worldAlpha = this._alpha;

        // update children
        var children = this.entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            children[i].transform._updateTransform(mat);
        }
    };

    /**
     * Get the local matrix that transforms a point from local space into parents space.
     * @method Fire.Transform#getLocalMatrix
     * @param {Fire.Matrix23} [out]
     * @return {Fire.Matrix23}
     */
    Transform.prototype.getLocalMatrix = function (out) {
        out = out || new Matrix23();

        //var px = this._pivot.x;
        //var py = this._pivot.y;

        var radians = this._rotation * 0.017453292519943295;
        var sin = this._rotation === 0 ? 0 : Math.sin(radians);
        var cos = this._rotation === 0 ? 1 : Math.cos(radians);

        out.a = this._scale.x * cos;   // scaleMat.a * rotateMat.a(cos) 00
        // 这里如果是pixi，b和c是反过来的
        out.b = this._scale.x * sin;   // scaleMat.a * rotateMat.b(sin)
        out.c = this._scale.y * - sin; // scaleMat.d * rotateMat.c(-sin)
        //
        out.d = this._scale.y * cos;   // scaleMat.d * rotateMat.d(cos) 11
        out.tx = this._position.x;/* * ra + this._position.y * rc*/
        out.ty = this._position.y;/* * rb + this._position.y * rd*/
        //out.tx = this._position.x/* - out.a * px - py * out.b*/;    // 02
        //out.ty = this._position.y/* - out.d * py - px * out.c*/;    // 12

        //above should equivalent to:
        //  var t = new Matrix23();
        //  t.tx = this._position.x;
        //  t.ty = this._position.y;
        //  var r = new Matrix23();
        //  r.rotate(radians);
        //  var s = new Matrix23();
        //  s.setScale(this._scale);
        //  out.set(s.prepend(r).prepend(t));

        return out;
    };

    /**
     * Get the world transform matrix that transforms a point from local space into world space.
     * @method Transform#getLocalToWorldMatrix
     * @param {Fire.Matrix23} [out]
     * @return {Fire.Matrix23}
     */
    Transform.prototype.getLocalToWorldMatrix = function (out) {
        // todo, merge with this._worldTransform
        out = out || new Matrix23();
        this.getLocalMatrix(out);
        var t = new Fire.Matrix23();
        for (var p = this._parent; p !== null; p = p._parent) {
            out.prepend(p.getLocalMatrix(t));
        }
        return out;
    };

    /**
     * Get the inverse world transform matrix that transforms a point from world space into local space.
     * @method Transform#getWorldToLocalMatrix
     * @param {Fire.Matrix23} [out]
     * @return {Fire.Matrix23}
     */
    Transform.prototype.getWorldToLocalMatrix = function (out) {
        return this.getLocalToWorldMatrix(out).invert();
    };

    /**
     * @method Transform#rotateAround
     * @param {Fire.Vec2} point - the world point rotates through
     * @param {number} angle - degrees
     */
    Transform.prototype.rotateAround = function (point, angle) {
        var delta = this.worldPosition.subSelf(point);
        delta.rotateSelf(Math.deg2rad(angle));
        this.worldPosition = point.addSelf(delta);
        this.rotation = this._rotation + angle;
    };

    /**
     * Moves the transform in the direction and distance of translation. The movement is applied relative to the transform's local space.
     * @method Transform#translate
     * @param {Fire.Vec2} translation
     */
    Transform.prototype.translate = function (translation) {
        var rotated = translation.rotate(Math.deg2rad(this._rotation));
        this.position = this._position.add(rotated, rotated);
    };

    /**
     * @property {Fire.Vec2} up - up direction in world space, point to the y(green) axis
     */
    Object.defineProperty(Transform.prototype, 'up', {
        get: function () {
            return (new Vec2(0.0, 1.0)).rotateSelf(Math.deg2rad(this.worldRotation));
        },
        set: function (value) {
            if (value.x === 0.0 && value.y === 0.0) {
                Fire.warn("Can't get rotation from zero vector");
                return;
            }
            var radians = Math.atan2(value.y, value.x) - Math.HALF_PI;
            this.worldRotation = Math.rad2deg(radians);
        }
    });

    /**
     * @property {Fire.Vec2} right - right direction in world space, point to the x(red) axis
     */
    Object.defineProperty(Transform.prototype, 'right', {
        get: function () {
            return (new Vec2(1.0, 0.0)).rotateSelf(Math.deg2rad(this.worldRotation));
        },
        set: function (value) {
            if (value.x === 0.0 && value.y === 0.0) {
                Fire.warn("Can't get rotation from zero vector");
                return;
            }
            var radians = Math.atan2(value.y, value.x);
            this.worldRotation = Math.rad2deg(radians);
        }
    });

    ///**
    // * Subscribe the `onHierarchyChanged` event.
    // * When this transform or one of its parents' hierarchy changed, the `onHierarchyChanged`
    // * method will be invoked on supplied instance of Component. If you want to unsubscribe this event,
    // * you must destroy the Component.
    // * 这里不支持自定义回调，因为如果忘了反注册很容易就会内存泄漏。
    // *
    // * @method Fire.Transform#_addListener
    // * @param {Fire.Component} component - the component to be invoked.
    // * @private
    // */
    //Transform.prototype._addListener = function (component) {
    //    //if (component.entity === this.entity) {
    //        if (this._hierarchyChangedListeners) {
    //            this._hierarchyChangedListeners.push(component);
    //        }
    //        else {
    //            this._hierarchyChangedListeners = [component];
    //        }
    //    //}
    //    //else {
    //    //    Fire.error("Can not listen other entity's onHierarchyChanged event");
    //    //}
    //};

    //// 这里就算不调用，内存也不会泄露，因为component本身就会被destroy。
    //// 只不过调用了以后内存能清理的更及时。
    //Transform.prototype._removeListener = function (component) {
    //    if (this._hierarchyChangedListeners) {
    //        var idx = this._hierarchyChangedListeners.indexOf(component);
    //        this._hierarchyChangedListeners.splice(idx, 1);
    //    }
    //};

    //Transform.prototype._onHierarchyChanged = function (transform, oldParent) {
    //    // notify self listener
    //    if (this._hierarchyChangedListeners) {
    //        for (var i = this._hierarchyChangedListeners.length - 1; i >= 0; --i) {
    //            var target = this._hierarchyChangedListeners[i];
    //            if (target.isValid) {
    //                if (target.onHierarchyChanged(transform, oldParent)) {
    //                    // 目前只有一种component会终止事件，如果有多种，这里需要做分类
    //                    return;
    //                }
    //            }
    //            else {
    //                this._hierarchyChangedListeners.splice(i, 1);
    //            }
    //        }
    //    }
    //    // notify children
    //    for (var c = 0, len = this._children.length; c < len; c++) {
    //        this._children[c]._onHierarchyChanged(transform, oldParent);
    //    }
    //};

    return Transform;
})();

Fire.Transform = Transform;

var Renderer = (function () {

    /**
     * The base for all renderer
     */
    var Renderer = Fire.extend('Fire.Renderer', Component);

    ///**
    // * Returns a "local" axis aligned bounding box(AABB) of the renderer.
    // * The returned box is relative only to its parent.
    // *
    // * @function Fire.Renderer#getLocalBounds
    // * @param {Fire.Rect} [out] - optional, the receiving rect
    // * @return {Fire.Rect}
    // */
    //Renderer.prototype.getLocalBounds = function (out) {
    //    Fire.warn('interface not yet implemented');
    //    return new Fire.Rect();
    //};

    var tempMatrix = new Fire.Matrix23();

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @function Fire.Renderer#getWorldBounds
     * @param {Fire.Rect} [out] - optional, the receiving rect
     * @return {Fire.Rect} - the rect represented in world position
     */
    Renderer.prototype.getWorldBounds = function (out) {
        var worldMatrix = this.entity.transform.getLocalToWorldMatrix();
        var bl = new Vec2(0, 0);
        var tl = new Vec2(0, 0);
        var tr = new Vec2(0, 0);
        var br = new Vec2(0, 0);
        _doGetOrientedBounds.call(this, worldMatrix, bl, tl, tr, br);
        out = out || new Rect();
        Math.calculateMaxRect(out, bl, tl, tr, br);
        return out;
    };

    /**
     * Returns a "world" oriented bounding box(OBB) of the renderer.
     *
     * @function Fire.Renderer#getWorldOrientedBounds
     * @param {...Fire.Vec2} [out] - optional, the vector to receive the world position
     * @return {Fire.Vec2[]} - the array contains vectors represented in world position
     */
    Renderer.prototype.getWorldOrientedBounds = function (out1, out2, out3, out4){
        out1 = out1 || new Vec2(0, 0);
        out2 = out2 || new Vec2(0, 0);
        out3 = out3 || new Vec2(0, 0);
        out4 = out4 || new Vec2(0, 0);
        var worldMatrix = this.entity.transform.getLocalToWorldMatrix();
        _doGetOrientedBounds.call(this, worldMatrix, out1, out2, out3, out4);
        return [out1, out2, out3, out4];
    };

    Renderer.prototype.getSelfMatrix = function (out) {
    };

    Renderer.prototype.getWorldSize = function () {
        return new Vec2(0, 0);
    };

    function _doGetOrientedBounds(mat, bl, tl, tr, br) {
        var size = this.getWorldSize();
        var width = size.x;
        var height = size.y;

        this.getSelfMatrix(tempMatrix);
        mat = tempMatrix.prepend(mat);

        // transform rect(0, 0, width, height) by matrix
        var tx = mat.tx;
        var ty = mat.ty;
        var xa = mat.a * width;
        var xb = mat.b * width;
        var yc = mat.c * -height;
        var yd = mat.d * -height;

        tl.x = tx;
        tl.y = ty;
        tr.x = xa + tx;
        tr.y = xb + ty;
        bl.x = yc + tx;
        bl.y = yd + ty;
        br.x = xa + yc + tx;
        br.y = xb + yd + ty;
    }

    return Renderer;
})();

Fire.Renderer = Renderer;

var SpriteRenderer = (function () {

    var SpriteRenderer = Fire.extend('Fire.SpriteRenderer', Renderer, function () {
        RenderContext.initRenderer(this);
        this._hasRenderObj = false;
    });
    Fire.addComponentMenu(SpriteRenderer, 'SpriteRenderer');
    Fire.executeInEditMode(SpriteRenderer);

    SpriteRenderer.prop('_sprite', null, Fire.HideInInspector);
    SpriteRenderer.getset('sprite',
        function () {
            return this._sprite;
        },
        function (value) {
            this._sprite = value;
            if (this._hasRenderObj) {
                Engine._renderContext.updateMaterial(this);
            }
        },
        Fire.ObjectType(Fire.Sprite)
    );

    SpriteRenderer.prop('_color', new Fire.Color(1, 1, 1, 1), Fire.HideInInspector);
    SpriteRenderer.getset('color',
        function () {
            return this._color;
        },
        function (value) {
            this._color = value;
            if (this._hasRenderObj) {
                Engine._renderContext.updateSpriteColor(this);
            }
        }
    );

    SpriteRenderer.prop('customSize_', false, Fire.HideInInspector);
    SpriteRenderer.getset('customSize',
        function () {
            return this.customSize_;
        },
        function (value) {
            this.customSize_ = value;
        }
    );

    SpriteRenderer.prop('width_', 100, Fire.DisplayName('Width'),
                        Fire.Watch( 'customSize_', function ( obj, propEL ) {
                            propEL.disabled = !obj.customSize_;
                        } ));
    SpriteRenderer.getset('width',
        function () {
            if ( !this.customSize_ ) {
                return Fire.isValid(this._sprite) ? this._sprite.width : 0;
            }
            else {
                return this.width_;
            }
        },
        function (value) {
            this.width_ = value;
        },
        Fire.HideInInspector
    );

    SpriteRenderer.prop('height_', 100, Fire.DisplayName('Height'),
                        Fire.Watch( 'customSize_', function ( obj, propEL) {
                            propEL.disabled = !obj.customSize;
                        } ));
    SpriteRenderer.getset('height',
        function () {
            if ( !this.customSize_ ) {
                return Fire.isValid(this._sprite) ? this._sprite.height : 0;
            }
            else {
                return this.height_;
            }
        },
        function (value) {
            this.height_ = value;
        },
        Fire.HideInInspector
    );

    // built-in functions

    SpriteRenderer.prototype.onLoad = function () {
        Engine._renderContext.addSprite(this);
        this._hasRenderObj = true;
    };
    SpriteRenderer.prototype.onEnable = function () {
        Engine._renderContext.show(this, true);
    };
    SpriteRenderer.prototype.onDisable = function () {
        Engine._renderContext.show(this, false);
    };

    SpriteRenderer.prototype.getWorldSize = function () {
        return new Fire.Vec2(this.width, this.height);
    };

    var tempMatrix = new Fire.Matrix23();

    SpriteRenderer.prototype.onPreRender = function () {
        this.getSelfMatrix(tempMatrix);
        if (this._sprite) {
            // calculate render matrix
            //   scale
            tempMatrix.a = this.width / this._sprite.width;
            tempMatrix.d = this.height / this._sprite.height;
            //   rotate cw
            if (this._sprite.rotated) {
                tempMatrix.b = tempMatrix.d;
                tempMatrix.c = -tempMatrix.a;
                tempMatrix.a = 0;
                tempMatrix.d = 0;
                tempMatrix.ty -= this.height;
            }
        }
        tempMatrix.prepend(this.transform._worldTransform);
        Engine._curRenderContext.updateTransform(this, tempMatrix);
    };
    SpriteRenderer.prototype.onDestroy = function () {
        Engine._renderContext.remove(this);
    };

    // 返回表示 sprite 的 width/height/pivot/skew/shear 等变换的 matrix，
    // 由于这些变换不影响子物体，所以不能放到 getLocalToWorldMatrix
    SpriteRenderer.prototype.getSelfMatrix = function (out) {
        var w = this.width;
        var h = this.height;

        var pivotX = 0.5;
        var pivotY = 0.5;

        //var rotated = false;
        if (Fire.isValid(this._sprite)) {
            //rotated = this._sprite.rotated;
            pivotX = this._sprite.pivot.x;
            pivotY = this._sprite.pivot.y;
        }

        //if ( !rotated ) {
            out.a = 1;
            out.b = 0;
            out.c = 0;
            out.d = 1;
            out.tx = - pivotX * w;
            out.ty = (1.0 - pivotY) * h;
        //}
        //else {
        //    // CCW
        //    //out.a = 0;
        //    //out.b = scaleY;
        //    //out.c = -scaleX;
        //    //out.d = 0;
        //    //out.tx = - (pivotY - 1.0) * w;
        //    //out.ty = - pivotX * h;
        //
        //    // CW
        //    out.a = 0;
        //    out.b = -scaleY;
        //    out.c = scaleX;
        //    out.d = 0;
        //    out.tx = (1.0 - pivotX) * w;
        //    out.ty = (1.0 - pivotY) * h;
        //}
    };

    return SpriteRenderer;
})();

Fire.SpriteRenderer = SpriteRenderer;


var BitmapText = (function () {

    var TextAlign = Fire.defineEnum({
        left: -1,
        center: -1,
        right: -1
    });

    var TextAnchor = (function (t) {
        t[t.topLeft = 0] = 'Top Left';
        t[t.topCenter = 1] = 'Top Center';
        t[t.topRight = 2] = 'Top Right';
        t[t.midLeft = 3] = 'Middle Left';
        t[t.midCenter = 4] = 'Middle Center';
        t[t.midRight = 5] = 'Middle Right';
        t[t.botLeft = 6] = 'Bottom Left';
        t[t.botCenter = 7] = 'Bottom Center';
        t[t.botRight = 8] = 'Bottom Right';
        return t;
    })({});


    //-- 增加 Bitmap Text 到 组件菜单上
    var BitmapText = Fire.extend("Fire.BitmapText", Renderer, function () {
        RenderContext.initRenderer(this);
    });

    BitmapText.TextAlign = TextAlign;
    BitmapText.TextAnchor = TextAnchor;

    //-- 增加 Bitmap Text 到 组件菜单上
    Fire.addComponentMenu(BitmapText, 'BitmapText');
    Fire.executeInEditMode(BitmapText);

    BitmapText.prop('_bitmapFont', null, Fire.HideInInspector);
    BitmapText.getset('bitmapFont',
        function () {
            return this._bitmapFont;
        },
        function (value) {
            this._bitmapFont = value;
            Engine._renderContext.updateBitmapFont(this);
        },
        Fire.ObjectType(Fire.BitmapFont)
    );

    BitmapText.prop('_text', 'Text', Fire.HideInInspector);
    BitmapText.getset('text',
        function () {
            return this._text;
        },
        function (value) {
            if (this._text !== value) {
                if (typeof value === 'string') {
                    this._text = value;
                }
                else {
                    this._text = '' + value;
                }
                Engine._renderContext.setText(this, this._text);
            }
        },
        Fire.MultiText
    );

    BitmapText.prop('_anchor', BitmapText.TextAnchor.midCenter, Fire.HideInInspector);
    BitmapText.getset('anchor',
        function () {
            return this._anchor;
        },
        function (value) {
            if (this._anchor !== value) {
                this._anchor = value;
            }
        },
        Fire.Enum(BitmapText.TextAnchor)
    );

    BitmapText.prop('_align', BitmapText.TextAlign.left, Fire.HideInInspector);
    BitmapText.getset('align',
        function () {
            return this._align;
        },
        function (value) {
            if (this._align !== value) {
                this._align = value;
                Engine._renderContext.setAlign(this, value);
            }
        },
        Fire.Enum(BitmapText.TextAlign)
    );

    BitmapText.prototype.onLoad = function () {
        Engine._renderContext.addBitmapText(this);
    };

    BitmapText.prototype.onEnable = function () {
        Engine._renderContext.show(this, true);
    };

    BitmapText.prototype.onDisable = function () {
        Engine._renderContext.show(this, false);
    };

    BitmapText.prototype.onDestroy = function () {
        Engine._renderContext.remove(this);
    };

    BitmapText.prototype.getWorldSize = function () {
        return Engine._renderContext.getTextSize(this);
    };

    var tempMatrix = new Fire.Matrix23();

    BitmapText.prototype.onPreRender = function () {
        this.getSelfMatrix(tempMatrix);
        tempMatrix.prepend(this.transform._worldTransform);
        PixiBitmapFontUtil.updateTransform(this, tempMatrix);
    };

    BitmapText.prototype.getSelfMatrix = function (out) {
        var textSize = Engine._renderContext.getTextSize(this);
        var w = textSize.x;
        var h = textSize.y;

        var anchorOffsetX = 0;
        var anchorOffsetY = 0;

        switch (this._anchor) {
            case BitmapText.TextAnchor.topLeft:
                break;
            case BitmapText.TextAnchor.topCenter:
                anchorOffsetX = w * -0.5;
                break;
            case BitmapText.TextAnchor.topRight:
                anchorOffsetX = -w;
                break;
            case BitmapText.TextAnchor.midLeft:
                anchorOffsetY = h * 0.5;
                break;
            case BitmapText.TextAnchor.midCenter:
                anchorOffsetX = w * -0.5;
                anchorOffsetY = h * 0.5;
                break;
            case BitmapText.TextAnchor.midRight:
                anchorOffsetX = -w;
                anchorOffsetY = h * 0.5;
                break;
            case BitmapText.TextAnchor.botLeft:
                anchorOffsetY = h;
                break;
            case BitmapText.TextAnchor.botCenter:
                anchorOffsetX = w * -0.5;
                anchorOffsetY = h;
                break;
            case BitmapText.TextAnchor.botRight:
                anchorOffsetX = -w;
                anchorOffsetY = h;
                break;
            default:
                break;
        }
        out.a = 1;
        out.b = 0;
        out.c = 0;
        out.d = 1;
        out.tx = anchorOffsetX;
        out.ty = anchorOffsetY;
    };

    return BitmapText;
})();

Fire.BitmapText = BitmapText;

var Camera = Fire.Class({
    name: 'Fire.Camera',
    extends: Component,
    constructor: function () {
        this._renderContext = null;
        this._contentStrategyInst = null;
    },

    properties: {

        _background: {
            default: Fire.Color.black,
            hideInInspector: true
        },
        background: {
            get: function () {
                return this._background;
            },
            set: function (value) {
                this._background = value;
                if (this._renderContext) {
                    this._renderContext.background = value;
                }
            }
        },

        _size: {
            default: 800,
            hideInInspector: true
        },
        size: {
            get: function () {
                return this._size;
            },
            set: function (value) {
                this._size = value;
            },
            tooltip: "The height of design resolution. Width varies depending on viewport's aspect ratio",
            watch: {
                '_contentStrategy': function (obj, propEL) {
                    propEL.disabled = (obj._contentStrategy === Fire.ContentStrategyType.NoScale);
                }
            }
        },

        _contentStrategy: {
            default: Fire.ContentStrategyType.FixedHeight,
            hideInInspector: true
        },
        contentStrategy: {
            type: Fire.ContentStrategyType,
            get: function () {
                return this._contentStrategy;
            },
            set: function (value) {
                this._contentStrategy = value;
                this._contentStrategyInst = Fire.Screen.ContentStrategy.fromType(value);
            },
            displayName: 'Scale Strategy',
            tooltip: "The type of scale strategy for this camera"
        },

        viewportInfo: {
            get: function (value) {
                var viewportSize = (this._renderContext || Engine._renderContext).size;
                return this._contentStrategyInst.apply(new Vec2(0, this._size), viewportSize);
            },
            hideInInspector: true
        },

        // save the render context this camera belongs to, if null, main render context will be used.
        renderContext: {
            set: function (value) {
                this._renderContext = value;
                //                this._applyRenderSettings();
            },
            hideInInspector: true
        }
    },

    // built-in functions
    onLoad: function () {
        if (!(this.entity._objFlags & HideInGame)) {
            this.renderContext = Engine._renderContext;
        }
        this._contentStrategyInst = Fire.Screen.ContentStrategy.fromType(this._contentStrategy);
    },
    onEnable: function () {
        if (!(this.entity._objFlags & HideInGame)) {
            Engine._scene.camera = this;
            this._applyRenderSettings();
        }
    },
    onDisable: function () {
        if (Engine._scene.camera === this) {
            Engine._scene.camera = null;
        }
        this._renderContext.camera = null;
    },

    // other functions

    /**
     * Transforms position from viewport space into screen space.
     * @method Fire.Camera#viewportToScreen
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    viewportToScreen: function (position, out) {
        out = this._renderContext.size.scale(position, out);
        return out;
    },

    /**
     * Transforms position from screen space into viewport space.
     * @method Fire.Camera#screenToViewport
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    screenToViewport: function (position, out) {
        out = out || new Vec2();
        var size = this._renderContext.size;
        out.x = position.x / size.x;
        out.y = position.y / size.y;
        return out;
    },

    /**
     * Transforms position from viewport space into world space.
     * @method Fire.Camera#viewportToWorld
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    viewportToWorld: function (position, out) {
        out = this.viewportToScreen(position, out);
        return this.screenToWorld(out, out);
    },

    /**
     * Transforms position from screen space into world space.
     * @method Fire.Camera#screenToWorld
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    screenToWorld: function (position, out) {
        var halfScreenSize = (this._renderContext || Engine._renderContext).size.mulSelf(0.5);
        var pivotToScreen = position.sub(halfScreenSize, halfScreenSize);
        pivotToScreen.y = -pivotToScreen.y; // 屏幕坐标的Y和世界坐标的Y朝向是相反的
        var mat = new Matrix23();
        var camPos = new Vec2();
        this._calculateTransform(mat, camPos);
        mat.invert();
        mat.tx = camPos.x;
        mat.ty = camPos.y;
        return mat.transformPoint(pivotToScreen, out);
    },

    /**
     * Transforms position from world space into screen space.
     * @method Fire.Camera#worldToScreen
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    worldToScreen: function (position, out) {
        var mat = new Matrix23();
        var camPos = new Vec2();
        this._calculateTransform(mat, camPos);
        var toCamera = position.sub(camPos, camPos);
        out = mat.transformPoint(toCamera, out);
        var height = (this._renderContext || Engine._renderContext).size.y;
        out.y = height - out.y;
        return out;
    },

    /**
     * Transforms position from world space into viewport space.
     * @method Fire.Camera#worldToViewport
     * @param {Fire.Vec2} position
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @return {Fire.Vec2}
     */
    worldToViewport: function (position, out) {
        out = this.worldToScreen(position, out);
        return this.screenToViewport(out, out);
    },

    _calculateTransform: function (out_matrix, out_worldPos) {
        var viewportInfo = this.viewportInfo;
        var scale = viewportInfo.scale;
        var viewport = viewportInfo.viewport;

        var tf = this.entity.transform;
        var mat = tf.getLocalToWorldMatrix();

        out_worldPos.x = mat.tx;
        out_worldPos.y = mat.ty;

        out_matrix.identity();
        out_matrix.tx = viewport.width * 0.5;
        out_matrix.ty = viewport.height * 0.5;
        out_matrix.a = scale.x;
        out_matrix.d = scale.y;
        out_matrix.rotate(mat.getRotation());
    },

    _applyRenderSettings: function () {
        this._renderContext.background = this._background;
    },
});

Fire.addComponentMenu(Camera, 'Camera');
Fire.executeInEditMode(Camera);

//Object.defineProperty(Camera.prototype, 'scaleStrategyInst', {
//    get: function (value) {
//        if ( !this._cachedResolutionPolicy ) {
//            this._cachedResolutionPolicy = Fire.Screen.ResolutionPolicy.fromType(this._resolutionPolicy);
//        }
//        return this._cachedResolutionPolicy;
//    }
//});

Fire.Camera = Camera;

var MissingScript = (function () {

    /**
     * A temp fallback to contain the original component which can not be loaded.
     * Actually, this class will be used whenever a class failed to deserialize,
     * regardless of whether it is component.
     */
    var MissingScript = Fire.extend('Fire.MissingScript', Component);

    MissingScript.prototype.onLoad = function () {
        Fire.warn('The referenced script on this Component is missing!');
    };

    return MissingScript;
})();

Fire._MissingScript = MissingScript;

/**
 * The InteractionContext contains all the entities which can be interact with.
 * @private
 */
var InteractionContext = (function () {

    var aabbMap = {};   // all axis aligned bounding boxes in current frame, indexed by id
    var obbMap = {};    // all oriented bounding boxes in current frame, indexed by id

    function InteractionContext () {
        this.entities = [];   // array of interactable entities in this context, sorted from back to front
    }

    InteractionContext.prototype._clear = function () {
        this.entities.length = 0;
    };

    /**
     * Pick the top most entity, using their oriented bounding boxes.
     * @param {Fire.Vec2} worldPosition
     * @return {Fire.Entity}
     */
    InteractionContext.prototype.pick = function (worldPosition) {
        for (var i = this.entities.length - 1; i >= 0; --i) {
            var entity = this.entities[i];
            if (entity.isValid) {
                // aabb test
                var aabb = aabbMap[entity.id];
                if (aabb.contains(worldPosition)) {
                    // obb test
                    var obb = obbMap[entity.id];
                    var polygon = new Fire.Polygon(obb);
                    if (polygon.contains(worldPosition)) {
                        return entity;
                    }
                }
            }
        }
        return null;
    };

    InteractionContext.prototype._updateRecursilvey = function (entity) {
        var renderer = entity.getComponent(Fire.Renderer);
        if (renderer && renderer._enabled) {
            this.entities.push(entity);
            var id = entity.id;
            if ( !obbMap[id] ) {
                var obb = renderer.getWorldOrientedBounds();
                var aabb = Math.calculateMaxRect(new Rect(), obb[0], obb[1], obb[2], obb[3]);
                obbMap[id] = obb;
                aabbMap[id] = aabb;
            }
        }

        for ( var i = 0, len = entity._children.length; i < len; ++i ) {
            var child = entity._children[i];
            if (child._active) {
                this._updateRecursilvey(child);
            }
        }
    };

    InteractionContext.prototype.update = function (entities) {
        // 目前还没有专门处理physics的模块，暂时hack一下
        var newFrame = !Engine.isPlaying || this === Engine._interactionContext;
        if (newFrame) {
            aabbMap = {};
            obbMap = {};
        }

        // clear intersection data
        this._clear();

        // recursively process each entity
        for (var i = 0, len = entities.length; i < len; ++i) {
            var entity = entities[i];
            if (entity._active) {
                this._updateRecursilvey(entity);
            }
        }
    };

    // entity 必须是 entities 里面的
    InteractionContext.prototype.getAABB = function (entity) {
        return aabbMap[entity.id];
    };

    // entity 必须是 entities 里面的
    InteractionContext.prototype.getOBB = function (entity) {
        return obbMap[entity.id];
    };

    return InteractionContext;
})();

Fire._InteractionContext = InteractionContext;

var Entity = Fire.Class({

    name: 'Fire.Entity', extends: EventTarget,

    constructor: function () {
        var name = arguments[0];

        this._name = typeof name !== 'undefined' ? name : 'New Entity';
        this._objFlags |= Entity._defaultFlags;

        if (Fire._isCloning) {
            // create by deserializer or instantiating

            this._activeInHierarchy = false;
        }
        else {
            // create dynamically

            this._activeInHierarchy = true;
            // init transform
            var transform = new Transform();
            transform.entity = this;
            this._components = [transform];
            this.transform = transform;
            // add to scene
            if (Engine._scene) {
                Engine._scene.appendRoot(this);
            }
            // invoke callbacks
            Engine._renderContext.onRootEntityCreated(this);

            // activate componet
            transform._onEntityActivated(true);     // 因为是刚刚创建，所以 activeInHierarchy 肯定为 true

        }
    },

    properties: {

        name: {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            }
        },

        active: {
            get: function () {
                return this._active;
            },
            set: function (value) {
                // jshint eqeqeq: false
                if (this._active != value) {
                    // jshint eqeqeq: true
                    this._active = value;
                    var canActiveInHierarchy = (!this._parent || this._parent._activeInHierarchy);
                    if (canActiveInHierarchy) {
                        this._onActivatedInHierarchy(value);
                    }
                }
            }
        },

        activeInHierarchy: {
            get: function () {
                return this._activeInHierarchy;
            }
        },

        transform: {
            default: null,
            hideInInspector: true
        },

        /**
         * The parent of the entity.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify the world space position, scale and rotation.
         * @property {Fire.Entity} Fire.Entity#parent
         */
        parent: {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                if (this._parent !== value) {
                    if (value === this) {
                        Fire.warn("A entity can't be set as the parent of itself.");
                        return;
                    }
                    if (value && !(value instanceof Entity)) {
                        if (value instanceof Transform) {
                            Fire.error('Entity.parent can not be a Transform, use transform.entity instead.');
                        }
                        else {
                            Fire.error('Entity.parent must be instance of Entity (or must be null)');
                        }
                        return;
                    }
                    var oldParent = this._parent;
                    if (value) {
                        if ((value._objFlags & HideInGame) && !(this._objFlags & HideInGame)) {
                            Fire.error('Failed to set parent, the child\'s HideInGame must equals to parent\'s.');
                            return;
                        }
                        if ((value._objFlags & HideInEditor) && !(this._objFlags & HideInEditor)) {
                            Fire.error('Failed to set parent, the child\'s HideInEditor must equals to parent\'s.');
                            return;
                        }
                        if (!oldParent) {
                            Engine._scene.removeRoot(this);
                        }
                        value._children.push(this);
                    }
                    else {
                        Engine._scene.appendRoot(this);
                    }
                    this._parent = value || null;
                    this.transform._parent = this._parent && this._parent.transform;

                    if (oldParent && !(oldParent._objFlags & Destroying)) {
                        oldParent._children.splice(oldParent._children.indexOf(this), 1);
                        this._onHierarchyChanged(oldParent);
                    }
                    Engine._renderContext.onEntityParentChanged(this, oldParent);
                    //this._onHierarchyChanged(this, oldParent);
                }
            }
        },

        /**
         * Get the amount of children
         * @property {number} Fire.Entity#childCount
         */
        childCount: {
            get: function () {
                return this._children.length;
            },
            hideInInspector: true
        },

        dontDestroyOnLoad: {
            get: function () {
                return this.dontDestroyOnLoad;
            },
            set: function (value) {
                if (value) {
                    this._objFlags |= DontDestroy;
                }
                else {
                    this._objFlags &= ~DontDestroy;
                }
            }
        },

        // internal properties

        _active: {
            default: true,
            hideInInspector: true
        },
        _parent: {
            default: null,
            hideInInspector: true
        },
        _children: {
            default: [],
            hideInInspector: true
        },
        _components: {
            default: null,
            hideInInspector: true
        }
    },

    ////////////////////////////////////////////////////////////////////
    // overrides
    ////////////////////////////////////////////////////////////////////

    destroy: function () {
        if (FObject.prototype.destroy.call(this)) {
            // disable hierarchy
            if (this._activeInHierarchy) {
                this._deactivateChildComponents();
            }
        }
    },

    _onPreDestroy: function () {
        var parent = this._parent;
        this._objFlags |= Destroying;
        var isTopMost = !(parent && (parent._objFlags & Destroying));
        if (isTopMost) {
            Engine._renderContext.onEntityRemoved(this);
        }
        // destroy components
        for (var c = 0; c < this._components.length; ++c) {
            var component = this._components[c];
            // destroy immediate so its _onPreDestroy can be called before
            component._destroyImmediate();
        }
        // remove self
        if (parent) {
            if (isTopMost) {
                parent._children.splice(parent._children.indexOf(this), 1);
            }
        }
        else {
            Engine._scene.removeRoot(this);
        }
        // destroy children
        var children = this._children;
        for (var i = 0, len = children.length; i < len; ++i) {
            // destroy immediate so its _onPreDestroy can be called before
            children[i]._destroyImmediate();
        }
    },

    /**
     * Get all the targets listening to the supplied type of event in the target's capturing phase.
     * The capturing phase comprises the journey from the root to the last node BEFORE the event target's node.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     * Subclasses can override this method to make event propagable.
     *
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     */
    _getCapturingTargets: function (type, array) {
        for (var target = this._parent; target; target = target._parent) {
            if (target._activeInHierarchy && target._capturingListeners && target._capturingListeners.has(type)) {
                array.push(target);
            }
        }
    },

    /**
     * Get all the targets listening to the supplied type of event in the target's bubbling phase.
     * The bubbling phase comprises any SUBSEQUENT nodes encountered on the return trip to the root of the hierarchy.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     * Subclasses can override this method to make event propagable.
     *
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     */
    _getBubblingTargets: function (type, array) {
        for (var target = this._parent; target; target = target._parent) {
            if (target._activeInHierarchy && target._bubblingListeners && target._bubblingListeners.has(type)) {
                array.push(target);
            }
        }
    },

    /**
     * Send an event to this object directly, this method will not propagate the event to any other objects.
     *
     * @param {Fire.Event} event - The Event object that is sent to this event target.
     */
    _doSendEvent: function (event) {
        if (this._activeInHierarchy) {
            Entity.$super.prototype._doSendEvent.call(this, event);
        }
    },

    ////////////////////////////////////////////////////////////////////
    // component methods
    ////////////////////////////////////////////////////////////////////

    /**
     * @param {function|string} typeOrTypename
     * @return {Component}
     */
    addComponent: function (typeOrTypename) {
        var constructor;
        if (typeof typeOrTypename === 'string') {
            constructor = JS.getClassByName(typeOrTypename);
            if ( !constructor ) {
                Fire.error('[addComponent] Failed to get class "%s"');
                if (_requiringFrames.length > 0) {
                    Fire.error('You should not add component when the scripts are still loading.', typeOrTypename);
                }
                return null;
            }
        }
        else {
            if ( !typeOrTypename ) {
                Fire.error('[addComponent] Type must be non-nil');
                return null;
            }
            constructor = typeOrTypename;
        }
        if (this._objFlags & Destroying) {
            Fire.error('isDestroying');
            return null;
        }
        if (typeof constructor !== 'function') {
            Fire.error("The component to add must be a constructor");
            return null;
        }
        var component = new constructor();
        component.entity = this;
        this._components.push(component);

        if (this._activeInHierarchy) {
            // call onLoad/onEnable
            component._onEntityActivated(true);
        }

        return component;
    },

    /**
     * @param {function|string} typeOrTypename
     * @return {Component}
     */
    getComponent: function (typeOrTypename) {
        if ( !typeOrTypename ) {
            Fire.error('Argument must be non-nil');
            return;
        }
        var constructor;
        if (typeof typeOrTypename === 'string') {
            constructor = JS.getClassByName(typeOrTypename);
        }
        else {
            constructor = typeOrTypename;
        }
        for (var c = 0; c < this._components.length; ++c) {
            var component = this._components[c];
            if (component instanceof constructor) {
                return component;
            }
        }
        return null;
    },

    _removeComponent: function (component) {
        /*if (!component) {
            Fire.error('Argument must be non-nil');
            return;
        }*/
        if (!(this._objFlags & Destroying)) {
            //if (component.onHierarchyChanged) {
            //    this.transform._removeListener(component);
            //}
            var i = this._components.indexOf(component);
            if (i !== -1) {
                this._components.splice(i, 1);
                component.entity = null;
            }
            else if (component.entity !== this) {
                Fire.error("Component not owned by this entity");
            }
        }
    },

    ////////////////////////////////////////////////////////////////////
    // hierarchy methods
    ////////////////////////////////////////////////////////////////////

    find: function (path) {
        if (!path && path !== '') {
            Fire.error('Argument must be non-nil');
            return;
        }
        if (path[0] === '/') {
            Fire.error("Path should not start with a '/' character, please use \"Fire.Entity.find\" instead");
            return;
        }
        var nameList = path.split('/');

        var match = this;
        var t = 0, len = 0, children = null, subEntity = null;
        for (var i = 0; i < nameList.length; i++) {
            var name = nameList[i];
            if (name === '..') {
                if (!match) {
                    return null;
                }
                match = match._parent;
            }
            else {
                if (!match) {
                    children = Engine._scene.entities;
                }
                else {
                    children = match._children;
                }
                match = null;
                for (t = 0, len = children.length; t < len; ++t) {
                    subEntity = children[t];
                    if (subEntity.name === name) {
                        match = subEntity;
                    }
                }
                if (!match) {
                    return null;
                }
            }
        }
        return match;
    },

    getChild: function (index) {
        return this._children[index];
    },

    getChildren: function () {
        return this._children.slice();
    },

    /**
     * is or is child of
     */
    isChildOf: function (parent) {
        var child = this;
        do {
            if (child === parent) {
                return true;
            }
            child = child._parent;
        }
        while (child);
        return false;
    },

    /**
     * Get the sibling index.
     * NOTE: If this entity does not have parent and not belongs to the current scene,
     *       The return value will be -1
     *
     * @method Fire.Entity#getSiblingIndex
     * @return {number}
     */
    getSiblingIndex: function () {
        if (this._parent) {
            return this._parent._children.indexOf(this);
        }
        else {
            return Engine._scene.entities.indexOf(this);
        }
    },

    /**
     * Get the indexed sibling.
     * @method Fire.Entity#getSibling
     * @param {number} index
     * @return {Fire.Entity}
     */
    getSibling: function (index) {
        if (this._parent) {
            return this._parent._children[index];
        }
        else {
            return Engine._scene.entities[index];
        }
    },

    /**
     * Set the sibling index.
     * @method Fire.Entity#setSiblingIndex
     * @param {number} index
     */
    setSiblingIndex: function (index) {
        var array = this._parent ? this._parent._children : Engine._scene.entities;
        var item = this;
        index = index !== -1 ? index : array.length - 1;
        var oldIndex = array.indexOf(item);
        if (index !== oldIndex) {
            array.splice(oldIndex, 1);
            if (index < array.length) {
                array.splice(index, 0, item);
            }
            else {
                array.push(item);
            }
            // callback
            Engine._renderContext.onEntityIndexChanged(this, oldIndex, index);
            //this._onHierarchyChanged(this, this.parent);
        }
    },

    /**
     * Move the entity to the top.
     * @method Fire.Entity#setAsFirstSibling
     */
    setAsFirstSibling: function () {
        this.setSiblingIndex(0);
    },

    /**
     * Move the entity to the bottom.
     * @method Fire.Entity#setAsFirstSibling
     */
    setAsLastSibling: function () {
        this.setSiblingIndex(-1);
    },

    ////////////////////////////////////////////////////////////////////
    // other methods
    ////////////////////////////////////////////////////////////////////

    _onActivatedInHierarchy: function (value) {
        this._activeInHierarchy = value;

        // 当引入DestroyImmediate后，_components的元素有可能会在遍历过程中变少，需要复制一个新的数组，或者做一些标记
        // var components = this._components.slice();

        // component有可能在onEnable时增加，而新增的component已经onEnable了，所以这里事先记下长度，以免重复调用
        var countBefore = this._components.length;
        for (var c = 0; c < countBefore; ++c) {
            var component = this._components[c];
            component._onEntityActivated(value);
        }
        // activate children recursively
        for (var i = 0, len = this.childCount; i < len; ++i) {
            var entity = this._children[i];
            if (entity._active) {
                entity._onActivatedInHierarchy(value);
            }
        }
    },

    _deactivateChildComponents: function () {
        // 和 _onActivatedInHierarchy 类似但不修改 this._activeInHierarchy
        var countBefore = this._components.length;
        for (var c = 0; c < countBefore; ++c) {
            var component = this._components[c];
            component._onEntityActivated(false);
        }
        // deactivate children recursively
        for (var i = 0, len = this.childCount; i < len; ++i) {
            var entity = this._children[i];
            if (entity._active) {
                entity._deactivateChildComponents();
            }
        }
    },

    _onHierarchyChanged: function (oldParent) {
        var activeInHierarchyBefore = this._active && (!oldParent || oldParent._activeInHierarchy);
        var shouldActiveNow = this._active && (!this._parent || this._parent._activeInHierarchy);
        if (activeInHierarchyBefore !== shouldActiveNow) {
            this._onActivatedInHierarchy(shouldActiveNow);
        }
    },

    _instantiate: function (position, rotation) {
        // 临时实现版本，之后应该不拷贝scene object
        var oldParent = this._parent;
        this._parent = null;
        var clone = Fire._doInstantiate(this);
        this._parent = oldParent;
        // init
        if (Engine.isPlaying) {
            clone._name = this._name + '(Clone)';
        }
        if (position) {
            clone.transform._position = position;
        }
        if (rotation) {
            clone.transform._rotation = rotation;
        }
        if (Engine._scene) {
            Engine._scene.appendRoot(clone);
        }

        // invoke callbacks
        Engine._renderContext.onEntityCreated(clone, true);
        // activate components
        if (clone._active) {
            clone._onActivatedInHierarchy(true);
        }

        return clone;
    }
});

////////////////////////////////////////////////////////////////////
// static
////////////////////////////////////////////////////////////////////

/**
 * the temp property that indicates the current creating entity should
 * binded with supplied object flags.
 * only used in editor
 *
 * @property {number} Entity._defaultFlags
 * @private
 */
Entity._defaultFlags = 0;

/**
 * Finds an entity by hierarchy path, the path is case-sensitive, and must start with a '/' character.
 * It will traverse the hierarchy by splitting the path using '/' character.
 * It is recommended to not use this function every frame instead cache the result at startup.
 * @method Fire.Entity.find
 * @param {string} path
 * @return {Fire.Entity} the entity or null if not found
 */
Entity.find = function (path) {
    if (!path && path !== '') {
        Fire.error('Argument must be non-nil');
        return;
    }
    if (path[0] !== '/') {
        Fire.error("Path must start with a '/' character");
        return;
    }
    return Engine._scene.findEntity(path);
};

Fire.Entity = Entity;

var Scene = (function () {
    var _super = Asset;
    /**
     * @class Fire.Scene
     * @extends Fire.Asset
     * @private
     */
    function Scene () {
        _super.call(this);

        /**
         * root entities
         * @member {Fire.Entity[]} Fire.Scene#entities
         */
        this.entities = [];

        /**
         * the active camera
         * @member {Fire.Camera} Fire.Scene#camera
         */
        this.camera = null;
    }
    JS.extend(Scene, _super);
    JS.setClassName("Fire.Scene", Scene);

    ////////////////////////////////////////////////////////////////////
    // static
    ////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////
    // traversal operations
    ////////////////////////////////////////////////////////////////////

    var visitOperationTmpl = "if(c._enabled && c._FUNC_) c._FUNC_();";
    // 当引入DestroyImmediate后，entity和component可能会在遍历过程中变少，需要复制一个新的数组，或者做一些标记
    var visitFunctionTmpl = "\
(function(e){\
	var i, len=e._components.length;\
	for(i=0;i<len;++i){\
		var c=e._components[i];\
		" + visitOperationTmpl + "\
	}\
	var cs=e._children;\
	for(i=0,len=cs.length;i<len;++i){\
		var sub=cs[i];\
		if(sub._active) _FUNC_Recursively(sub);\
	}\
})";

    // jshint evil: true
    var updateRecursively = eval(visitFunctionTmpl.replace(/_FUNC_/g, 'update'));
    var lateUpdateRecursively = eval(visitFunctionTmpl.replace(/_FUNC_/g, 'lateUpdate'));
    var onPreRenderRecursively = eval(visitFunctionTmpl.replace(/_FUNC_/g, 'onPreRender'));
    // jshint evil: false

    Scene.prototype.update = function () {
        // call update
        var entities = this.entities;
        var i = 0, len = entities.length;
        // invoke onStart
        // TODO: 使用一个数组将需要调用的 onStart 存起来，避免递归遍历
        for (; i < len; ++i) {
            Component._invokeStarts(entities[i]);
        }
        // invoke update
        for (i = 0, len = entities.length; i < len; ++i) {
            if (entities[i]._active) {
                updateRecursively(entities[i]);
            }
        }
        // invoke lateUpdate
        for (i = 0, len = entities.length; i < len; ++i) {
            if (entities[i]._active) {
                lateUpdateRecursively(entities[i]);
            }
        }
    };

    Scene.prototype.render = function (renderContext) {
        Engine._curRenderContext = renderContext;

        // updateTransform
        this.updateTransform(renderContext.camera || this.camera);

        // call onPreRender
        var entities = this.entities;
        for (var i = 0, len = entities.length; i < len; ++i) {
            if (entities[i]._active) {
                onPreRenderRecursively(entities[i]);
            }
        }

        // render
        renderContext.render();

        Engine._curRenderContext = null;
    };

    ////////////////////////////////////////////////////////////////////
    // other functions
    ////////////////////////////////////////////////////////////////////

    Scene.prototype.updateTransform = function (camera) {
        var entities = this.entities;
        var i, len;
        if (camera) {
            // transform by camera
            var mat = new Matrix23();
            var camPos = new Vec2();
            camera._calculateTransform(mat, camPos);
            var offsetX = -camPos.x;
            var offsetY = -camPos.y;
            for (i = 0, len = entities.length; i < len; ++i) {
                var pos = entities[i].transform._position;
                var x = pos.x;
                var y = pos.y;
                pos.x += offsetX;
                pos.y += offsetY;
                entities[i].transform._updateTransform(mat);
                pos.x = x;
                pos.y = y;
            }
        }
        else {
            // transform
            for (i = 0, len = entities.length; i < len; ++i) {
                entities[i].transform._updateRootTransform();
            }
        }
    };

    Scene.prototype.appendRoot = function (_entity) {
        this.entities.push(_entity);
    };

    Scene.prototype.removeRoot = function (_entity) {
        // TODO: performence test
        var entities = this.entities;
        if (entities.length > 0 && entities[entities.length - 1] === _entity) {
            entities.pop();
            return;
        }
        var index = entities.indexOf(_entity);
        if (index !== -1) {
            entities.splice(index, 1);
        }
        else {
            Fire.error('entity ' + _entity + ' not contains in roots of hierarchy, ' +
                       'is may caused if entity not destroyed immediate before current scene changed');
        }
    };

    Scene.prototype.findEntity = function (path) {
        var nameList = path.split('/');
        var match = null;

        // visit root entities
        var name = nameList[1];     // skip first '/'
        var entities = this.entities;
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].isValid && entities[i]._name === name) {
                match = entities[i];
                break;
            }
        }
        if (!match) {
            return null;
        }

        // parse path
        var n = 2;                  // skip first '/' and roots
        for (n; n < nameList.length; n++) {
            name = nameList[n];
            // visit sub entities
            var children = match._children;
            match = null;
            for (var t = 0, len = children.length; t < len; ++t) {
                var subEntity = children[t];
                if (subEntity.name === name) {
                    match = subEntity;
                    break;
                }
            }
            if (!match) {
                return null;
            }
        }

        return match;
    };

    Scene.prototype.activate = function () {
        // active entities, invoke onLoad and onEnable
        var entities = this.entities;
        var i = 0, len = entities.length;
        for (; i < len; ++i) {
            var entity = entities[i];
            if (entity._active) {
                entity._onActivatedInHierarchy(true);
            }
        }
        if (Engine.isPlaying) {
            // invoke onStart
            for (i = 0, len = entities.length; i < len; ++i) {
                Component._invokeStarts(entities[i]);
            }
        }
    };

    Scene.prototype.destroy = function () {
        var entities = this.entities;
        for (var i = 0, len = entities.length; i < len; ++i) {
            var entity = entities[i];
            if (entity.isValid) {
                if (entity._objFlags & DontDestroy) {
                    Engine._dontDestroyEntities.push(entity);
                }
                else {
                    entity.destroy();
                }
            }
        }
        _super.prototype.destroy.call(this);
    };

    return Scene;
})();

Fire._Scene = Scene;


/**
 * The manager scheduling resources loading
 * - It will:
 *   - select registered loader
 *   - merge same url request
 *   - limit the max concurrent request
 * - It will NOT:
 *   - cache what has being loaded
 *   - load depends of resource
 */
var LoadManager = (function () {

    function getBuiltinRawTypes () {
        return {
            image: {
                loader: ImageLoader,
                defaultExtname: '.host'
            },
            json: {
                loader: JsonLoader,
                defaultExtname: '.json'
            },
            text: {
                loader: TextLoader,
                defaultExtname: '.txt'
            }
        };
    }

    var urlToCallbacks = new Fire.CallbacksInvoker();

    /**
     * list of elements to load, the element type is {
     *     url: url,
     *     loader: loader,
     *     callback: callback,
     * }
     */
    var loadQueue = [];

    var loadNext = function () {
        if (LoadManager._curConcurrent >= LoadManager.maxConcurrent) {
            Fire.error('too many concurrent requests');
            return;
        }
        var nextOne = loadQueue.pop();
        if (nextOne) {
            doLoad(nextOne.loader, nextOne.url, nextOne.callback);
        }
    };

    function doLoad (loader, url, callback) {
        LoadManager._curConcurrent += 1;
        loader(url, function doLoadCB (error, asset) {
            callback(error, asset);
            LoadManager._curConcurrent = Math.max(0, LoadManager._curConcurrent - 1);
            loadNext();
        });
    }

    var LoadManager = {

        /**
         * Max allowed concurrent request count
         * @property {number} LoadManager.maxConcurrent
         */
        maxConcurrent: 2,

        /**
         * Current concurrent request count
         * @property {number} LoadManager._curConcurrent
         * @private
         */
        _curConcurrent: 0,

        /**
         * NOTE: Request the same url with different loader for same url is not allowed
         */
        loadByLoader: function (loader, url, callback) {
            if (urlToCallbacks.add(url, callback)) {
                var callbackBundle = urlToCallbacks.bindKey(url, true);
                if (this._curConcurrent < this.maxConcurrent) {
                    doLoad(loader, url, callbackBundle);
                }
                else {
                    loadQueue.push({
                        url: url,
                        loader: loader,
                        callback: callbackBundle
                    });
                }
            }
        },

        /**
         * @param {string} url
         * @param {string} rawType
         * @param {string} [rawExtname]
         * @param {function} callback
         */
        load: function (url, rawType, rawExtname, callback) {
            if (typeof rawExtname === 'function') {
                callback = rawExtname;
            }
            var typeInfo = this._rawTypes[rawType];
            if (typeInfo) {
                var extname = rawExtname ? ('.' + rawExtname) : typeInfo.defaultExtname;
                if (extname) {
                    var rawUrl = url + extname;
                    this.loadByLoader(typeInfo.loader, rawUrl, callback);
                }
                else {
                    callback('Undefined extname for the raw ' + rawType + ' file of ' + url, null);
                }
            }
            else {
                callback('Unknown raw type "' + rawType + '" of ' + url, null);
            }
        },

        _rawTypes: getBuiltinRawTypes(),

        /**
         * @param {string} rawType
         * @param {function} loader
         * @param {string} defaultExtname
         */
        registerRawTypes: function (rawType, loader, defaultExtname) {
            if (!rawType) {
                Fire.error('[AssetLibrary.registerRawTypes] rawType must be non-nil');
                return;
            }
            if (typeof rawType !== 'string') {
                Fire.error('[AssetLibrary.registerRawTypes] rawType must be string');
                return;
            }
            if (!loader) {
                Fire.error('[AssetLibrary.registerRawTypes] loader must be non-nil');
                return;
            }
            if (typeof loader !== 'function') {
                Fire.error('[AssetLibrary.registerRawTypes] loader must be function');
                return;
            }
            if (this._rawTypes[rawType]) {
                Fire.error('rawType "%s" has already defined', rawType);
                return;
            }
            if (defaultExtname && defaultExtname[0] !== '.') {
                defaultExtname = '.' + defaultExtname;
            }
            this._rawTypes[rawType] = {
                loader: loader,
                defaultExtname: defaultExtname
            };
        },

        _loadFromXHR: _LoadFromXHR
    };

    LoadManager._urlToCallbacks = urlToCallbacks;

    return LoadManager;
})();

Fire.LoadManager = LoadManager;

// A asset library which managing loading/unloading assets in project

var AssetLibrary = (function () {

    // configs

    var _libraryBase = '';

    // variables

    // the loading uuid's callbacks
    var _uuidToCallbacks = new Fire.CallbacksInvoker();

    // temp deserialize info
    var _tdInfo = new Fire._DeserializeInfo();

    // create a loading context which reserves all relevant parameters
    function LoadingHandle (readMainCache, writeMainCache) {
        this.readMainCache = readMainCache;
        this.writeMainCache = writeMainCache;
        var needIndieCache = !(this.readMainCache && this.writeMainCache);
        this.taskIndieCache = needIndieCache ? {} : null;
    }
    LoadingHandle.prototype.readCache = function (uuid) {
        if (this.readMainCache && this.writeMainCache) {
            return AssetLibrary._uuidToAsset[uuid];
        }
        else {
            if (this.readMainCache) {
                // writeMainCache == false
                return AssetLibrary._uuidToAsset[uuid] || this.taskIndieCache[uuid];
            }
            else {
                return this.taskIndieCache[uuid];
            }
        }
    };
    LoadingHandle.prototype.writeCache = function (uuid, asset) {
        if (this.writeMainCache) {
            AssetLibrary._uuidToAsset[uuid] = asset;
        }
        if (this.taskIndieCache) {
            this.taskIndieCache[uuid] = asset;
        }
    };

    // publics

    var AssetLibrary = {

        /**
         * @param {string} uuid
         * @param {function} callback
         * @param {boolean} [readMainCache=true] - If false, the asset and all its depends assets will reload and create new instances from library.
         * @param {boolean} [writeMainCache=true] - If true, the result will cache to AssetLibrary, and MUST be unload by user manually.
         * @param {Fire.Asset} [existingAsset] - load to existing asset, this argument is only available in editor
         */
        loadAsset: function (uuid, callback, readMainCache, writeMainCache, existingAsset) {
            readMainCache = typeof readMainCache !== 'undefined' ? readMainCache : true;
            writeMainCache = typeof writeMainCache !== 'undefined' ? writeMainCache : true;

            var handle = new LoadingHandle(readMainCache, writeMainCache);
            this._loadAssetByUuid(uuid, callback, handle, existingAsset);
        },

        _LoadingHandle: LoadingHandle,

        /**
         * uuid加载流程：
         * 1. 查找_uuidToAsset，如果已经加载过，直接返回
         * 2. 查找_uuidToCallbacks，如果已经在加载，则注册回调，直接返回
         * 3. 如果没有url，则将uuid直接作为路径
         * 4. 递归加载Asset及其引用到的其它Asset
         *
         * @param {string} uuid
         * @param {AssetLibrary~loadCallback} callback - the callback to receive the asset
         * @param {LoadingHandle} handle - the loading context which reserves all relevant parameters
         * @param {Fire.Asset} [existingAsset] - load to existing asset, this argument is only available in editor
         */
        _loadAssetByUuid: function (uuid, callback, handle, existingAsset) {
            if (typeof uuid !== 'string') {
                callback('[AssetLibrary] uuid must be string', null);
                return;
            }
            // step 1
            if ( !existingAsset ) {
                var asset = handle.readCache(uuid);
                if (asset) {
                    if (callback) {
                        callback(null, asset);
                    }
                    return;
                }
            }

            // step 2
            // 如果必须重新加载，则不能合并到到 _uuidToCallbacks，否则现有的加载成功后会同时触发回调，
            // 导致提前返回的之前的资源。
            var canShareLoadingTask = handle.readMainCache && !existingAsset;
            if ( canShareLoadingTask && !_uuidToCallbacks.add(uuid, callback) ) {
                // already loading
                return;
            }

            // step 4
            var url = _libraryBase + uuid.substring(0, 2) + Fire.Path.sep + uuid;

            // step 5
            LoadManager.loadByLoader(JsonLoader, url,
                function (error, json) {
                    function onDeserializedWithDepends (err, asset) {
                        if (asset) {
                            asset._uuid = uuid;
                            handle.writeCache(uuid, asset);
                        }
                        if ( canShareLoadingTask ) {
                            _uuidToCallbacks.invokeAndRemove(uuid, err, asset);
                        }
                        else {
                            callback(err, asset);
                        }
                    }
                    if (json) {
                        AssetLibrary._deserializeWithDepends(json, url, onDeserializedWithDepends, handle, existingAsset);
                    }
                    else {
                        onDeserializedWithDepends(error, null);
                    }
                }
            );
        },

        /**
         * @param {string|object} json
         * @param {function} callback
         * @param {boolean} [dontCache=false] - If false, the result will cache to AssetLibrary, and MUST be unload by user manually.
         */
        loadJson: function (json, callback, dontCache) {
            var handle = new LoadingHandle(!dontCache, !dontCache);
            this._deserializeWithDepends(json, '', callback, handle);
        },

        /**
         * @param {string|object} json
         * @param {string} url
         * @param {function} callback
         * @param {object} handle - the loading context which reserves all relevant parameters
         * @param {Fire.Asset} [existingAsset] - existing asset to reload
         */
        _deserializeWithDepends: function (json, url, callback, handle, existingAsset) {
            // deserialize asset
            var isScene = json && json[0] && json[0].__type__ === JS._getClassId(Scene);
            var classFinder = isScene ? Fire._MissingScript.safeFindClass : function (id) {
                var cls = JS._getClassById(id);
                if (cls) {
                    return cls;
                }
                Fire.warn('Can not get class "%s"', id);
                return Object;
            };
            Engine._canModifyCurrentScene = false;
            var asset = Fire.deserialize(json, _tdInfo, {
                classFinder: classFinder,
                target: existingAsset
            });
            Engine._canModifyCurrentScene = true;

            // load depends
            var pendingCount = _tdInfo.uuidList.length;

            // load raw
            var rawProp = _tdInfo.rawProp;     // _tdInfo不能用在回调里！
            if (rawProp) {
                // load depends raw objects
                var attrs = Fire.attr(asset.constructor, _tdInfo.rawProp);
                var rawType = attrs.rawType;
                ++pendingCount;
                LoadManager.load(url, rawType, asset._rawext, function onRawObjLoaded (error, raw) {
                    if (error) {
                        Fire.error('[AssetLibrary] Failed to load %s of %s. %s', rawType, url, error);
                    }
                    asset[rawProp] = raw;
                    --pendingCount;
                    if (pendingCount === 0) {
                        callback(null, asset);
                    }
                });
            }

            if (pendingCount === 0) {
                callback(null, asset);
            }

            /*
             如果依赖的所有资源都要重新下载，批量操作时将会导致同时执行多次重复下载。优化方法是增加一全局事件队列，
             队列保存每个任务的注册，启动，结束事件，任务从注册到启动要延迟几帧，每个任务都存有父任务。
             这样通过队列的事件序列就能做到合并批量任务。
             如果依赖的资源不重新下载也行，但要判断是否刚好在下载过程中，如果是的话必须等待下载完成才能结束本资源的加载，
             否则外部获取到的依赖资源就会是旧的。
             */

            // load depends assets
            for (var i = 0, len = _tdInfo.uuidList.length; i < len; i++) {
                var dependsUuid = _tdInfo.uuidList[i];
                var onDependsAssetLoaded = (function (dependsUuid, obj, prop) {
                    // create closure manually because its extremely faster than bind
                    return function (error, dependsAsset) {
                        if (error) {
                        }
                        //else {
                        //    dependsAsset._uuid = dependsUuid;
                        //}
                        // update reference
                        obj[prop] = dependsAsset;
                        // check all finished
                        --pendingCount;
                        if (pendingCount === 0) {
                            callback(null, asset);
                        }
                    };
                })( dependsUuid, _tdInfo.uuidObjList[i], _tdInfo.uuidPropList[i] );
                AssetLibrary._loadAssetByUuid(dependsUuid, onDependsAssetLoaded, handle);
                invokeCbByDepends = true;
            }

            // _tdInfo 是用来重用临时对象，每次使用后都要重设，这样才对 GC 友好。
            _tdInfo.reset();
        },

        /**
         * Get the exists asset by uuid.
         *
         * @param {string} uuid
         * @return {Fire.Asset} - the existing asset, if not loaded, just returns null.
         */
        getAssetByUuid: function (uuid) {
            return AssetLibrary._uuidToAsset[uuid] || null;
        },

        /**
         * @callback AssetLibrary~loadCallback
         * @param {Fire.Asset} asset - if failed, asset will be null
         * @param {string} [error] - error info, if succeed, error will be empty or nil
         */

        /**
         * Kill references to the asset so it can be garbage collected.
         * Fireball will reload the asset from disk or remote if loadAssetByUuid being called again.
         * This function will be called if the Asset was destroyed.
         * 如果还有地方引用到asset，除非destroyAsset为true，否则不应该执行这个方法，因为那样可能会导致 asset 被多次创建。
         *
         * @method Fire.AssetLibrary.unloadAsset
         * @param {Fire.Asset|string} assetOrUuid
         * @param {boolean} [destroyImmediate=false] - When destroyAsset is true, if there are objects
         *                                         referencing the asset, the references will become invalid.
         */
        unloadAsset: function (assetOrUuid, destroyImmediate) {
            var asset;
            if (typeof assetOrUuid === 'string') {
                asset = AssetLibrary._uuidToAsset[assetOrUuid];
            }
            else {
                asset = assetOrUuid;
            }
            if (asset) {
                if (destroyImmediate && asset.isValid) {
                    asset.destroy();
                    // simulate destroy immediate
                    FObject._deferredDestroy();
                }
                delete AssetLibrary._uuidToAsset[asset._uuid];
            }
        },

        /**
         * init the asset library
         * @method Fire.AssetLibrary.init
         * @param {string} baseUrl
         * @param {object} [uuidToUrl]
         * @private
         */
        init: function (libraryPath) {
            _libraryBase = Fire.Path.setEndWithSep(libraryPath);
            //Fire.log('[AssetLibrary] library: ' + _libraryBase);
        }

        ///**
        // * temporary flag for deserializing assets
        // * @property {boolean} Fire.AssetLibrary.isLoadingAsset
        // */
        //isLoadingAsset: false,
    };

    // unload asset if it is destoryed

    /**
     * uuid to all loaded assets
     *
     * 这里保存所有已经加载的资源，防止同一个资源在内存中加载出多份拷贝。
     * 由于弱引用尚未标准化，在浏览器中所有加载过的资源都只能手工调用 unloadAsset 释放。
     * 参考：
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
     * https://github.com/TooTallNate/node-weak
     */
    AssetLibrary._uuidToAsset = {};

    if (Asset.prototype._onPreDestroy) {
        Fire.error('_onPreDestroy of Asset has already defined');
    }
    Asset.prototype._onPreDestroy = function () {
        if (AssetLibrary._uuidToAsset[this._uuid] === this) {
            AssetLibrary.unloadAsset(this, false);
        }
    };

    return AssetLibrary;
})();

Fire.AssetLibrary = AssetLibrary;


var Engine = (function () {

    var Engine = {
    };

    var isPlaying = false;
    var isPaused = false;
    var stepOnce = false;
    var isLoadingScene = false;

    // We should use this id to cancel ticker, otherwise if the engine stop and replay immediately,
    // last ticker will not cancel correctly.
    var requestId = -1;

    /**
     * 当前激活的场景，如果为空，一般是因为正在加载场景或Entity(例如执行Fire.deserialize)。
     * 这样是为了防止加载中的东西不小心影响到当前场景。一般代码不用关心这个问题，但大部分构造函数里执行的代码，
     * 如果涉及到场景物件的操作，都要注意这点。
     * 也就是说构造函数调用到的代码如果要操作 Engine._scene，必须判断非空，如果操作不直接针对 Engine._scene，
     * 也判断 Engine._canModifyCurrentScene。
     * 另外，如果存在辅助场景，当在辅助场景内创建物件时，Engine._scene会被临时修改为辅助场景。
     *
     * @property {Scene} Engine._scene - the active scene
     */
    Engine._scene = null;

    // temp array contains persistent entities
    Engine._dontDestroyEntities = [];

    // main render context
    Engine._renderContext = null;

    // main interaction context
    Engine._interactionContext = null;

    // the render context currently rendering
    Engine._curRenderContext = null;

    // main input context
    Engine._inputContext = null;

    // is rendering and allow update logic
    Object.defineProperty(Engine, 'isPlaying', {
        get: function () {
            return isPlaying;
        }
    });

    // is logic paused
    Object.defineProperty(Engine, 'isPaused', {
        get: function () {
            return isPaused;
        }
    });

    // is loading scene and its assets asynchronous
    Object.defineProperty(Engine, 'isLoadingScene', {
        get: function () {
            return isLoadingScene;
        }
    });

    var lockingScene = null;

    /**
     * You should check whether you can modify the scene in constructors which may called by the engine while deserializing.
     * 这个属性和 Fire._isCloning 很类似。但这里关注的是场景是否能修改，而 Fire._isCloning 强调的是持有的对象是否需要重新创建。
     * @param {boolean} Engine._canModifyCurrentScene
     * @see Fire._isCloning
     */
    Object.defineProperty(Engine, '_canModifyCurrentScene', {
        get: function () {
            return !lockingScene;
        },
        set: function (value) {
            if (value) {
                // unlock
                this._scene = lockingScene;
                lockingScene = null;
            }
            else {
                // lock
                if (this._scene && lockingScene) {
                    Fire.error('another scene still locked: ' + lockingScene.name);
                }
                lockingScene = this._scene;
                this._scene = null;
            }
        }
    });

    var inited = false;
    Object.defineProperty(Engine, 'inited', {
        get: function () {
            return inited;
        }
    });

    /**
     * Scene name to uuid
     * @private
     */
    Engine._sceneInfos = {};

    // functions

    /**
     * @param {number} [w]
     * @param {number} [h]
     * @param {Canvas} [canvas]
     * @param {object} [options]
     * @return {RenderContext}
     */
    Engine.init = function ( w, h, canvas, options ) {
        if (inited) {
            Fire.error('Engine already inited');
            return;
        }
        inited = true;

        Engine._renderContext = new RenderContext( w, h, canvas );
        Engine._interactionContext = new InteractionContext();

        if (options) {
            JS.mixin(Engine._sceneInfos, options.scenes);
        }
        return Engine._renderContext;
    };

    Engine.play = function () {
        if (isPlaying && !isPaused) {
            Fire.warn('Fireball is already playing');
            return;
        }
        if (isPlaying && isPaused) {
            isPaused = false;
            return;
        }
        isPlaying = true;

        Engine._inputContext = new InputContext(Engine._renderContext);
        var now = Ticker.now();
        Time._restart(now);
        update();

    };

    Engine.stop = function () {
        if (isPlaying) {
            FObject._deferredDestroy();
            Engine._inputContext.destruct();
            Engine._inputContext = null;
            Input._reset();

            // reset states
            isPlaying = false;
            isPaused = false;
            isLoadingScene = false; // TODO: what if loading scene ?
            if (requestId !== -1) {
                Ticker.cancelAnimationFrame(requestId);
                requestId = -1;
            }

        }
    };

    Engine.pause = function () {
        isPaused = true;
    };

    Engine.step = function () {
        this.pause();
        stepOnce = true;
        if ( !isPlaying ) {
            Engine.play();
        }
    };

    function render () {
        // render
        Engine._scene.render(Engine._renderContext);
    }

    function doUpdate (updateLogic) {
        if (Engine._scene) {
            if (updateLogic) {
                Engine._scene.update();
                FObject._deferredDestroy();
            }
            render();

            // update interaction context
            Engine._interactionContext.update(Engine._scene.entities);
        }
    }

    /**
     * @method Fire.Engine.update
     * @param {float} [unused] - not used parameter, can omit
     * @private
     */
    function update (unused) {
        if (!isPlaying) {
            return;
        }
        requestId = Ticker.requestAnimationFrame(update);

        if (isLoadingScene) {
            return;
        }

        var updateLogic = !isPaused || stepOnce;
        stepOnce = false;
        var now = Ticker.now();
        Time._update(now, !updateLogic);
        doUpdate(updateLogic);

        if (__TESTONLY__.update) {
            __TESTONLY__.update(updateLogic);
        }
    }
    Engine.update = update;

    /**
     * Set current scene directly
     * @method Fire.Engine._setCurrentScene
     * @param {Scene} scene
     * @param {function} [onBeforeLoadScene]
     * @private
     */
    Engine._setCurrentScene = function (scene, onBeforeLoadScene) {
        if (!scene) {
            Fire.error('Argument must be non-nil');
            return;
        }
        Engine._dontDestroyEntities.length = 0;

        // unload scene
        var oldScene = Engine._scene;
        if (Fire.isValid(oldScene)) {
            // destroyed and unload
            AssetLibrary.unloadAsset(oldScene, true);
        }

        // purge destroyed entities belongs to old scene
        FObject._deferredDestroy();

        Engine._scene = null;

        if (onBeforeLoadScene) {
            onBeforeLoadScene();
        }

        // init scene
        Engine._renderContext.onSceneLoaded(scene);
        // launch scene
        scene.entities = scene.entities.concat(Engine._dontDestroyEntities);
        Engine._dontDestroyEntities.length = 0;
        Engine._scene = scene;
        Engine._renderContext.onSceneLaunched(scene);
        scene.activate();
    };

    /**
     * Loads the scene by its name.
     * @method Fire.Engine.loadScene
     * @param {string} sceneName - the name of the scene to load
     * @param {function} [onLaunched]
     * @param {function} [onUnloaded] - will be called when the previous scene was unloaded
     */
    Engine.loadScene = function (sceneName, onLaunched, onUnloaded) {
        var uuid = Engine._sceneInfos[sceneName];
        if (uuid) {
            Engine._loadSceneByUuid(uuid, onLaunched, onUnloaded);
        }
        else {
            Fire.error('[Engine.loadScene] The scene "%s" could not be loaded because it has not been added to the build settings.', sceneName);
        }
    };

    /**
     * Load scene
     * @method Fire.Engine.loadScene
     * @param {string} uuid - the uuid of the scene asset to load
     * @param {function} [onLaunched]
     * @param {function} [onUnloaded] - will be called when the previous scene was unloaded
     */
    Engine._loadSceneByUuid = function (uuid, onLaunched, onUnloaded) {
        // TODO: lookup uuid by name
        isLoadingScene = true;
        AssetLibrary.unloadAsset(uuid);     // force reload
        AssetLibrary.loadAsset(uuid, function onSceneLoaded (error, scene) {
            if (error) {
                Fire.error('Failed to load scene: ' + error);
                isLoadingScene = false;
                if (onLaunched) {
                    onLaunched(null, error);
                }
                return;
            }
            if (!(scene instanceof Fire._Scene)) {
                error = 'The asset ' + uuid + ' is not a scene';
                Fire.error(error);
                isLoadingScene = false;
                if (onLaunched) {
                    onLaunched(null, error);
                }
                return;
            }

            Engine._setCurrentScene(scene, onUnloaded);

            isLoadingScene = false;
            if (onLaunched) {
                onLaunched(scene);
            }
        });
    };

    return Engine;
})();

Fire.Engine = Engine;


var ModifierKeyStates = (function () {

    /**
     * @param {string} type - The name of the event (case-sensitive), e.g. "click", "fire", or "submit"
     */
    function ModifierKeyStates (type, nativeEvent) {
        Fire.Event.call(this, type, true);

        this.nativeEvent = null;
        this.ctrlKey = false;
        this.shiftKey = false;
        this.altKey = false;
        this.metaKey = false;
    }
    JS.extend(ModifierKeyStates, Fire.Event);

    /**
     * Returns the current state of the specified modifier key. true if the modifier is active (i.e., the modifier key is pressed or locked). Otherwise, false.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.getModifierState
     *
     * @param {string} keyArg - A modifier key value. The value must be one of the KeyboardEvent.key values which represent modifier keys or "Accel". This is case-sensitive.
     *                          NOTE: If an application wishes to distinguish between right and left modifiers, this information could be deduced using keyboard events and Fire.KeyboardEvent.location.
     * @return {boolean} true if it is a modifier key and the modifier is activated, false otherwise.
     */
    ModifierKeyStates.prototype.getModifierState = function (keyArg) {
        return nativeEvent.getModifierState(keyArg);
    };

    /**
     * @param {MouseEvent|KeyboardEvent|TouchEvent} nativeEvent - The original DOM event
     */
    ModifierKeyStates.prototype.initFromNativeEvent = function (nativeEvent) {
        this.nativeEvent = nativeEvent;
        this.ctrlKey = nativeEvent.ctrlKey;
        this.shiftKey = nativeEvent.shiftKey;
        this.altKey = nativeEvent.altKey;
        this.metaKey = nativeEvent.metaKey;
    };

    ModifierKeyStates.prototype._reset = function () {
        Event.prototype._reset.call(this);
        this.nativeEvent = null;
        this.ctrlKey = false;
        this.shiftKey = false;
        this.altKey = false;
        this.metaKey = false;
    };

    return ModifierKeyStates;
})();

Fire.ModifierKeyStates = ModifierKeyStates;

Fire.KeyboardEvent = window.KeyboardEvent;  // should use window for Safari

var MouseEvent = (function () {

    /**
     * @param {string} type - The name of the event (case-sensitive), e.g. "click", "fire", or "submit"
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
     * http://www.quirksmode.org/dom/w3c_events.html#mousepos
     */
    function MouseEvent (type) {
        Fire.ModifierKeyStates.call(this, type);

        /**
         * @property {number} button - indicates which button was pressed on the mouse to trigger the event.
         *                             (0: Left button, 1: Wheel button or middle button (if present), 2: Right button)
         */
        this.button = 0;

        /**
         * @property {number} buttonStates - indicates which buttons were pressed on the mouse to trigger the event
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.buttons
         */
        this.buttonStates = 0;

        this.screenX = 0;
        this.screenY = 0;

        /**
         * @property {number} deltaX - The X coordinate of the mouse pointer relative to the position of the last mousemove event.
         */
        this.deltaX = 0;

        /**
         * @property {number} deltaY - The Y coordinate of the mouse pointer relative to the position of the last mousemove event.
         */
        this.deltaY = 0;

        /**
         * @property {Fire.EventTarget} relatedTarget - The secondary target for the event, if there is one.
         */
        this.relatedTarget = null;
    }
    JS.extend(MouseEvent, ModifierKeyStates);

    var TouchEvent = window.TouchEvent;

    /**
     * @param {MouseEvent} nativeEvent - The original DOM event
     */
    MouseEvent.prototype.initFromNativeEvent = function (nativeEvent) {
        ModifierKeyStates.prototype.initFromNativeEvent.call(this, nativeEvent);

        this.button = nativeEvent.button;
        this.buttonStates = nativeEvent.buttons;
        this.screenX = nativeEvent.offsetX;
        this.screenY = nativeEvent.offsetY;
        this.deltaX = nativeEvent.movementX;
        this.deltaY = nativeEvent.movementY;
        this.relatedTarget = nativeEvent.relatedTarget;
    };

    MouseEvent.prototype._reset = function () {
        ModifierKeyStates.prototype._reset.call(this);

        this.button = 0;
        this.buttonStates = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.relatedTarget = null;
    };

    return MouseEvent;
})();

Fire.MouseEvent = MouseEvent;

var InputContext = (function () {

    function DomEventRegister (target) {
        this.target = target;
        this.events = [];
    }
    DomEventRegister.prototype.addEventListener = function (message, callback, useCapture) {
        this.target.addEventListener(message, callback, useCapture);
        this.events.push([message, callback, useCapture]);
    };
    DomEventRegister.prototype.removeAll = function () {
        for (var i = 0; i < this.events.length; i++) {
            var args = this.events[i];
            this.target.removeEventListener(args[0], args[1], args[2]);
        }
        this.events.length = 0;
    };

    /**
     * http://www.quirksmode.org/dom/events/index.html
     */
    var InputContext = function (renderContext) {
        var canvas = renderContext.renderer.view;
        canvas.tabIndex = canvas.tabIndex || 0;     // make key event receivable

        this.renderContext = renderContext;
        this.eventRegister = new DomEventRegister(canvas);
        this.hasTouch = 'ontouchstart' in window;

        // bind event
        var scope = this;
        function listener (event) {
            scope.onDomInputEvent(event);
        }
        for (var type in EventRegister.inputEvents) {
            //var info = EventRegister.inputEvents[type];
            //if (!(this.hasTouch && info.constructor instanceof MouseEvent)) {
                this.eventRegister.addEventListener(type, listener, true);
            //}
        }
        if (this.hasTouch) {
            this.simulateMouseEvent();
        }

        // focus the canvas to receive keyboard events
        function focusCanvas () {
            canvas.focus();
        }
        if (this.hasTouch) {
            this.eventRegister.addEventListener('touchstart', focusCanvas, true);
        }
        else {
            this.eventRegister.addEventListener('mousedown', focusCanvas, true);
        }
    };

    function convertToRetina (event) {
        event.screenX *= Fire.Screen.devicePixelRatio;
        event.screenY *= Fire.Screen.devicePixelRatio;
    }

    InputContext.prototype.simulateMouseEvent = function () {
        var scope = this;
        // get canvas page offset
        var canvasPageX = 0,
            canvasPageY = 0;
        var elem = scope.renderContext.renderer.view;
        while (elem) {
            canvasPageX += parseInt(elem.offsetLeft);
            canvasPageY += parseInt(elem.offsetTop);
            elem = elem.offsetParent;
        }
        //
        function createMouseEvent (type, touchEvent) {
            var event = new MouseEvent(type);
            event.bubbles = true;
            // event.cancelable = eventInfo.cancelable; (NYI)
            var first = touchEvent.changedTouches[0] || touchEvent.touches[0];
            event.button = 0;
            event.buttonStates = 1;
            if (first) {
                event.screenX = first.pageX - canvasPageX;
                event.screenY = first.pageY - canvasPageY;
            }
            return event;
        }
        function getTouchListener (info) {
            var type = info.simulateType;
            if (type) {
                return function (touchEvent) {
                    // gen mouse event
                    var event = createMouseEvent(type, touchEvent);
                    convertToRetina(event);

                    // inner dispatch
                    Input._dispatchEvent(event, scope);

                    // update dom event

                    // Prevent simulated mouse events from firing by browser,
                    // However, this also prevents any default browser behavior from firing (clicks, scrolling, etc)
                    touchEvent.preventDefault();

                    if (event._propagationStopped) {
                        if (event._propagationImmediateStopped) {
                            touchEvent.stopImmediatePropagation();
                        }
                        else {
                            touchEvent.stopPropagation();
                        }
                    }
                };
            }
            else {
                return function (touchEvent) {
                    touchEvent.preventDefault();
                };
            }
        }
        var SimulateInfos = {
            touchstart: {
                simulateType: 'mousedown'
            },
            touchend: {
                simulateType: 'mouseup'
            },
            touchmove: {
                simulateType: 'mousemove'
            },
            touchcancel: {
                simulateType: ''
            }
        };
        for (var srcType in SimulateInfos) {
            var info = SimulateInfos[srcType];
            this.eventRegister.addEventListener(srcType, getTouchListener(info), true);
        }
    };

    InputContext.prototype.destruct = function () {
        this.eventRegister.removeAll();
    };

    InputContext.prototype.onDomInputEvent = function (domEvent) {
        // wrap event
        var eventInfo = EventRegister.inputEvents[domEvent.type];
        var event = new eventInfo.constructor(domEvent.type);
        if (event.initFromNativeEvent) {
            event.initFromNativeEvent(domEvent);
        }
        event.bubbles = eventInfo.bubbles;
        // event.cancelable = eventInfo.cancelable; (NYI)
        convertToRetina(event);

        // inner dispatch
        Input._dispatchEvent(event, this);

        // update dom event
        if (event._defaultPrevented) {
            domEvent.preventDefault();
        }
        if (event._propagationStopped) {
            if (event._propagationImmediateStopped) {
                domEvent.stopImmediatePropagation();
            }
            else {
                domEvent.stopPropagation();
            }
        }
    };

    return InputContext;
})();


var Browser = (function () {
    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    var Browser = {};
    Browser.BROWSER_TYPE_WECHAT = "wechat";
    Browser.BROWSER_TYPE_ANDROID = "androidbrowser";
    Browser.BROWSER_TYPE_IE = "ie";
    Browser.BROWSER_TYPE_QQ = "qqbrowser";
    Browser.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    Browser.BROWSER_TYPE_UC = "ucbrowser";
    Browser.BROWSER_TYPE_360 = "360browser";
    Browser.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    Browser.BROWSER_TYPE_BAIDU = "baidubrowser";
    Browser.BROWSER_TYPE_MAXTHON = "maxthon";
    Browser.BROWSER_TYPE_OPERA = "opera";
    Browser.BROWSER_TYPE_OUPENG = "oupeng";
    Browser.BROWSER_TYPE_MIUI = "miuibrowser";
    Browser.BROWSER_TYPE_FIREFOX = "firefox";
    Browser.BROWSER_TYPE_SAFARI = "safari";
    Browser.BROWSER_TYPE_CHROME = "chrome";
    Browser.BROWSER_TYPE_LIEBAO = "liebao";
    Browser.BROWSER_TYPE_QZONE = "qzone";
    Browser.BROWSER_TYPE_SOUGOU = "sogou";
    Browser.BROWSER_TYPE_UNKNOWN = "unknown";

    var browserType = Browser.BROWSER_TYPE_UNKNOWN;
    var browserTypes = ua.match(/sogou|qzone|liebao|micromessenger|qqbrowser|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|trident|oupeng|opera|miuibrowser|firefox/i) ||
                                ua.match(/chrome|safari/i);
    if (browserTypes && browserTypes.length > 0) {
        browserType = browserTypes[0];
        if (browserType === 'micromessenger') {
            browserType = Browser.BROWSER_TYPE_WECHAT;
        }
        else if (browserType === "safari" && (ua.match(/android.*applewebkit/))) {
            browserType = Browser.BROWSER_TYPE_ANDROID;
        }
        else if (browserType === "trident") {
            browserType = Browser.BROWSER_TYPE_IE;
        }
        else if (browserType === "360 aphone") {
            browserType = Browser.BROWSER_TYPE_360;
        }
    }
    else if (ua.indexOf("iphone") && ua.indexOf("mobile")) {
        browserType = "safari";
    }

    /**
     * Indicate the running browser type
     * @type {string}
     */
    Browser.type = browserType;

    return Browser;
})();

var BrowserGetter = (function () {

    var BrowserGetter = {
        init: function () {
            this.html = document.getElementsByTagName("html")[0];
        },
        availWidth: function (frame) {
            if (!frame || frame === this.html) {
                return window.innerWidth;
            }
            else {
                return frame.clientWidth;
            }
        },
        availHeight: function (frame) {
            if (!frame || frame === this.html) {
                return window.innerHeight;
            }
            else {
                return frame.clientHeight;
            }
        },
        adaptationType: Browser.type
    };

    if (window.navigator.userAgent.indexOf("OS 8_1_") > -1) {   //this mistake like MIUI, so use of MIUI treatment method
        BrowserGetter.adaptationType = Browser.BROWSER_TYPE_MIUI;
    }
    switch (BrowserGetter.adaptationType) {
        case Browser.BROWSER_TYPE_SAFARI:
            //BrowserGetter.meta["minimal-ui"] = "true";
            BrowserGetter.availWidth = function (frame) {
                return frame.clientWidth;
            };
            BrowserGetter.availHeight = function (frame) {
                return frame.clientHeight;
            };
            break;
        //case Browser.BROWSER_TYPE_CHROME:
        //    BrowserGetter.__defineGetter__("target-densitydpi", function () {
        //        return cc.view._targetDensityDPI;
        //    });
        case Browser.BROWSER_TYPE_SOUGOU:
        case Browser.BROWSER_TYPE_UC:
            BrowserGetter.availWidth = function (frame) {
                return frame.clientWidth;
            };
            BrowserGetter.availHeight = function (frame) {
                return frame.clientHeight;
            };
            break;
        //case Browser.BROWSER_TYPE_MIUI:
        //    BrowserGetter.init = function () {
        //        if (view.__resizeWithBrowserSize) return;
        //        var resize = function(){
        //            view.setDesignResolutionSize(
        //                view._designResolutionSize.width,
        //                view._designResolutionSize.height,
        //                view._resolutionPolicy
        //            );
        //            window.removeEventListener("resize", resize, false);
        //        };
        //        window.addEventListener("resize", resize, false);
        //    };
        //    break;
    }

    BrowserGetter.init();
    return BrowserGetter;
})();


var Screen = {
    // The device's pixel ratio (for retina displays)
    devicePixelRatio: (Fire.isRetinaEnabled && window.devicePixelRatio) || 1
};

Object.defineProperty(Screen, 'size', {
    get: function () {
        return Engine._renderContext.size;//.div(this.devicePixelRatio);
    },
    set: function (value) {
        Engine._renderContext.size = value;//.mul(this.devicePixelRatio);
    }
});

//Object.defineProperty(Screen, 'deviceSize', {
//    get: function () {
//        return Engine._renderContext.size;
//    },
//    set: function (value) {
//        Engine._renderContext.size = value;
//        //if ( !isPlaying ) {
//        //    render();
//        //}
//    }
//});

Object.defineProperty(Screen, 'width', {
    get: function () {
        return Engine._renderContext.width;
    },
    set: function (value) {
        Engine._renderContext.width = value;
    }
});

Object.defineProperty(Screen, 'height', {
    get: function () {
        return Engine._renderContext.height;
    },
    set: function (value) {
        Engine._renderContext.height = value;
    }
});



Object.defineProperty(Screen, '_container', {
    get: function () {
        var canvas = Fire.Engine._renderContext.canvas;
        return canvas.parentNode;
    }
});

Object.defineProperty(Screen, '_frame', {
    get: function () {
        var container = this._container;
        return (container.parentNode === document.body) ? document.documentElement : container.parentNode;
    }
});

// Size of parent node that contains container and _canvas
Object.defineProperty(Screen, '_frameSize', {
    get: function () {
        var frame = this._frame;
        return Fire.v2(BrowserGetter.availWidth(frame), BrowserGetter.availHeight(frame));
    }
});

//Object.defineProperty(Screen, 'resolutionPolicy', {
//    get: function () {
//        return this._resolutionPolicy;
//    },
//    set: function (value) {
//        this._resolutionPolicy = value;
//    }
//});

Fire.Screen = Screen;


/////////////////////////////////////////////////////////////////////////////////////////
//
///**
// * ResolutionPolicy class is the root strategy class of scale strategy.
// */
//function ResolutionPolicy (containerStrategy, contentStrategy) {
//    this._containerStrategy = containerStrategy;
//    this._contentStrategy = contentStrategy;
//}
//
//ResolutionPolicy.prototype.init = function () {
//    this._containerStrategy.init();
//    this._contentStrategy.init();
//};
//
///**
// * Function to apply this resolution policy.
// * The return value is {scale: {Fire.Vec2}, viewport: {Fire.Rect}}.
// * @param {Fire.Vec2} designedResolution - The user defined design resolution
// * @returns {object} An object contains the scale X/Y values and the viewport rect
// */
//ResolutionPolicy.prototype.apply = function (designedResolution) {
//    this._containerStrategy.apply(designedResolution);
//    return this._contentStrategy.apply(designedResolution);
//};
//
//ResolutionPolicy._registered = {};
//
///**
// * @param {Fire.ResolutionPolicyType} type
// * @returns {Fire.ResolutionPolicy} the instance of ResolutionPolicy
// */
//ResolutionPolicy.fromType = function (type) {
//    return this._registered[type];
//};
//
///**
// * @param {Fire.ResolutionPolicyType} type
// * @param instance
// */
//ResolutionPolicy.register = function (type, instance) {
//    this._registered[type] = instance;
//};
//
//Fire.Screen.ResolutionPolicy = ResolutionPolicy;

///////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////

/**
 * ContainerStrategy class is the root strategy class of container's scale strategy,
 * it controls the behavior of how to scale the container and canvas.
 */
function ContainerStrategy () {}

ContainerStrategy.prototype.setupContainer = function (size) {
    var canvas = Fire.Engine._renderContext.canvas;
    var container = Fire.Screen._container;

    // Setup container
    container.style.width = canvas.style.width = size.x + 'px';
    container.style.height = canvas.style.height = size.y + 'py';

    // Setup canvas
    var devicePixelRatio = Fire.Screen.devicePixelRatio;
    Fire.Screen.size = size.mul(devicePixelRatio);  // enable retina display

    if (Fire.isMobile) {
        var body = document.body;
        var style;
        if (body && (style = body.style)) {
            ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
             'borderTop',  'borderRight',  'borderBottom',  'borderLeft',
             'marginTop',  'marginRight',  'marginBottom',  'marginLeft']
            .forEach(function (key) {
                style[key] = style[key] || '0px';
            });
        }
    }
};

Fire.Screen.ContainerStrategy = ContainerStrategy;

///////////////////////////////////////////////////////////////////////////////////////

/**
 * ContentStrategy class is the root strategy class of content's scale strategy,
 * it controls the behavior of how to scale the scene and setup the viewport for the game
 */
function ContentStrategy () {}

/**
 * Function to apply this strategy
 * The return value is {scale: {Fire.Vec2}, viewport: {Fire.Rect}},
 * @param {Fire.Vec2} designedResolution
 * @return {object} scaleAndViewportRect
 */
ContentStrategy.prototype.apply = function (designedResolution) {
};

ContentStrategy.prototype.buildResult = function (container, content, scale) {
    // Makes content fit better the canvas
    if (Math.abs(container.x - content.x) < 2) {
        content.x = container.x;
    }
    if (Math.abs(container.y - content.y) < 2) {
        content.y = container.y;
    }
    var viewport = new Fire.Rect(Math.round((container.x - content.x) / 2),
                                 Math.round((container.y - content.y) / 2),
                                 content.x,
                                 content.y);
    return {
        scale: scale,
        viewport: viewport
    };
};

//ContentStrategy.prototype.setup = function (w, h, styleW, styleH, left, top) {
//    //_stageWidth = Math.round(w);
//    //_stageHeight = Math.round(h);
//    var container = Fire.Scene._container;
//    container.style.width = styleW + "px";
//    container.style.height = styleH + "px";
//    container.style.top = top + "px";
//};

ContentStrategy.prototype.getContainerSize = function () {
    var container = Fire.Scene._container;
    return Fire.v2(container.clientWidth, container.clientHeight);
};

Fire.Screen.ContentStrategy = ContentStrategy;

///////////////////////////////////////////////////////////////////////////////////////

(function () {

// Container scale strategies

    function EqualToFrame () {
        ContainerStrategy.call(this);
    }
    Fire.JS.extend(EqualToFrame, ContainerStrategy);

    EqualToFrame.prototype.apply = function () {
        var frameSize = Fire.Screen._frameSize;
        this.setupContainer(frameSize);
    };

    /**
     * Strategy that makes the container's size equals to the frame's size
     * @type {EqualToFrame}
     */
    ContainerStrategy.EqualToFrame = new EqualToFrame();

// Content scale strategies

    function NoScale () {
        ContentStrategy.call(this);
    }
    Fire.JS.extend(NoScale, ContentStrategy);

    NoScale.prototype.apply = function (designedResolution, viewportSize) {
        return this.buildResult(viewportSize, viewportSize, Vec2.one);
    };

    /**
     * Strategy to scale the content's height to container's height and proportionally scale its width
     */
    function FixedHeight () {
        ContentStrategy.call(this);
    }
    Fire.JS.extend(FixedHeight, ContentStrategy);

    FixedHeight.prototype.apply = function (designedResolution, viewportSize) {
        var scale = viewportSize.y / designedResolution.y;
        var content = viewportSize;
        return this.buildResult(viewportSize, viewportSize, Fire.v2(scale, scale));
    };

// instance of Content scale strategies

    // index of the array is the value of Fire.ContentStrategyType
    var contentStrategies = [new NoScale(), new FixedHeight()];

    /**
     * @param {Fire.ContentStrategyType} type
     * @returns {Fire.ContentStrategy}
     */
    ContentStrategy.fromType = function (type) {
        var res = contentStrategies[type];
        if (!res) {
            Fire.error('Failed to get ContentStrategy from value', type);
            return contentStrategies[1];
        }
        return res;
    };
})();

///////////////////////////////////////////////////////////////////////////////////////

var FireMouseEvent = Fire.MouseEvent;
var FireKeyboardEvent = Fire.KeyboardEvent;

var EventRegister = {
    inputEvents: {
        // ref: http://www.w3.org/TR/DOM-Level-3-Events/#event-types-list
        keydown: {
            constructor: FireKeyboardEvent,
            bubbles: true,
            cancelable: true
        },
        keyup: {
            constructor: FireKeyboardEvent,
            bubbles: true,
            cancelable: true
        },
        click: {
            constructor: FireMouseEvent,
            bubbles: true,
            cancelable: true
        },
        dblclick: {
            constructor: FireMouseEvent,
            bubbles: true,
            cancelable: false
        },
        mousedown: {
            constructor: FireMouseEvent,
            bubbles: true,
            cancelable: true
        },
        mouseup: {
            constructor: FireMouseEvent,
            bubbles: true,
            cancelable: true
        },
        mousemove: {
            constructor: FireMouseEvent,
            bubbles: true,
            cancelable: true
        },
        //touchstart: {
        //    constructor: FireMouseEvent,
        //    bubbles: true,
        //    cancelable: true
        //},
        //touchend: {
        //    constructor: FireMouseEvent,
        //    bubbles: true,
        //    cancelable: true
        //},
        //touchmove: {
        //    constructor: FireMouseEvent,
        //    bubbles: true,
        //    cancelable: true
        //}
        //mouseenter: {
        //    constructor: FireMouseEvent,
        //    bubbles: false,
        //    cancelable: false,
        //},
        //mouseleave: {
        //    constructor: FireMouseEvent,
        //    bubbles: false,
        //    cancelable: false,
        //},
        //mouseout: {
        //    constructor: FireMouseEvent,
        //    bubbles: true,
        //    cancelable: true,
        //},
        //mouseover: {
        //    constructor: FireMouseEvent,
        //    bubbles: true,
        //    cancelable: true,
        //},
    }
};

Fire.EventRegister = EventRegister;

var Input = (function () {

    var Input = {
        _eventListeners: new EventListeners()
    };

    Object.defineProperty(Input, 'hasTouch', {
        get: function () {
            return !!Engine._inputContext && Engine._inputContext.hasTouch;
        }
    });

    Input.on = function (type, callback) {
        if (callback) {
            this._eventListeners.add(type, callback);
        }
        else {
            Fire.error('Callback must be non-nil');
        }
    };

    Input.off = function (type, callback) {
        if (callback) {
            if (! this._eventListeners.remove(type, callback)) {
                Fire.warn('Callback not exists');
            }
        }
        else {
            Fire.error('Callback must be non-nil');
        }
    };

    Input._reset = function () {
        this._eventListeners = new EventListeners();
    };

    Input._dispatchMouseEvent = function (event, inputContext) {
        var camera = inputContext.renderContext.camera || Engine._scene.camera;
        var worldMousePos = camera.screenToWorld(new Vec2(event.screenX, event.screenY));
        var target = Engine._interactionContext.pick(worldMousePos);
        if (target) {
            target.dispatchEvent(event);
        }
    };

    Input._dispatchEvent = function (event, inputContext) {
        // dispatch global event
        this._eventListeners.invoke(event);
        // dispatch mouse event through hierarchy
        if (event instanceof Fire.MouseEvent) {
            this._dispatchMouseEvent(event, inputContext);
        }
    };

    return Input;
})();

Fire.Input = Input;

    // end of generated codes

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Fire;
        }
        exports.Fire = Fire;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define(Fire);
    }
    else {
        root.Fire = Fire;
    }
}).call(this);
