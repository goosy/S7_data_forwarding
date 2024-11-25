import { exec } from 'node:child_process';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from "node:url";
import pkg from '../package.json' with { type: 'json' };
import mri from 'mri';

const argv = mri(process.argv.slice(2), {
    boolean: ['help', 'version'],
    alias: {
        help: ['h', 'H'],
        version: ['v', 'V'],
    }
});
const [cmd = 'help', _path = '.'] = argv._;

process.chdir(_path);
const work_path = process.cwd();
const module_path = dirname(fileURLToPath(import.meta.url));
const version = pkg.version;

function show_help() {
    console.log(`usage:

s7data [subcommand] [path] [options]

subcommand 子命令:
  help                       打印本帮助，这是默认子命令
  start                      以当前目录下的配置文件运行数据采集转发
  stop                       结束当前目录配置文件所在的数据采集转发
  list                       显示有多少个pm2托管的进程，包括数据采集转发实例
  debug                      以当前目录下的配置文件运行数据采集转发，但不压入后台，用于调试
  log                        显示日志
  flush                      清空log

path 参数:  指示配置文件所在的目录，默认为 "." 即省略时为当前目录

options:
--version     | -V | -v      显示版本号，会忽略任何 subcommand 子命令
--help        | -H           打印本帮助，会忽略任何 subcommand 子命令

例子:
s7data                      以当前目录下的配置文件运行
s7data start ./conf         以 ./conf 目录下的配置文件运行
s7data stop
`);
}

if (argv.version) {
    console.log(`V${version}`);
} else if (argv.help) {
    show_help();
} else if (cmd === 'start') {
    exec(
        `pm2 start --name="s7data-${basename(work_path)}" "${join(module_path, 'main.js')}"`,
        { cwd: work_path }
    );
} else if (cmd === 'stop') {
    exec(
        `pm2 delete "s7data-${basename(work_path)}"`,
        { cwd: work_path }
    );
} else if (cmd === 'list') {
    exec('pm2 list', (error, stdout, _) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(stdout);
    });
} else if (cmd === 'debug') {
    const { context } = await import('./main.js');
    context.silent = argv.silent ?? false;
} else if (cmd === 'log') {
    exec('pm2 log');
} else if (cmd === 'flush') {
    exec('pm2 flush');
} else {
    show_help();
}
