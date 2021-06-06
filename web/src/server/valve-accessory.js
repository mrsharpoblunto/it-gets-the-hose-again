/**
 * @format
 */
import * as hap from 'hap-nodejs';
import * as config from './config';

export default function (valveController) {
  const valveUUID = hap.uuid.generate('hap-nodejs:accessories:valve');

  const valve = new hap.Accessory('Water valve'+ (process.env.NODE_ENV !== 'production' ? '-dev' : ''), valveUUID);

  valve
    .getService(hap.Service.AccessoryInformation)
    .setCharacteristic(hap.Characteristic.Manufacturer, config.MANUFACTURER)
    .setCharacteristic(hap.Characteristic.Model, config.MODEL)
    .setCharacteristic(hap.Characteristic.SerialNumber, config.SERIAL);

  valve.on('identify', function (paired, cb) {
    valveController.identify();
    cb();
  });

  valve
    .addService(hap.Service.Switch, 'It gets the hose again' + (process.env.NODE_ENV !== 'production' ? '-dev': ''))
    .getCharacteristic(hap.Characteristic.On)
    .on('set', function (value, cb) {
      valveController
        .setOpen(!!value, config.HOMEKIT_USER)
        .then(() => {
          cb();
        })
        .catch(err => {
          cb(err);
        });
    });

  valve
    .getService(hap.Service.Switch)
    .getCharacteristic(hap.Characteristic.On)
    .on('get', function (cb) {
      cb(valveController.getOpen() ? 1 : 0);
    });

  valveController.on('setOpen', function ({open, source}) {
    if (source !== config.HOMEKIT_USER) {
      valve
        .getService(hap.Service.Switch)
        .setCharacteristic(hap.Characteristic.On, open ? 1 : 0);
    }
  });

  return valve;
}
