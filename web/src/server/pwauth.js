/**
 * @format
 */
import { spawn } from 'child_process';

export default function(name, password, cb) {
    let returned = false;
    //spawn pwauth and check the users credentials
    const pwauth = spawn('pwauth', []);
    pwauth.on('close', code => {
        if (!returned) {
            returned = true;
        } else {
            return;
        }
        if (code !== 0) {
            cb(null, false);
        } else {
            cb(null, true);
        }
    });
    pwauth.on('error', err => {
        if (!returned) {
            returned = true;
            cb(err);
        }
    });
    pwauth.stdin.write(name + '\n' + password + '\n');
    pwauth.stdin.end();
}
