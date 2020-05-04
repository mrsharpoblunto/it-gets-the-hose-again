/**
 * @format
 */
import uuid from 'node-uuid';
import * as config from './config';

export function middleware(req, res, next) {
    const id = req.signedCookies[config.SESSION_COOKIE];
    if (!id) {
        res.sendStatus(401);
    } else {
        next();
    }
}

export function createSession(res) {
    const id = uuid.v4();
    res.cookie(config.SESSION_COOKIE, id, {
        httpOnly: true,
        secure: config.APP_HTTPS,
        signed: true,
        maxAge: config.SESSION_EXPIRY
    });
}

export function destroySession(res) {
    res.clearCookie(config.SESSION_COOKIE);
}
