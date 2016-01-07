import * as config from './config';

export default class HistoryLogger {
    constructor(storage, logger, maxItems) {
        this.storage = storage;
        this.logger = logger;
        this.maxItems = maxItems;
    }
    write(source, message, cb) {
        this.storage.getItem(config.HISTORY_KEY, (err, value) => {
            if (err) {
                this.logger.error('Unable to get history items');
                return cb(err);
            } else if (!value) {
                value = {
                    items: []
                };
            }

            const newItem = {
                id: value.items.length === 0 ? 0 : value.items[0].id + 1,
                source,
                message,
                timestamp: (new Date()).getTime()
            }
            if (value.items.length > this.maxItems) {
                value.items.pop();
            }
            value.items.unshift(newItem);

            this.storage.setItem(config.HISTORY_KEY, value, err => {
                if (err) {
                    this.logger.error('Unable to set history items');
                    return cb(err);
                }
                cb();
            });
        });
    }
}