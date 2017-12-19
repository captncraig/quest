var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("loader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Loader = (function () {
        function Loader(gameName) {
            this.gameName = gameName;
            this.cache = {};
        }
        Loader.prototype.load = function (filename) {
            return __awaiter(this, void 0, void 0, function () {
                var resp, buf, arr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.cache[filename]) {
                                return [2, this.cache[filename]];
                            }
                            return [4, fetch("/games/" + this.gameName + "/" + filename)];
                        case 1:
                            resp = _a.sent();
                            return [4, resp.arrayBuffer()];
                        case 2:
                            buf = _a.sent();
                            arr = new Uint8Array(buf);
                            this.cache[filename] = arr;
                            return [2, arr];
                    }
                });
            });
        };
        Loader.prototype.loadText = function (filename) {
            return __awaiter(this, void 0, void 0, function () {
                var arr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.load(filename)];
                        case 1:
                            arr = _a.sent();
                            return [2, new TextDecoder("utf-8").decode(arr)];
                    }
                });
            });
        };
        return Loader;
    }());
    exports.Loader = Loader;
});
define("logger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lerror = 2;
    exports.linfo = 3;
    exports.ldebug = 4;
    exports.lverbose = 5;
    var logLevel = exports.lverbose;
    function level(i) {
        logLevel = i;
    }
    exports.level = level;
    function debug(s) {
        if (logLevel >= exports.ldebug) {
            console.log('%c %s', 'background: #eee; color: #00', s);
        }
    }
    exports.debug = debug;
    function verbose(s) {
        if (logLevel >= exports.lverbose) {
            console.log('%c %s', 'background: white; color: black', s);
        }
    }
    exports.verbose = verbose;
    function info(s) {
        if (logLevel >= exports.linfo) {
            console.log('%c %s', 'background: lightblue; color: black', s);
        }
    }
    exports.info = info;
    function error(s) {
        if (logLevel >= exports.lerror) {
            console.log('%c %s', 'background: red; color: yellow', s);
        }
    }
    exports.error = error;
});
define("directory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Dir = (function () {
        function Dir(loader, v3Prefix) {
            this.loader = loader;
            this.v3Prefix = v3Prefix;
        }
        Dir.prototype.Load = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.v3Prefix) return [3, 2];
                            return [4, this.loadV2()];
                        case 1:
                            _a.sent();
                            return [3, 4];
                        case 2: return [4, this.loadV3()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        Dir.prototype.loadV2 = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = this;
                            _b = this.loadEntries;
                            return [4, this.loader.load("LOGDIR")];
                        case 1:
                            _a.Logics = _b.apply(this, [_c.sent()]);
                            console.log(this.Logics);
                            return [2];
                    }
                });
            });
        };
        Dir.prototype.loadEntries = function (dat) {
            if (dat.length == 0 || dat.length % 3 != 0) {
                throw ("Invalid data length");
            }
            var arr = new Array(256);
            for (var num = 0; num < dat.length / 3; num++) {
                var i = num * 3;
                var offset = (dat[i] << 16) | (dat[i + 1] << 8) | dat[i + 2];
                if (offset == 0xffffff) {
                    continue;
                }
                arr[num] = {
                    VolNum: offset >> 20,
                    Offset: offset & 0x0fffff,
                };
            }
            return arr;
        };
        Dir.prototype.loadV3 = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw "LoadV3 not implemented";
                });
            });
        };
        return Dir;
    }());
    exports.Dir = Dir;
});
define("game", ["require", "exports", "logger", "directory"], function (require, exports, log, directory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Game = (function () {
        function Game(loader, name) {
            this.loader = loader;
            this.name = name;
        }
        Game.prototype.Run = function () {
            return __awaiter(this, void 0, void 0, function () {
                var dat, dir;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            log.info("Starting game '" + this.name + "'");
                            return [4, this.loader.loadText("AGIDATA.OVL")];
                        case 1:
                            dat = _a.sent();
                            this.findVersionFromOVL(dat);
                            dir = new directory_1.Dir(this.loader, this.agiVersion == 3 ? this.name : "");
                            return [4, dir.Load()];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        Game.prototype.findVersionFromOVL = function (ovl) {
            var idx = ovl.indexOf("Version ");
            if (idx == -1) {
                throw ("couldn't find version in agidata.ovl");
            }
            var vString = ovl.slice(idx + 8);
            idx = vString.indexOf("\0");
            if (idx == -1) {
                throw ("couldn't find version seperator in agidata.ovl");
            }
            this.fullVersion = vString.slice(0, idx);
            this.agiVersion = vString[0] == '3' ? 3 : 2;
            log.debug("AGI version " + this.agiVersion + " (" + this.fullVersion + ")");
        };
        return Game;
    }());
    exports.Game = Game;
});
define("main", ["require", "exports", "logger", "loader", "game"], function (require, exports, log, loader_1, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var elements = document.getElementsByClassName('game-link');
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.addEventListener("click", click);
    }
    function click(e) {
        return __awaiter(this, void 0, void 0, function () {
            var name, loader, g, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = e.target.firstChild.nodeValue;
                        loader = new loader_1.Loader(name);
                        g = new game_1.Game(loader, name);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, g.Run()];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        log.error(e_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    }
});
//# sourceMappingURL=bundle.js.map