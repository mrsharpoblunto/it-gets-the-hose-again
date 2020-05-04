/**
 * @format
 */
import actions from './action-types';
import { apiError } from './api';

export function getSchedule(history) {
    return dispatch => {
        dispatch({
            type: actions.GET_SCHEDULE_START
        });
        fetch('/api/1/schedule')
            .then(res => res.json())
            .then(res => {
                res.type = actions.GET_SCHEDULE_FINISH;
                dispatch(res);
            })
            .catch(err => {
                dispatch({
                    type: actions.GET_SCHEDULE_FINISH,
                    success: false
                });
                dispatch(apiError(err, history));
            });
    };
}

export function removeFromSchedule(id, history) {
    return dispatch => {
        dispatch({
            type: actions.REMOVE_FROM_SCHEDULE_START,
            id
        });
        fetch('/api/1/schedule/' + id, {
          method: 'DELETE'
        })
            .then(res => res.json())
            .then(res => {
                res.type = actions.REMOVE_FROM_SCHEDULE_FINISH;
                res.id = id;
                dispatch(res);
            })
            .catch(err => {
                dispatch({
                    type: actions.REMOVE_FROM_SCHEDULE_FINISH,
                    id,
                    success: false
                });
                dispatch(apiError(err, history));
            });
    };
}

export function addToSchedule(duration, time, frequency, history) {
    return dispatch => {
        dispatch({
            type: actions.ADD_TO_SCHEDULE_START
        });
        fetch('/api/1/schedule', {
          method: 'POST',
          body: JSON.stringify({
              duration,
              time,
              frequency
          }),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => res.json())
          .then(res => {
              res.type = actions.ADD_TO_SCHEDULE_FINISH;
              dispatch(res);
          })
          .catch(err => {
              dispatch({
                  type: actions.ADD_TO_SCHEDULE_FINISH,
                  success: false
              });
              dispatch(apiError(err, history));
          });
    };
}
