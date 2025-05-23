"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const hexo_log_1 = __importDefault(require("hexo-log"));
const picocolors_1 = require("picocolors");
const bluebird_1 = __importDefault(require("bluebird"));
const console_1 = __importDefault(require("./extend/console"));
class Context {
    constructor(base = process.cwd(), args = {}) {
        this.base_dir = base;
        this.log = (0, hexo_log_1.default)(args);
        this.extend = {
            console: new console_1.default()
        };
    }
    init() {
        // Do nothing
    }
    call(name, args, callback) {
        if (!callback && typeof args === 'function') {
            callback = args;
            args = {};
        }
        return new bluebird_1.default((resolve, reject) => {
            const c = this.extend.console.get(name);
            if (c) {
                c.call(this, args).then(resolve, reject);
            }
            else {
                reject(new Error(`Console \`${name}\` has not been registered yet!`));
            }
        }).asCallback(callback);
    }
    exit(err) {
        if (err) {
            this.log.fatal({ err }, 'Something\'s wrong. Maybe you can find the solution here: %s', (0, picocolors_1.underline)('https://hexo.io/docs/troubleshooting.html'));
        }
        return bluebird_1.default.resolve();
    }
    unwatch() {
        // Do nothing
    }
}
module.exports = Context;
//# sourceMappingURL=context.js.map