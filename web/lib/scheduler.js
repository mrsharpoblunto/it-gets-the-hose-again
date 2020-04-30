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

    start(manualChecking,cb) {
        this._load(() => {
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
                this.check();
                this.checkHandle = setInterval(this.check, config.SCHEDULE_CHECK_INTERVAL);
            }
            cb();
        });
    }

    stop() {
        clearInterval(this.checkHandle);
    }

    reload() {
        this._load(() => {
            this.logger.info('Scheduler reloaded');
        });
    }

    _load(cb) {
        this.storage.getItem(config.SETTINGS_KEY, (err, settings) => {
            if (err) {
                this.logger.error(`Unable to load settings ${err.stack}`);
            }
            this.settings = settings || {};

            this.storage.getItem(config.SCHEDULE_KEY, (err, schedule) => {
                if (err) {
                    this.logger.error(`Unable to load schedule ${err.stack}`);
                }
                this.schedule = schedule ? schedule.items : [];
                if (cb) {
                    cb();
                }
            });
        });
    }

    check = (callback = function(){}) => {
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
            this.storage.setItem(config.SCHEDULE_KEY, {
                items: this.schedule
            }, err => {
                if (err) {
                    callback();
                    return this.logger.error(`Unable to update schedule ${err.stack}`);
                }
                if (this.settings.location) {
                    this._checkWeather(this.settings.location, (shouldWater, weatherDesc) => {
                        if (!shouldWater) {
                            this.history.write(config.SCHEDULER, `Watering cancelled due to weather conditions - ${weatherDesc}`, () => {
                                this._setValve(false,callback);
                                this.waterUntil = 0;
                            });
                        } else {
                            this._setValve(true,callback);
                        }
                    });
                } else {
                    this._setValve(true,callback);
                }
            });
        } else if (this.waterUntil) {
            this._setValve(this.waterUntil > now.getTime(),callback);
        } else {
            callback();
        }
    }

    _setValve(open,callback) {
        this.valveController.setOpen(open, config.SCHEDULER, err => {
            if (err) {
                this.logger.error(`Unable to set valve status ${err.stack}`);
            }
            callback(err);
        });
    }

    _startOfDay(now) {
        return (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
    }

    _checkWeather(location, cb) {
        this.fetcher(`http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}`)
          .then(res => res.json())
          .then(res => {
              // find if the code is any of the recognized weather types with rain
              // from http://openweathermap.org/weather-conditions
              const code = res.weather[0].id;
              if ((code >= 200 && code <= 202) ||
                  (code >= 300 && code <= 321) ||
                  (code >= 500 && code <= 531)) {
                  cb(false, res.weather[0].description);
              } else {
                  cb(true, null);
              }
          })
          .catch(err => {
              this.logger.error(`Unable to check weather status for current location - ${err.stack}`);
              cb(true, null);
          });
    }
}
