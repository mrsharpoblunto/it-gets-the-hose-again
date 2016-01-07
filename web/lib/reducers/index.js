'use strict'
import { combineReducers } from 'redux';
import { routeReducer }  from 'redux-simple-router';
import authReducer from './auth-reducer';
import valveReducer from './valve-reducer'
import scheduleReducer from './schedule-reducer';
import historyReducer from './history-reducer';
import settingsReducer from './settings-reducer';

export default combineReducers({
    auth: authReducer,
    routing: routeReducer,
    valve: valveReducer,
    schedule: scheduleReducer,
    history: historyReducer,
    settings: settingsReducer
})
