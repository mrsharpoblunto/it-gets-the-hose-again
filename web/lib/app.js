'use strict'
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import storage from 'node-persist';
import hap from 'hap-nodejs';

import express from 'express';
//express middleware
import morgan from 'morgan';
import compression from 'compression';
import errorHandler from 'errorhandler';
import bodyParser from 'body-parser';
import winston from 'winston';

import configureApiRoutes from './api';
import pwauth from './pwauth';
import ValveController from './valve-controller';
import Scheduler from './scheduler';
import HistoryLogger from './history-logger';
import * as config from './config';

// configure express and its middleware
const app = express();
app.enable('trust proxy');
app.set('port',config.APP_SERVER_PORT);
app.use(compression());

// configure logging
app.logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      level: config.LOG_LEVEL,
      colorize: true,
      timestamp: true
    })
  ]
});
app.use(morgan('combined',{ stream: {
  write: message => app.logger.verbose(message)
}}));

app.use(bodyParser.json());
if (process.env.NODE_ENV === 'production') {
    app.use(pwauth);
} else {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

// setup storage engine
app.storage = storage;
storage.initSync();

// create the history logger
app.history = new HistoryLogger(
    app.storage,
    app.logger,
    config.MAX_HISTORY_ITEMS);

// create the valve controller
app.valveController = new ValveController(
    app.history,
    app.logger);

// load the watering scheduler
app.scheduler = new Scheduler(
    app.storage,
    app.history,
    app.logger,
    app.valveController);
app.scheduler.start();

configureApiRoutes(app);
configureRoutes(app);
startHomekitServer(app);
startServer(app);

function configureRoutes(app) {
  app.use(express.static(path.join(__dirname,'..','public'),config.PUBLIC_STATIC_CACHING));

  /**
   * when running in dev mode without using the webpack-dev-server, we don't want
   * the app to try and handle requests coming from the client that are intended
   * for the webpack-dev-server
   */
  app.get('/socket.io*',function(req,res) {
      const message = 'You are not running this application via webpack-dev-server. Browse to this application using the webpack-dev-server port to enable webpack support';
      app.logger.warn(message);
      res.statusCode = 502;
      res.write(message);
      res.end();
  });

  /**
   * handle rendering of the UI
   */
  app.get('/*',(req,res) => {
    res.sendFile(path.join(__dirname,'..','public','index.html'));
  });
}

function startHomekitServer(app) {
   hap.init();
   const accessory = require('./valve-accessory')(app.valveController);
   accessory.publish({
        port: config.HOMEKIT_PORT,
        username: config.HOMEKIT_USERNAME,
        pincode: config.HOMEKIT_PINCODE
   });
   app.logger.info('Published HomeKit Accessory Info');  
}

function startServer(app) {
    const server = config.APP_HTTPS ? https.createServer(sslConfig(),app) : http.createServer(app)
    let started = false;
    server.listen(config.APP_SERVER_PORT, () => {
        app.logger.info('Express server awaiting connections');
        started = true;
    }).on('error',err=> {
      if (started) {
        app.logger.error(err.stack);
      }
      else if (err.code === 'EACCES') {
        app.logger.error(`Unable to listen on port ${config.APP_SERVER_PORT}. This is usually due to the process not having permissions to bind to this port. Did you mean to run the server in dev mode with a non-priviledged port instead?`);
      }
      else if (err.code === 'EADDRINUSE') {
        app.logger.error(`Unable to listen on port ${config.APP_SERVER_PORT} because another process is already listening on this port. Do you have another instance of the server already running?`);
      }
    });
}

function sslConfig() {
    return {
        cert: tryReadFileSync(path.join(__dirname,'..','ssl','server.crt')),
        key: tryReadFileSync(path.join(__dirname,'..','ssl','server.key'))
    };
}

function tryReadFileSync(path) {
  try
  {
    return fs.readFileSync(path,'utf8');
  }
  catch (err) {
    return null; 
  }
}