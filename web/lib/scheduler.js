const CHECK_INTERVAL = 30000;

export default class Scheduler {
    constructor(storage,history,logger,valveController) {
        this.storage = storage;
        this.history = history;
        this.logger = logger;
        this.valveController = valveController;

        this.schedule = [];
        this.waterUntil = 0;
    }
    start() {
        this.check();
    }
    reload() {
        this.logger.info('Restarting scheduler...');
        this.storage.getItem('schedule',(err,value) => {
           if (err) {
                return this.logger.error(`Unable to reload schedule ${err.stack}`);
           }
           if (!value) {
                this.schedule = [];
                this.waterUntil = 0;
           } else {
                this.waterUntil = value.waterUntil;
                this.schedule = value.items;
           }
        });
    }
    check = () => {
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
                item.nextRun = this.startOfDay(now) + ((86400 * item.frequency) + (3600 * item.time)) * 1000;
                this.logger.verbose(`Schedule item will run - next run ${item.nextRun}`);
                const nextWater = now.getTime() + (item.duration * 60 * 1000);
                if (nextWater > this.waterUntil) {
                    this.logger.verbose(`Will water until ${nextWater}`);
                    this.waterUntil = nextWater;
                    updated = true;
                }
            }
        });

        const checkValve = () => {
            this.valveController.setOpen(this.waterUntil > now.getTime(),'scheduler',err => {
               if (err) {
                    this.logger.error(`Unable to set valve status ${err.stack}`);
                }
                setTimeout(this.check,CHECK_INTERVAL);
            });
        }

        if (updated) {
            this.storage.setItem('schedule',{ 
                waterUntil: this.waterUntil,
                items: this.schedule 
            },err => {
                if (err) {
                    return this.logger.error(`Unable to update schedule ${err.stack}`);
                }
                checkValve();
            });
        } else {
            checkValve();
        }
    }
    startOfDay(now) {
        return (new Date(now.getFullYear(),now.getMonth(),now.getDate())).getTime();
    }

}
