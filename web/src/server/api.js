/*
 * @format
 */
import uuid from 'node-uuid';
import fetch from 'node-fetch';
import keys from '../../keys.json';
import * as config from './config';
import {middleware} from './session';

export default function (app) {
  if (process.env.NODE_ENV === 'production') {
    app.use('/api/*', middleware);
  }

  function waitForValveEvent(timeout, callback) {
    let listener = null;
    let timeoutHandle = setTimeout(() => {
      app.valveController.removeListener('setOpen', listener);
      callback(true, null);
    }, timeout);
    listener = ({open}) => {
      app.valveController.removeListener('setOpen', listener);
      clearTimeout(timeoutHandle);
      callback(false, open);
    };
    app.valveController.addListener('setOpen', listener);
  }

  app.get('/api/1/poll-valve', (req, res) => {
    const query = req.query.open === 'true';
    if (query !== app.valveController.getOpen()) {
      return res.json({
        success: true,
        change: true,
        open: app.valveController.getOpen(),
      });
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      res.write(''); // flush headers to the client
      waitForValveEvent(
        req.query.timeout < 60000 ? req.query.timeout : 60000,
        (timedOut, open) => {
          res.write(
            JSON.stringify({
              success: true,
              change: timedOut ? false : open !== query,
              open,
            }),
          );
          res.end();
        },
      );
    }
  });

  app.post('/api/1/toggle-valve', async (req, res) => {
    try {
      const {open} = await app.valveController.toggleOpen(config.WEB_USER);
      res.json({
        success: true,
        open,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
      });
    }
  });

  app.get('/api/1/history', async (req, res) => {
    try {
      const value = await app.storage.getItem(config.HISTORY_KEY);
      if (!value) {
        res.json({
          items: [],
          latest: null,
          success: true,
        });
      } else {
        let items = value.items;
        if (req.query.after) {
          items = items.filter(i => i.id > req.query.after);
        }
        res.json({
          items,
          latest: items.length > 0 ? items[0].id : null,
          success: true,
        });
      }
    } catch (err) {
      app.logger.error(`Unable to get history items - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  app.get('/api/1/schedule', async (req, res) => {
    try {
      const value = await app.storage.getItem(config.SCHEDULE_KEY);
      res.json({
        items: value ? value.items : [],
        success: true,
      });
    } catch (err) {
      app.logger.error(`Unable to get schedule items - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  app.delete('/api/1/schedule/:id', async (req, res) => {
    try {
      const value = (await app.storage.getItem(config.SCHEDULE_KEY)) || {
        items: [],
      };

      value.items = value.items.filter(item => {
        return item.id !== req.params.id;
      });
      await app.storage.setItem(config.SCHEDULE_KEY, value);
      app.scheduler.reload();
      res.json({
        success: true,
      });
    } catch (err) {
      app.logger.error(`Unable to set schedule items - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  app.post('/api/1/schedule', async (req, res) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'expected JSON body in request',
      });
    }

    if (
      typeof req.body.duration !== 'number' ||
      req.body.duration < 1 ||
      req.body.duration > 60
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required field "duration" not present or is not a Number between 1 and 60',
      });
    }

    if (
      typeof req.body.time !== 'number' ||
      req.body.time < 0 ||
      req.body.time > 23
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required field "time" not present or is not a Number between 0 and 23',
      });
    }

    if (
      typeof req.body.frequency !== 'number' ||
      req.body.frequency < 1 ||
      req.body.frequency > 7
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required field "frequency" not present or is not a Number between 1 and 7',
      });
    }

    let newItem = {
      id: uuid.v4(),
      duration: req.body.duration,
      time: req.body.time,
      frequency: req.body.frequency,
    };

    try {
      const value = (await app.storage.getItem(config.SCHEDULE_KEY)) || {
        items: [],
        waterUntil: 0,
      };
      value.items.push(newItem);
      await app.storage.setItem(config.SCHEDULE_KEY, value);

      app.scheduler.reload();
      res.json({
        success: true,
        newItem,
      });
    } catch (err) {
      app.logger.error(`Unable to set schedule items - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  function getDefaultSettings() {
    return {
      shutoffDuration: 0,
      location: null,
    };
  }

  app.get('/api/1/settings', async (req, res) => {
    try {
      const settings = await app.storage.getItem(config.SETTINGS_KEY);
      res.json({
        success: true,
        settings: settings || getDefaultSettings(),
      });
    } catch (err) {
      app.logger.error(`Unable to get settings - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  app.post('/api/1/settings', async (req, res) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'expected JSON body in request',
      });
    }

    try {
      const settings =
        (await app.storage.getItem(config.SETTINGS_KEY)) ||
        getDefaultSettings();

      if (typeof req.body.shutoffDuration !== 'undefined') {
        if (
          typeof req.body.shutoffDuration !== 'number' ||
          req.body.shutoffDuration < 0 ||
          req.body.duration >= 60
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Optional field "shutoffDuration" is not a Number between 0 and 60',
          });
        }
        settings.shutoffDuration = req.body.shutoffDuration;
      }

      if (typeof req.body.location !== 'undefined') {
        if (
          req.body.location !== null &&
          (typeof req.body.location.latitude !== 'number' ||
            typeof req.body.location.longitude !== 'number')
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Optional field "location" is not a latitude/longitude coordinate pair',
          });
        }
        settings.location = req.body.location;
      }

      await app.storage.setItem(config.SETTINGS_KEY, settings);
      app.scheduler.reload();
      res.json({
        success: true,
        settings,
      });
    } catch (err) {
      app.logger.error(`Unable to set settings - ${err.stack}`);
      res.status(500).json({
        success: false,
      });
    }
  });

  app.get('/api/1/weather', async (req, res) => {
    if (!req.query.lat) {
      return res.json({
        success: false,
        message: 'Required querystring parameter "lat" not present',
      });
    }

    if (!req.query.lon) {
      return res.json({
        success: false,
        message: 'Required querystring parameter "lon" not present',
      });
    }

    try {
      const apiRes = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${keys.OPEN_WEATHER_API_KEY}`,
      );
      const json = await apiRes.json();
      const weather = json.weather[0];
      weather.icon = `https://openweathermap.org/img/w/${weather.icon}.png`;
      res.json({
        success: true,
        weather,
      });
    } catch (err) {
      app.logger.error(`Unable to get weather information - ${err.stack}`);
      res.json({
        success: false,
        message: 'Unable to contact Open Weather API',
      });
    }
  });
}
