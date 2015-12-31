import { spawn } from 'child_process';
import basicAuth from 'basic-auth';

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
}

export default function(app) {
    return (req,res,next)=> {
        const user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        }

        //spawn pwauth and check the users credentials
        const pwauth = spawn('pwauth',[]);
        pwauth.on('close',code => {
            if (code !== 0) {
                app.logger.warning(`User ${user.name} failed authorization`);
                unauthorized(res);
            } else {
                next();
            }
        });
        pwauth.on('error',err => {
            app.logger.error(`Unable to authenticate via pwauth - ${err.stack}`);
            res.sendStatus(500);
        });
        pwauth.stdin.write(user.name+'\n'+user.pass+'\n');
        pwauth.stdin.end();
    }
    
}
