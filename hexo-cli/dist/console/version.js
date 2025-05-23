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
const os_1 = __importDefault(require("os"));
const pkg = require('../../package.json');
const bluebird_1 = __importDefault(require("bluebird"));
const hexo_util_1 = require("hexo-util");
function versionConsole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { versions, platform } = process;
        const keys = Object.keys(versions);
        if (this.version) {
            console.log('hexo:', this.version);
        }
        console.log('hexo-cli:', pkg.version);
        let osInfo;
        if (platform === 'darwin')
            osInfo = yield (0, hexo_util_1.spawn)('sw_vers', '-productVersion');
        else if (platform === 'linux') {
            const v = yield (0, hexo_util_1.spawn)('cat', '/etc/os-release');
            const distro = String(v || '').match(/NAME="(.+)"/);
            const versionInfo = String(v || '').match(/VERSION="(.+)"/) || ['', ''];
            const versionStr = versionInfo !== null ? versionInfo[1] : '';
            osInfo = `${distro[1]} ${versionStr}`.trim() || '';
        }
        osInfo = `${os_1.default.platform()} ${os_1.default.release()} ${osInfo}`;
        console.log('os:', osInfo);
        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            console.log('%s: %s', key, versions[key]);
        }
        yield bluebird_1.default.resolve();
    });
}
module.exports = versionConsole;
//# sourceMappingURL=version.js.map