import superagent from './superagent-promise';
import * as config from './config';
import * as keys from '../keys';

export default class Scheduler {
    constructor(storage,history,logger,valveController) {
        this.storage = storage;
        this.history = history;
        this.logger = logger;
        this.valveController = valveController;
        this.settings = {};
        this.schedule = [];
        this.waterUntil = 0;
    }

    start() {
        this.logger.info('Scheduler starting...');
        this._load(() => {
            this.valveController.on('setOpen',({open,source}) => {
                if (source !== config.SCHEDULER) {
                    if (open && this.settings.shutoffDuration) {
                        // ensure that if we manually opened the valve
                        // that it shuts off after a specified amount
                        // of time (if configured)
                        this.waterUntil = (new Date()).getTime() + (this.settings.shutoffDuration * 60 * 1000);
                    } else {
                        // manually setting the valve disables any
                        // scheduled waterings
                        this.waterUntil = 0;
                    }
                }
            });
            this._check();
            this.checkHandle = setInterval(this._check,config.SCHEDULE_CHECK_INTERVAL);
            this.logger.info('Scheduler running');
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
        this.storage.getItem(config.SETTINGS_KEY,(err,settings) => {
            if (err) {
                this.logger.error(`Unable to load settings ${err.stack}`);
            }
            this.settings = settings || {};

            this.storage.getItem(config.SCHEDULE_KEY,(err,schedule) => {
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

    _check = () => {
        const now = new Date();
        const currentHour = now.getHours(); 
        this.logger.verbose(`Checking schedule for hour ${currentHour}`);
        let updated = false;
        this.schedule.map(item => {
            this.logger.debug(JSON.stringify(item));
            if (item.time === currentHour 
            && (!item.nextRun || now.getTime() >= item.nextRun)
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
            this.storage.setItem(config.SCHEDULE_KEY,{ 
                items: this.schedule 
            },err => {
                if (err) {
                    return this.logger.error(`Unable to update schedule ${err.stack}`);
                }
                if (this.settings.location) {
                    this._checkWeather(this.settings.location,(shouldWater,weatherDesc) => {
                        if (!shouldWater) {
                            this.history.write(config.SCHEDULER,`Watering cancelled due to weather conditions - ${weatherDesc}`,() => {
                                this._setValve(false);
                                this.waterUntil = 0;
                            });
                        } else {
                            this._setValve(true);
                        }
                    });
                } else {
                    this._setValve(true);
                }
            });
        } else if (this.waterUntil) {
            this._setValve(this.waterUntil > now.getTime());
        }
    }

    _setValve(open) {
        this.valveController.setOpen(open,config.SCHEDULER,err => {
           if (err) {
                this.logger.error(`Unable to set valve status ${err.stack}`);
            }
        });
    }

    _startOfDay(now) {
        return (new Date(now.getFullYear(),now.getMonth(),now.getDate())).getTime();
    }

    _checkWeather(location,cb) {
        superagent
            .get(`http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${keys.OPEN_WEATHER_API_KEY}`)
            .accept('json')
            .end()
            .then(res => {
                // find if the code is any of the recognized weather types with rain
                // from http://openweathermap.org/weather-conditions
                const code = res.body.weather[0].id;
                if ((code >= 200 && code <= 202) ||
                    (code >= 300 && code <= 321) || 
                    (code >= 500 && code <= 531)) {
                    cb(false,res.body.weather[0].description);
                } else {
                    cb(true,null);
                }
            })
            .catch(err => {
                this.logger.error(`Unable to check weather status for current location - ${err.stack}`);
                cb(true,null);
            });
    }
}