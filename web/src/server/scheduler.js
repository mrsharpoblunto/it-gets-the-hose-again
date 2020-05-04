/**
 * @format
 */
import fetch from 'node-fetch';
import * as config from './config';

function systemTimer() {
    return {
        now: function() {
            return new Date();
        }
    };
}

export default class Scheduler {
    constructor(apiKey, storage, history, logger, valveController, fetcher = fetch, timer = systemTimer()) {
        this.storage = storage;
        this.fetcher = fetcher;
        this.history = history;
        this.logger = logger;
        this.valveController = valveController;
        this.timer = timer;
        this.settings = {};
        this.schedule = [];
        this.waterUntil = 0;
        this.apiKey = apiKey;
    }

    async start(manualChecking) {
        await this._load();
        this.valveController.on('setOpen', ({
            open, source
        }) => {
            if (source !== config.SCHEDULER) {
                if (open && this.settings.shutoffDuration) {
                    // ensure that if we manually opened the valve
                    // that it shuts off after a specified amount
                    // of time (if configured)
                    this.waterUntil = this.timer.now().getTime() + (this.settings.shutoffDuration * 60 * 1000);
                } else {
                    // manually setting the valve disables any
                    // scheduled waterings
                    this.waterUntil = 0;
                }
            }
        });
        if (!manualChecking) {
            await this.check();
            this.checkHandle = setInterval(async () => await this.check(), config.SCHEDULE_CHECK_INTERVAL);
        }
    }

    stop() {
        clearInterval(this.checkHandle);
    }

    async reload() {
      await this._load();
      this.logger.info('Scheduler reloaded');
    }

    async _load() {
      try {
        const settings = await this.storage.getItem(config.SETTINGS_KEY);
        this.settings = settings || {};
        const schedule = await this.storage.getItem(config.SCHEDULE_KEY);
        this.schedule = schedule ? schedule.items : [];
      } catch(err) {
        this.logger.error(`Unable to load schedule ${err.stack}`);
      }
    }

    async check() {
        const now = this.timer.now();
        const currentHour = now.getHours();
        this.logger.verbose(`Checking schedule for hour ${currentHour}`);
        let updated = false;
        this.schedule.map(item => {
            this.logger.debug(JSON.stringify(item));
            if (item.time === currentHour && (!item.nextRun || now.getTime() >= item.nextRun)
                // don't start new tasks if we're more than 5 minutes
                // past the hour
                && now.getMinutes() < 5) {
                item.nextRun = this._startOfDay(now) + ((86400 * item.frequency) + (3600 * item.time)) * 1000;
                this.logger.verbose(`Schedule item will run - next run ${item.nextRun}`);
                const nextWater = now.getTime() + (item.duration * 60 * 1000);
                if (nextWater > this.waterUntil) {
                    this.logger.verbose(`Will water until ${nextWater}`);
                    this.waterUntil = nextWater;
                }
                updated = true;
            }
        });

        if (updated) {
          try {
            await this.storage.setItem(config.SCHEDULE_KEY, {
                items: this.schedule
            });
          } catch(err) {
            this.logger.error(`Unable to update schedule ${err.stack}`);
          }
          if (this.settings.location) {
              const {shouldWater , weatherDesc} = await this._checkWeather(this.settings.location);
              if (!shouldWater) {
                  await this.history.write(config.SCHEDULER, `Watering cancelled due to weather conditions - ${weatherDesc}`);
                  await this._setValve(false);
                  this.waterUntil = 0;
              } else {
                  await this._setValve(true);
              }
          } else {
              await this._setValve(true);
          }
        } else if (this.waterUntil) {
            await this._setValve(this.waterUntil > now.getTime());
        }
    }

    async _setValve(open) {
      try {
        await this.valveController.setOpen(open, config.SCHEDULER);
      } catch (err) {
        this.logger.error(`Unable to set valve status ${err.stack}`);
        throw err;
      }
    }

    _startOfDay(now) {
        return (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
    }

    async _checkWeather(location) {
      try {
        const res = await this.fetcher(`http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}`);
        const json = await res.json();
        // find if the code is any of the recognized weather types with rain
        // from http://openweathermap.org/weather-conditions
        const code = json.weather[0].id;
        if ((code >= 200 && code <= 202) ||
            (code >= 300 && code <= 321) ||
            (code >= 500 && code <= 531)) {
            return {shouldWater: false, weatherDesc: json.weather[0].description };
        } else {
            return {shouldWater: true, weatherDesc: null };
        }
      } catch(err) {
        this.logger.error(`Unable to check weather status for current location - ${err.stack}`);
        return {shouldWater: true, weatherDesc: null };
      }
    }
}
