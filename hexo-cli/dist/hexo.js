"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const picocolors_1 = require("picocolors");
const tildify_1 = __importDefault(require("tildify"));
const bluebird_1 = __importDefault(require("bluebird"));
const context_1 = __importDefault(require("./context"));
const find_pkg_1 = __importDefault(require("./find_pkg"));
const goodbye_1 = __importDefault(require("./goodbye"));
const minimist_1 = __importDefault(require("minimist"));
const resolve_1 = __importDefault(require("resolve"));
const hexo_util_1 = require("hexo-util");
const console_1 = __importDefault(require("./console"));
const help_1 = __importDefault(require("./console/help"));
const init_1 = __importDefault(require("./console/init"));
const version_1 = __importDefault(require("./console/version"));
class HexoNotFoundError extends Error {
}
function entry(cwd = process.cwd(), args) {
    args = (0, hexo_util_1.camelCaseKeys)(args || (0, minimist_1.default)(process.argv.slice(2), { string: ['_', 'p', 'path', 's', 'slug'] }));
    let hexo = new context_1.default(cwd, args);
    let { log } = hexo;
    // Change the title in console
    process.title = 'hexo';
    function handleError(err) {
        if (err && !(err instanceof HexoNotFoundError)) {
            log.fatal(err);
        }
        process.exitCode = 2;
    }
    return (0, find_pkg_1.default)(cwd, args).then(path => {
        if (!path)
            return;
        hexo.base_dir = path;
        return loadModule(path, args).catch(err => {
            log.error(err.message);
            log.error('Local hexo loading failed in %s', (0, picocolors_1.magenta)((0, tildify_1.default)(path)));
            log.error('Try running: \'rm -rf node_modules && npm install --force\'');
            throw new HexoNotFoundError();
        });
    }).then(mod => {
        if (mod)
            hexo = mod;
        log = hexo.log;
        (0, console_1.default)(hexo);
        return hexo.init();
    }).then(() => {
        let cmd = 'help';
        if (!args.h && !args.help) {
            const c = args._.shift();
            if (c && hexo.extend.console.get(c))
                cmd = c;
        }
        watchSignal(hexo);
        return hexo.call(cmd, args).then(() => hexo.exit()).catch(err => hexo.exit(err).then(() => {
            // `hexo.exit()` already dumped `err`
            handleError(null);
        }));
    }).catch(handleError);
}
entry.console = {
    init: init_1.default,
    help: help_1.default,
    version: version_1.default
};
entry.version = require('../package.json').version;
function loadModule(path, args) {
    return bluebird_1.default.try(() => {
        const modulePath = resolve_1.default.sync('hexo', { basedir: path });
        const Hexo = require(modulePath);
        return new Hexo(path, args);
    });
}
function watchSignal(hexo) {
    process.on('SIGINT', () => {
        hexo.log.info((0, goodbye_1.default)());
        hexo.unwatch();
        hexo.exit().then(() => {
            // eslint-disable-next-line no-process-exit
            process.exit();
        });
    });
}
module.exports = entry;
//# sourceMappingURL=hexo.js.map