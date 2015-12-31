'use strict'
import { combineReducers } from 'redux';
import { routeReducer }  from 'redux-simple-router';
import valveReducer from './valve-reducer'
import scheduleReducer from './schedule-reducer';
import historyReducer from './history-reducer';

export default combineReducers({
    routing: routeReducer,
    valve: valveReducer,
    schedule: scheduleReducer,
    history: historyReducer
})
