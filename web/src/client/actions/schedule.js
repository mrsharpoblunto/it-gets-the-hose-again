/**
 * @format
 */
import actions from './action-types';
import {handleApiError} from './api';

export function getSchedule(history) {
  return dispatch => {
    dispatch({
      type: actions.GET_SCHEDULE_START,
    });
    fetch('/api/1/schedule')
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.GET_SCHEDULE_FINISH;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.GET_SCHEDULE_FINISH,
          success: false,
        });
      });
  };
}

export function removeFromSchedule(id, history) {
  return dispatch => {
    dispatch({
      type: actions.REMOVE_FROM_SCHEDULE_START,
      id,
    });
    fetch('/api/1/schedule/' + id, {
      method: 'DELETE',
    })
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.REMOVE_FROM_SCHEDULE_FINISH;
        res.id = id;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.REMOVE_FROM_SCHEDULE_FINISH,
          id,
          success: false,
        });
      });
  };
}

export function addToSchedule(duration, time, frequency, history) {
  return dispatch => {
    dispatch({
      type: actions.ADD_TO_SCHEDULE_START,
    });
    fetch('/api/1/schedule', {
      method: 'POST',
      body: JSON.stringify({
        duration,
        time,
        frequency,
      }),
      headers: {'Content-Type': 'application/json'},
    })
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.ADD_TO_SCHEDULE_FINISH;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.ADD_TO_SCHEDULE_FINISH,
          success: false,
        });
      });
  };
}
