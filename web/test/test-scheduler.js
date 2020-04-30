import EventEmitter from 'events';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import * as config from '../lib/config';
import Scheduler from '../lib/scheduler';

class NullLogger {
    verbose() {}
    debug() {}
    info() {}
    error() {}
}

class NullStorage {
    constructor(storage = {}) {
        this._storage = storage;
    }
    getItem(key) {
        return Promise.resolve(this._storage[key]);
    }
    setItem(key,value) {
      this._storage[key] = value;
      return Promise.resolve();
    }
}

class NullHistory {
    write(source,message,callback) {
        callback();
    }
}

class TestTimer {
    constructor(now = new Date()) {
        this._now = now;
    }
    now() {
        return this._now;
    }
}

class NullValveController extends EventEmitter {
    setOpen(open,source,callback) {
        this.emit('setOpen', {
            open,source
        });
        callback(null,{
            open,source
        });
    }
}

describe('Test scheduler',function() {
    it('Waters the garden as scheduled and that auto cutoff doesn\'t affect scheduled waterings',function(done) {
        const storage = {};
        storage[config.SCHEDULE_KEY] = {   
            items: [
                {
                    time: 10,
                    nextRun: null,
                    frequency: 2,
                    duration: 15
                }
            ]
        };
        storage[config.SETTINGS_KEY] = {
            shutoffDuration: 2
        };
        const nullStorage = new NullStorage(storage);
        const testTimer = new TestTimer(new Date(2016,1,25,9,30,0));
        const valveController = new NullValveController();
        const testFetcher = sinon.stub().returns(Promise.resolve());
        const scheduler = new Scheduler('xxxx',nullStorage,new NullHistory(),new NullLogger(),valveController,testFetcher, testTimer);

        let testStep = 0;
        valveController.on('setOpen',({ open, source}) => {
            if (testStep === 0) {
                expect(open).to.be.true;
            }
            if (testStep === 1) {
                expect(open).to.be.true;
                expect(storage[config.SCHEDULE_KEY].items[0].nextRun).to.equal(new Date(2016,1,25,0,0,0).getTime() + (2 * 86400 * 1000) + (10 * 3600 * 1000));
            }
            if (testStep === 2) {
                expect(open).to.be.true;
            }
            if (testStep === 3 || testStep === 4) {
                expect(open).to.be.false;
            }
            if (testStep === 5) {
                expect(storage[config.SCHEDULE_KEY].items[0].nextRun).to.equal(new Date(2016,1,27,0,0,0).getTime() + (2 * 86400 * 1000) + (10 * 3600 * 1000));
                done();
            }
        });
        scheduler.start(true,() => {
            // shouldn't start yet
            scheduler.check(() => {
                // should start now
                testTimer._now = new Date(2016,1,25,10,0,1);
                testStep = 1;
                scheduler.check(() => {
                    // should still be watering
                    testTimer._now = new Date(2016,1,25,10,14,59);
                    testStep = 2;
                    scheduler.check(() => {
                        // should stop now
                        testTimer._now = new Date(2016,1,25,10,15,1);
                        testStep = 3;
                        scheduler.check(()=> {
                            // shouldn't run until tomorrow
                            testTimer._now = new Date(2016,1,26,10,0,1);
                            testStep = 4;
                            scheduler.check(() => {
                                // should run again
                                testTimer._now = new Date(2016,1,27,10,0,1);
                                testStep = 5;
                                scheduler.check();
                            });
                        });
                    });
                });
            });
        });
    });

    it('Stops watering after the cutoff time has elapsed',function(done) {
        const storage = {};
        storage[config.SCHEDULE_KEY] = {   
            items: [
            ]
        };
        storage[config.SETTINGS_KEY] = {
            shutoffDuration: 2
        };
        const nullStorage = new NullStorage(storage);
        const testTimer = new TestTimer(new Date(2016,1,25,9,30,0));
        const valveController = new NullValveController();
        const testFetcher = sinon.stub().returns(Promise.resolve());
        const scheduler = new Scheduler('xxxx',nullStorage,new NullHistory(),new NullLogger(),valveController,testFetcher, testTimer);

        scheduler.start(true,() => {
            valveController.setOpen(true,config.WEB_USER,() => {
                valveController.on('setOpen',({ open, source}) => {
                    expect(open).to.be.false;
                    done();
                });
                testTimer._now = new Date(2016,1,25,9,32,1);
                scheduler.check();
            });
        });
    });

    it('Doesn\'t water if its already raining',function(done) {
        const storage = {};
        storage[config.SCHEDULE_KEY] = {   
            items: [
                {
                    time: 10,
                    nextRun: null,
                    frequency: 2,
                    duration: 15
                }
            ]
        };
        storage[config.SETTINGS_KEY] = {
            location: {
                latitude: '20',
                longitude: '60'
            }
        };
        const nullStorage = new NullStorage(storage);
        const testTimer = new TestTimer(new Date(2016,1,25,10,0,1));
        const valveController = new NullValveController();
        const testFetcher = sinon.stub().withArgs('http://api.openweathermap.org/data/2.5/weather?lat=20&lon=60&appid=xxxx').returns(
            Promise.resolve({
                json: function() {
                    return Promise.resolve({
                            weather: [
                                {
                                    id: 200,
                                    description: 'Raining'
                                }
                            ]
                    });
                }
            })
        );
        const scheduler = new Scheduler('xxxx',nullStorage,new NullHistory(),new NullLogger(),valveController,testFetcher, testTimer);

        valveController.on('setOpen',({ open }) => {
            expect(open).to.be.false;
            expect(storage[config.SCHEDULE_KEY].items[0].nextRun).to.equal(new Date(2016,1,25,0,0,0).getTime() + (2 * 86400 * 1000) + (10 * 3600 * 1000));
            done();
        });
        scheduler.start(true,()=>{
            scheduler.check();
        });
    });

    it('Waters if its not raining',function(done) {
        const storage = {};
        storage[config.SCHEDULE_KEY] = {   
            items: [
                {
                    time: 10,
                    nextRun: null,
                    frequency: 2,
                    duration: 15
                }
            ]
        };
        storage[config.SETTINGS_KEY] = {
            location: {
                latitude: '20',
                longitude: '60'
            }
        };
        const nullStorage = new NullStorage(storage);
        const testTimer = new TestTimer(new Date(2016,1,25,10,0,1));
        const valveController = new NullValveController();
        const testFetcher = sinon.stub().withArgs('http://api.openweathermap.org/data/2.5/weather?lat=20&lon=60&appid=xxxx').returns(
            Promise.resolve({
                json: function() {
                    return Promise.resolve({
                            weather: [
                                {
                                    id: 100,
                                    description: 'Fine and dandy'
                                }
                            ]
                    });
                }
            })
        );
        const scheduler = new Scheduler('xxxx',nullStorage,new NullHistory(),new NullLogger(),valveController,testFetcher, testTimer);

        valveController.on('setOpen',({ open }) => {
            expect(open).to.be.true;
            expect(storage[config.SCHEDULE_KEY].items[0].nextRun).to.equal(new Date(2016,1,25,0,0,0).getTime() + (2 * 86400 * 1000) + (10 * 3600 * 1000));
            done();
        });
        scheduler.start(true,()=>{
            scheduler.check();
        });
    });
});
