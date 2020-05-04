import * as config from './config';

export default class HistoryLogger {
    constructor(storage, logger, maxItems) {
        this.storage = storage;
        this.logger = logger;
        this.maxItems = maxItems;
    }
    async write(source, message) {
      try {
        const value = (await this.storage.getItem(config.HISTORY_KEY)) || {
            items: []
        };

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

        await this.storage.setItem(config.HISTORY_KEY, value);
      } catch(err) {
        this.logger.error('Unable to set history items');
        throw err;
      }
  }
}
