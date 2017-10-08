const child_process = require('child_process');
const process = require('process');
const config = require('./config');

child_process.execSync('git checkout master');
if (process.platform.startsWith('win')) {
    // 7z
    // http://blog.csdn.net/xhhjin/article/details/7380284
    child_process.execSync(`7z x "${config.win.path}\\browser\\omni.ja" -obrowser-omni -aoa`);
    child_process.execSync(`7z x "${config.win.path}\\omni.ja" -oglobal-omni -aoa`);
} else {
    // zip
    // http://man.linuxde.net/unzip
    child_process.execSync(`unzip -o ${config.unix.path}/browser/omni.ja -d /browser-omni`);
    child_process.execSync(`unzip -o ${config.unix.path}/omni.ja -d /global-omni`);
}

child_process.execSync(`git add . -m "Update to ${(new Date).toLocaleString()}"`);
child_process.execSync('git push');
child_process.execSync('git checkout develop');
child_process.execSync('git rebase master');
child_process.execSync('git push');
console.log('complete update!!!');

child_process.execSync('npm run pack');

