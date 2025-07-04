"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bluebird_1 = __importDefault(require("bluebird"));
const path_1 = require("path");
const picocolors_1 = require("picocolors");
const hexo_fs_1 = require("hexo-fs");
const tildify_1 = __importDefault(require("tildify"));
const spawn_1 = __importDefault(require("hexo-util/dist/spawn")); // for rewire
const command_exists_1 = require("command-exists");
const ASSET_DIR = (0, path_1.join)(__dirname, '../../assets');
const GIT_REPO_URL = 'https://github.com/hexojs/hexo-starter.git';
function initConsole(args) {
    console.log(args)
    return __awaiter(this, void 0, void 0, function* () {
        args = Object.assign({ install: true, clone: true }, args);
        const baseDir = this.base_dir;
        const target = args._[0] ? (0, path_1.resolve)(baseDir, args._[0]) : baseDir;
        const { log } = this;
        if ((0, hexo_fs_1.existsSync)(target) && (0, hexo_fs_1.readdirSync)(target).length !== 0) {
            log.fatal(`${(0, picocolors_1.magenta)((0, tildify_1.default)(target))} not empty, please run \`hexo init\` on an empty folder and then copy your files into it`);
            yield bluebird_1.default.reject(new Error('target not empty'));
        }
        log.info('Cloning hexo-starter', GIT_REPO_URL);
        if (args.clone) {
            try {
                yield (0, spawn_1.default)('git', ['clone', '--recurse-submodules', '--depth=1', '--quiet', GIT_REPO_URL, target], {
                    stdio: 'inherit'
                });
            }
            catch (err) {
                log.warn('git clone failed. Copying data instead');
                yield copyAsset(target);
            }
        }
        else {
            yield copyAsset(target);
        }
        yield bluebird_1.default.all([
            removeGitDir(target),
            removeGitModules(target)
        ]);
        if (!args.install)
            return;
        log.info('Install dependencies');
        let npmCommand = 'npm';
        if ((0, command_exists_1.sync)('yarn')) {
            npmCommand = 'yarn';
        }
        else if ((0, command_exists_1.sync)('pnpm')) {
            npmCommand = 'pnpm';
        }
        try {
            if (npmCommand === 'yarn') {
                const yarnVer = yield (0, spawn_1.default)(npmCommand, ['--version'], {
                    cwd: target
                });
                if (typeof yarnVer === 'string' && yarnVer.startsWith('1')) {
                    yield (0, spawn_1.default)(npmCommand, ['install', '--production', '--ignore-optional', '--silent'], {
                        cwd: target,
                        stdio: 'inherit'
                    });
                }
                else {
                    npmCommand = 'npm';
                }
            }
            else if (npmCommand === 'pnpm') {
                yield (0, spawn_1.default)(npmCommand, ['install', '--prod', '--no-optional', '--silent'], {
                    cwd: target,
                    stdio: 'inherit'
                });
            }
            if (npmCommand === 'npm') {
                yield (0, spawn_1.default)(npmCommand, ['install', '--only=production', '--optional=false', '--silent'], {
                    cwd: target,
                    stdio: 'inherit'
                });
            }
            log.info('Start blogging with Hexo!');
        }
        catch (err) {
            log.warn(`Failed to install dependencies. Please run 'npm install' in "${target}" folder.`);
        }
    });
}
function copyAsset(target) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, hexo_fs_1.copyDir)(ASSET_DIR, target, { ignoreHidden: false });
    });
}
function removeGitDir(target) {
    const gitDir = (0, path_1.join)(target, '.git');
    return (0, hexo_fs_1.stat)(gitDir).catch(err => {
        if (err && err.code === 'ENOENT')
            return;
        throw err;
    }).then(stats => {
        if (stats) {
            return stats.isDirectory() ? (0, hexo_fs_1.rmdir)(gitDir) : (0, hexo_fs_1.unlink)(gitDir);
        }
    }).then(() => (0, hexo_fs_1.readdir)(target)).map(path => (0, path_1.join)(target, path)).filter(path => (0, hexo_fs_1.stat)(path).then(stats => stats.isDirectory())).each(removeGitDir);
}
function removeGitModules(target) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, hexo_fs_1.unlink)((0, path_1.join)(target, '.gitmodules'));
        }
        catch (err) {
            if (err && err.code === 'ENOENT')
                return;
            throw err;
        }
    });
}
module.exports = initConsole;
//# sourceMappingURL=init.js.map