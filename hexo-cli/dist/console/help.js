"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const picocolors_1 = require("picocolors");
const hexo_fs_1 = require("hexo-fs");
const path_1 = require("path");
const bluebird_1 = __importDefault(require("bluebird"));
const COMPLETION_DIR = (0, path_1.join)(__dirname, '../../completion');
function helpConsole(args) {
    if (args.v || args.version) {
        return this.call('version');
    }
    else if (args.consoleList) {
        return printConsoleList(this.extend.console.list());
    }
    else if (typeof args.completion === 'string') {
        return printCompletion(args.completion);
    }
    const command = args._[0];
    if (typeof command === 'string' && command !== 'help') {
        const c = this.extend.console.get(command);
        if (c)
            return printHelpForCommand(this.extend.console.alias[command], c);
    }
    return printAllHelp(this.extend.console.list());
}
function printHelpForCommand(command, data) {
    const { options } = data;
    const desc = options.description || options.desc || data.description || data.desc;
    console.log('Usage: hexo', command, options.usage || '');
    console.log('\nDescription:');
    console.log(`${desc}\n`);
    if (options.arguments)
        printList('Arguments', options.arguments);
    if (options.commands)
        printList('Commands', options.commands);
    if (options.options)
        printList('Options', options.options);
    return bluebird_1.default.resolve();
}
function printAllHelp(list) {
    const keys = Object.keys(list);
    const commands = [];
    const { length } = keys;
    for (let i = 0; i < length; i++) {
        const key = keys[i];
        commands.push({
            name: key,
            desc: list[key].desc
        });
    }
    console.log('Usage: hexo <command>\n');
    printList('Commands', commands);
    printList('Global Options', [
        { name: '--config', desc: 'Specify config file instead of using _config.yml' },
        { name: '--cwd', desc: 'Specify the CWD' },
        { name: '--debug', desc: 'Display all verbose messages in the terminal' },
        { name: '--draft', desc: 'Display draft posts' },
        { name: '--safe', desc: 'Disable all plugins and scripts' },
        { name: '--silent', desc: 'Hide output on console' }
    ]);
    console.log('For more help, you can use \'hexo help [command]\' for the detailed information');
    console.log('or you can check the docs:', (0, picocolors_1.underline)('https://hexo.io/docs/'));
    return bluebird_1.default.resolve();
}
function printList(title, list) {
    list.sort((a, b) => {
        const nameA = a.name;
        const nameB = b.name;
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0;
    });
    const lengths = list.map(item => item.name.length);
    const maxLen = lengths.reduce((prev, current) => Math.max(prev, current));
    let str = `${title}:\n`;
    const { length } = list;
    for (let i = 0; i < length; i++) {
        const { description = list[i].desc } = list[i];
        const pad = ' '.repeat(maxLen - lengths[i] + 2);
        str += `  ${(0, picocolors_1.bold)(list[i].name)}${pad}${description}\n`;
    }
    console.log(str);
    return bluebird_1.default.resolve();
}
function printConsoleList(list) {
    console.log(Object.keys(list).join('\n'));
    return bluebird_1.default.resolve();
}
function printCompletion(type) {
    return (0, hexo_fs_1.readFile)((0, path_1.join)(COMPLETION_DIR, type)).then(content => {
        console.log(content);
    });
}
module.exports = helpConsole;
//# sourceMappingURL=help.js.map