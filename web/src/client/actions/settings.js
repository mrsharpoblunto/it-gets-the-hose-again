/*
 * @format
 */
import actions from './action-types';
import {handleApiError} from './api';

export function getSettings(history) {
  return dispatch => {
    dispatch({
      type: actions.GET_SETTINGS_START,
    });

    fetch('/api/1/settings')
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.GET_SETTINGS_FINISH;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.GET_SETTINGS_FINISH,
          success: false,
        });
      });
  };
}

export function updateSettings(settings, history) {
  return dispatch => {
    dispatch({
      type: actions.UPDATE_SETTINGS_START,
    });

    fetch('/api/1/settings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(settings),
    })
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.UPDATE_SETTINGS_FINISH;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.UPDATE_SETTINGS_FINISH,
          success: false,
        });
      });
  };
}
