define("loader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.x = function () {
        console.log("XXXX");
    };
});
define("main", ["require", "exports", "loader"], function (require, exports, loader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("ssss");
    loader_1.x();
});
//# sourceMappingURL=bundle.js.map