/*
 * @format
 */
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import storage from 'node-persist';
import * as hap from 'hap-nodejs';
import {v4 as uuidv4} from 'uuid';

import express from 'express';
//express middleware
import morgan from 'morgan';
import compression from 'compression';
import errorHandler from 'errorhandler';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import winston from 'winston';

import configureApiRoutes from './api';
import pwauth from './pwauth';
import {createSession, destroySession} from './session';
import ValveController from './valve-controller';
import Scheduler from './scheduler';
import HistoryLogger from './history-logger';
import * as config from './config';
import keys from '../../keys.json';

// configure express and its middleware
const app = express();
const port = process.env.PORT || config.APP_SERVER_PORT;

app.enable('trust proxy');
app.set('port', port);
app.use(compression());

// configure logging
app.logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      info => `${info.timestamp} - ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console({
      level: config.LOG_LEVEL,
    }),
  ],
});
app.use(
  morgan('combined', {
    stream: {
      write: message => {
        app.logger.verbose(message);
      },
    },
  }),
);

app.use(cookieParser(uuidv4()));
app.use(bodyParser.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(
    errorHandler({
      dumpExceptions: true,
      showStack: true,
    }),
  );
}

// setup storage engine
app.storage = storage;
(async () => {
  await storage.init({
    dir: 'persist',
    forgiveParseErrors: true,
  });

  // create the history logger
  app.history = new HistoryLogger(
    app.storage,
    app.logger,
    config.MAX_HISTORY_ITEMS,
  );

  // create the valve controller
  app.valveController = new ValveController(app.history, app.logger);

  // load the watering scheduler
  app.scheduler = new Scheduler(
    keys.OPEN_WEATHER_API_KEY,
    app.storage,
    app.history,
    app.logger,
    app.valveController,
  );

  app.logger.info('Scheduler starting...');
  await app.scheduler.start(false);
  app.logger.info('Scheduler running');

  configureApiRoutes(app);
  configureRoutes(app);
  startHomekitServer(app);
  startServer(app);
})();

function configureRoutes(app) {
  app.use(
    express.static(
      path.join(__dirname, '../../dist'),
      config.PUBLIC_STATIC_CACHING,
    ),
  );

  app.post('/login', (req, res) => {
    if (!req.body || !req.body.name || !req.body.password) {
      return res.json({
        success: false,
        message: 'Required properties "name" and "password" were not present',
      });
    }

    pwauth(req.body.name, req.body.password, (err, success) => {
      if (err) {
        app.logger.error(`Unable to authenticate via pwauth - ${err.stack}`);
        res.sendStatus(500);
      } else if (success) {
        createSession(res);
        res.json({
          success: true,
        });
      } else {
        app.logger.warn(`User ${req.body.name} failed authorization`);
        res.json({
          success: false,
          message: 'Invalid user name or password',
        });
      }
    });
  });

  app.get('/logout', (req, res) => {
    destroySession(res);
    res.redirect('/');
  });

  /**
   * handle rendering of the UI
   */
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });
}

function startHomekitServer(app) {
  hap.init();
  const accessory = require('./valve-accessory').default(app.valveController);
  accessory.publish({
    port: config.HOMEKIT_PORT,
    username: config.HOMEKIT_USERNAME,
    pincode: keys.HOMEKIT_PINCODE,
  });
  app.logger.info('Published HomeKit Accessory Info');
}

function startServer(app) {
  const server = config.APP_HTTPS
    ? https.createServer(sslConfig(), app)
    : http.createServer(app);
  let started = false;
  server
    .listen(port, () => {
      app.logger.info('Express server awaiting connections on port ' + port);
      started = true;
    })
    .on('error', err => {
      if (started) {
        app.logger.error(err.stack);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        app.logger.error(
          `Unable to listen on port ${port}. This is usually due to the process not having permissions to bind to this port. Did you mean to run the server in dev mode with a non-priviledged port instead?`,
        );
        process.exit(1);
      } else if (err.code === 'EADDRINUSE') {
        app.logger.error(
          `Unable to listen on port ${port} because another process is already listening on this port. Do you have another instance of the server already running?`,
        );
        process.exit(1);
      }
    });
}

function sslConfig() {
  return {
    cert: tryReadFileSync(path.join(__dirname, '../../ssl', 'server.crt')),
    key: tryReadFileSync(path.join(__dirname, '../../ssl', 'server.key')),
  };
}

function tryReadFileSync(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (err) {
    return null;
  }
}
