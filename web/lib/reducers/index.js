/*
 * @format
 */
import authReducer from './auth-reducer';
import valveReducer from './valve-reducer';
import scheduleReducer from './schedule-reducer';
import historyReducer from './history-reducer';
import settingsReducer from './settings-reducer';

function combineReducers(reducers) {
  const combinedReducer = (state, action) => {
    const newState = {};
    Object.entries(reducers).forEach(([key, value]) => {
      newState[key] = value(state[key], action);
    });
    return newState;
  };

  return {
    Reducer: combinedReducer,
    InitialState: combinedReducer({}, {type: '@@INIT'}),
  };
}

const reducer = combineReducers({
  auth: authReducer,
  valve: valveReducer,
  schedule: scheduleReducer,
  history: historyReducer,
  settings: settingsReducer,
});

export default reducer;
