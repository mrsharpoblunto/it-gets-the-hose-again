/*
 * @format
 */
const {createProxyMiddleware} = require('http-proxy-middleware');
const express = require('express');
const watcher = require('@parcel/watcher');
const restartable = require('restartable-process');
const tcpPortUsed = require('tcp-port-used');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = 3002;

let restartingApi = false;
let bufferedApiRequests = [];
const node = new restartable(
  'node',
  [path.join(__dirname, '../index.js'), '--inspect'],
  {
    env: {PORT: API_PORT},
  },
);
node.restart(() => {});

watcher.subscribe(path.join(__dirname, '../lib'), () => {
  restartingApi = true;
  node.restart(() => {
    tcpPortUsed.waitUntilUsed(API_PORT, 100, 5000).then(() => {
      console.log('[DEVSERVER] Restarted app server');
      restartingApi = false;
      const b = bufferedApiRequests;
      bufferedApiRequests = [];
      b.forEach(r => r());
    });
  });
});

app.use(
  (req, res, next) => {
    if (restartingApi) {
      bufferedApiRequests.push(next);
    } else {
      next();
    }
  },
  createProxyMiddleware({
    target: 'http://localhost:' + API_PORT,
  }),
);

app.listen(PORT, () => {
  console.log('[DEVSERVER] Listening on port ' + PORT);
});
