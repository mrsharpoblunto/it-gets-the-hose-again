import EventEmitter from 'events';
import * as config from './config';

export default class ValveController extends EventEmitter {
    constructor(history, logger) {
        super();

        // onoff uses EPOLL which is only present on Linux
        // so the module will fail to load on OSX, Windows etc.
        let onoff = null;
        try {
            onoff = require('onoff');
        } catch (err) {
            logger.warn('Unable to load onoff module. Gpio control disabled');
        }

        this.open = false;
        this.logger = logger;
        this.history = history;
        this.valveGpio = (config.VALVE_GPIO && onoff) ? new onoff.Gpio(config.VALVE_GPIO, 'out') : null;
        this.statusGpio = (config.STATUS_GPIO && onoff) ? new onoff.Gpio(config.STATUS_GPIO, 'out') : null;

        // make sure the valve gets shut off if the program exits
        process.on('exit', this.cleanup.bind(this, false));
        process.on('SIGINT', this.cleanup.bind(this, true));
        process.on('SIGTERM', this.cleanup.bind(this, true));
        process.on('uncaughtException', this.cleanup.bind(this, true));

        if (this.statusGpio) {
            this.logger.verbose('Set status Gpio signal');
            this.statusGpio.writeSync(1);
        }
        this.logger.info('Valve Controller initialized');
    }
    cleanup(exit) {
        if (this.valveGpio || this.statusGpio) {
            this.logger.info('Cleaning up Valve Controller resources');
        }
        if (this.valveGpio) {
            this.logger.info('Unexported valve Gpio output');
            this.valveGpio.unexport();
            this.valveGpio = null;
        }
        if (this.statusGpio) {
            this.logger.info('Unexported status Gpio output');
            this.statusGpio.unexport();
            this.statusGpio = null;
        }
        if (exit) {
            process.exit();
        }
    }
    identify() {
        this.logger.info('Identify called');
        if (this.statusGpio) {
            let count = 10;
            let status = 1;
            const flash = () => {
                if (count >= 0 && this.statusGpio) {
                    this.statusGpio.writeSync(status);
                    --count;
                    status = status ? 0 : 1;
                    setTimeout(flash, 100);
                }
            }
            flash();
        }
    }

    async _setOpen(open, source) {
      if (open === this.open) {
          return {
              open, source
          };
      }

      this.logger.verbose(`Valve set by ${source} to ${open?'open':'closed'}`);
      try {
        await this.history.write(source, open ? 'Watering started' : 'Watering stopped');
      } catch (err) {
        this.logger.error('Unable to write history item');
        throw err;
      }
      this.open = open
      this.emit('setOpen', {
          open, source
      });
      return {
          open, source
      };
    }

    async toggleOpen(source) {
        return await this.setOpen(!this.getOpen(), source);
    }

    async setOpen(open, source) {
        if (this.valveGpio) {
          await new Promise((resolve, reject) => {
            this.valveGpio.write(open ? 1 : 0, err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return await this._setOpen(open, source);
        } else {
          return await this._setOpen(open, source);
        }
    }

    getOpen() {
        this.logger.verbose(`Retrieved Valve state: ${this.open?'open':'closed'}`);
        return this.open;
    }
}
