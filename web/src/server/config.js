export const VALVE_GPIO = process.env.NODE_ENV === 'production' ? 22 : null;
export const STATUS_GPIO = process.env.NODE_ENV === 'production' ? 27 : null;
export const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'verbose';
export const APP_HTTPS = process.env.NODE_ENV === 'production';
export const APP_SERVER_PORT = process.env.NODE_ENV === 'production' ? (APP_HTTPS ? 443 : 80) : 3000;
export const MAX_AGE = '31536000';
export const MAX_HISTORY_ITEMS = 100;
export const LONGPOLL_TIMEOUT = 30000;
export const PUBLIC_STATIC_CACHING = process.env.NODE_ENV === 'development' ? {} : {
    maxAge: MAX_AGE,
    setHeaders: (res, path) => {
        if (path === '/' || path.indexOf('.html') > 0) {
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
        }
    }
};
export const HOMEKIT_PORT = 51826;
export const HOMEKIT_USERNAME = '1A:2B:3C:4D:5E:FF';
export const MANUFACTURER = 'Glenn Conner';
export const MODEL = 'Rev 1';
export const SERIAL = '0001';
export const SETTINGS_KEY = 'settings';
export const SCHEDULE_KEY = 'schedule';
export const HISTORY_KEY = 'history';
export const WEB_USER = 'web user';
export const SCHEDULER = 'scheduler';
export const HOMEKIT_USER = 'HomeKit user';
export const SCHEDULE_CHECK_INTERVAL = 30000;
export const SESSION_EXPIRY = 2592000000;
export const SESSION_COOKIE = 'it-gets-the-hose-auth';