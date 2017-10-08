// update

const child_process = require('child_process');
const process = require('process');
const config = require('./config');

if (process.platform.startsWith('win')) {
    // 7z
    // http://www.jb51.net/article/30541.htm
    child_process.execSync(`7z a "${config.win.path}\\browser\\omni.ja" -aoa -tzip -mx=0`, {cwd: 'browser-omni'});
    child_process.execSync(`7z a "${config.win.path}\\omni.ja" -aoa -tzip -mx=0`, {cwd: 'global-omni'});
} else {
    // zip
    // http://man.linuxde.net/zip
    child_process.execSync(`zip -q -r ${config.unix.path}/browser/omni.ja *`, {cwd: 'browser-omni'});
    child_process.execSync(`zip -q -r ${config.unix.path}/omni.ja *`, {cwd: 'global-omni'});
}
console.log('complete!!!');
