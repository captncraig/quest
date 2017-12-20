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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
define("baseEntry", ["require", "exports", "logger"], function (require, exports, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Entry = (function () {
        function Entry(VolNum, Offset, loader) {
            this.VolNum = VolNum;
            this.Offset = Offset;
            this.loader = loader;
        }
        Entry.prototype.Data = function () {
            return __awaiter(this, void 0, void 0, function () {
                var vol, errHeader, fullSize;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.bytes) {
                                return [2, this.bytes];
                            }
                            log.verbose("Loading Vol." + this.VolNum + "@" + this.Offset);
                            return [4, this.loader.load("VOL." + this.VolNum)];
                        case 1:
                            vol = _a.sent();
                            vol = vol.slice(this.Offset);
                            errHeader = "Bad resource in vol " + this.VolNum + " offset " + this.Offset + ":";
                            if (vol[0] != 0x12 || vol[1] != 0x34) {
                                throw (errHeader + " signature not found");
                            }
                            fullSize = vol[3] | (vol[4] << 8);
                            log.verbose(fullSize + " bytes");
                            vol = vol.slice(5, fullSize + 5);
                            this.bytes = vol;
                            return [2, vol];
                    }
                });
            });
        };
        return Entry;
    }());
    exports.Entry = Entry;
});
define("screen", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Screen = (function () {
        function Screen(width, height) {
            this.width = width;
            this.height = height;
            this.data = new Uint8Array(width * height);
        }
        Screen.prototype.Set = function (x, y, c) {
            this.data[x + y * this.width] = c;
            if (this.ctx2d) {
                this.ctx2d.fillStyle = palette[c];
                this.ctx2d.fillRect(x * 2, y, 2, 1);
            }
        };
        Screen.prototype.Get = function (x, y) {
            return this.data[x + y * this.width];
        };
        Screen.prototype.Clear = function (c) {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    this.data[x + y * this.width] = c;
                    if (this.ctx2d) {
                        this.ctx2d.fillStyle = palette[c];
                        this.ctx2d.fillRect(x * 2, y, 2, 1);
                    }
                }
            }
        };
        return Screen;
    }());
    exports.Screen = Screen;
    var palette = [
        "#000000",
        "#0000AA",
        "#00AA00",
        "#00AAAA",
        "#AA0000",
        "#AA00AA",
        "#AA5500",
        "#AAAAAA",
        "#555555",
        "#5555FF",
        "#55FF55",
        "#55FFFF",
        "#FF5555",
        "#FF55FF",
        "#FFFF55",
        "#FFFFFF",
    ];
});
define("pictures", ["require", "exports", "baseEntry"], function (require, exports, baseEntry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sleep(ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    }
    var Picture = (function (_super) {
        __extends(Picture, _super);
        function Picture() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Picture.prototype.Draw = function (visual, priority) {
            return __awaiter(this, void 0, void 0, function () {
                var dat, idx, take, op, x0, y0, x1, y1, x, y, x, y;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.visual = visual;
                            this.priority = priority;
                            this.visual.Clear(0x0f);
                            this.priority.Clear(0x04);
                            return [4, this.Data()];
                        case 1:
                            dat = _a.sent();
                            idx = 0;
                            take = function () {
                                idx++;
                                return dat[idx - 1];
                            };
                            this.priEnabled = true;
                            this.vizEnabled = true;
                            this.priColor = 0;
                            this.vizColor = 0;
                            _a.label = 2;
                        case 2:
                            if (!(idx < dat.length)) return [3, 4];
                            op = take();
                            return [4, sleep(5)];
                        case 3:
                            _a.sent();
                            switch (op) {
                                case 0xf0:
                                    this.vizEnabled = true;
                                    this.vizColor = take();
                                    console.log("visual = ", this.vizColor);
                                    break;
                                case 0xf1:
                                    this.vizEnabled = false;
                                    break;
                                case 0xf2:
                                    this.priEnabled = true;
                                    this.priColor = take();
                                    console.log("priority = ", this.vizColor);
                                    break;
                                case 0xf3:
                                    this.priEnabled = false;
                                    break;
                                case 0xf6:
                                    console.log("absline");
                                    x0 = take();
                                    y0 = take();
                                    while (dat[idx] < 0xf0) {
                                        x1 = take();
                                        y1 = take();
                                        this.drawLine(x0, y0, x1, y1);
                                        x0 = x1;
                                        y0 = y1;
                                    }
                                    break;
                                case 0xf8:
                                    console.log("fill");
                                    while (dat[idx] < 0xf0) {
                                        x = take();
                                        y = take();
                                        this.fill(x, y);
                                    }
                                    break;
                                case 0xfa:
                                    console.log("plot");
                                    while (dat[idx] < 0xf0) {
                                        x = take();
                                        y = take();
                                        this.setPixel(x, y);
                                    }
                                    break;
                                case 0xff:
                                    console.log("done!");
                                    return [2];
                                default:
                                    throw ("Unkown Picture OP: 0x" + op.toString(16));
                            }
                            return [3, 2];
                        case 4: return [2];
                    }
                });
            });
        };
        Picture.prototype.setPixel = function (x, y, drawViz, drawPri) {
            if (drawViz === void 0) { drawViz = true; }
            if (drawPri === void 0) { drawPri = true; }
            if (this.vizEnabled && drawViz) {
                this.visual.Set(x, y, this.vizColor);
            }
            if (this.priEnabled && drawPri) {
                this.priority.Set(x, y, this.priColor);
            }
        };
        Picture.prototype.round = function (aNumber, dirn) {
            if (dirn < 0)
                return ((aNumber - Math.floor(aNumber) <= 0.501) ?
                    Math.floor(aNumber) : Math.ceil(aNumber));
            return ((aNumber - Math.floor(aNumber) < 0.499) ?
                Math.floor(aNumber) : Math.ceil(aNumber));
        };
        Picture.prototype.drawLine = function (x1, y1, x2, y2) {
            var x, y;
            var height = y2 - y1;
            var width = x2 - x1;
            var addX = (height == 0 ? height : width / Math.abs(height));
            var addY = (width == 0 ? width : height / Math.abs(width));
            if (Math.abs(width) > Math.abs(height)) {
                y = y1;
                addX = (width == 0 ? 0 : width / Math.abs(width));
                for (x = x1; x != x2; x += addX) {
                    this.setPixel(this.round(x, addX), this.round(y, addY));
                    y += addY;
                }
                this.setPixel(x2, y2);
            }
            else {
                x = x1;
                addY = (height == 0 ? 0 : height / Math.abs(height));
                for (y = y1; y != y2; y += addY) {
                    this.setPixel(this.round(x, addX), this.round(y, addY));
                    x += addX;
                }
                this.setPixel(x2, y2);
            }
        };
        Picture.prototype.fill = function (x, y) {
            var q = [x, y];
            while (q.length) {
                x = q[0];
                y = q[1];
                q = q.slice(2);
                if (this.vizEnabled) {
                    if (this.visual.Get(x, y) != 0x0f) {
                        continue;
                    }
                    this.setPixel(x, y, true, false);
                }
                if (this.priEnabled) {
                    if (this.priority.Get(x, y) != 0x04) {
                        continue;
                    }
                    this.setPixel(x, y, false, true);
                }
                if (x > 0) {
                    q.push(x - 1);
                    q.push(y);
                }
                if (x < this.visual.width) {
                    q.push(x + 1);
                    q.push(y);
                }
                if (y > 0) {
                    q.push(x);
                    q.push(y - 1);
                }
                if (y < this.visual.height) {
                    q.push(x);
                    q.push(y + 1);
                }
            }
        };
        return Picture;
    }(baseEntry_1.Entry));
    exports.Picture = Picture;
});
define("directory", ["require", "exports", "baseEntry", "pictures", "screen"], function (require, exports, baseEntry_2, pictures_1, screen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var View = (function (_super) {
        __extends(View, _super);
        function View() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return View;
    }(baseEntry_2.Entry));
    exports.View = View;
    var Logic = (function (_super) {
        __extends(Logic, _super);
        function Logic() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Logic;
    }(baseEntry_2.Entry));
    exports.Logic = Logic;
    var Sound = (function (_super) {
        __extends(Sound, _super);
        function Sound() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Sound;
    }(baseEntry_2.Entry));
    exports.Sound = Sound;
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
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, canvas, ctx, viz, prio;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0:
                            _a = this;
                            _b = this.loadEntries;
                            _c = [Logic];
                            return [4, this.loader.load("LOGDIR")];
                        case 1:
                            _a.Logics = _b.apply(this, _c.concat([_o.sent()]));
                            _d = this;
                            _e = this.loadEntries;
                            _f = [View];
                            return [4, this.loader.load("VIEWDIR")];
                        case 2:
                            _d.Views = _e.apply(this, _f.concat([_o.sent()]));
                            _g = this;
                            _h = this.loadEntries;
                            _j = [pictures_1.Picture];
                            return [4, this.loader.load("PICDIR")];
                        case 3:
                            _g.Pictures = _h.apply(this, _j.concat([_o.sent()]));
                            _k = this;
                            _l = this.loadEntries;
                            _m = [Sound];
                            return [4, this.loader.load("SNDDIR")];
                        case 4:
                            _k.Sounds = _l.apply(this, _m.concat([_o.sent()]));
                            canvas = document.getElementById("screen");
                            ctx = canvas.getContext("2d");
                            viz = new screen_1.Screen(160, 200);
                            viz.ctx2d = ctx;
                            prio = new screen_1.Screen(160, 200);
                            return [4, this.Pictures[1].Draw(viz, prio)];
                        case 5:
                            _o.sent();
                            return [2];
                    }
                });
            });
        };
        Dir.prototype.loadEntries = function (c, dat) {
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
                arr[num] = new c(offset >> 20, offset & 0x0fffff, this.loader);
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