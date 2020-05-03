/*
 * @format
 */
import actions from './action-types';
import {updateHistory} from './history';
import {apiError} from './api';
import * as clientConfig from '../client-config';

export function toggleValve(history) {
  return dispatch => {
    dispatch({
      type: actions.TOGGLE_VALVE_START,
    });
    return fetch('/api/1/toggle-valve', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(res => {
        res.type = actions.TOGGLE_VALVE_FINISH;
        dispatch(res);
      })
      .catch(err => {
        dispatch({
          type: actions.TOGGLE_VALVE_FINISH,
          success: false,
        });
        dispatch(apiError(err, history));
      });
  };
}

let polling = false;

export function pollValve(internal, history) {
  return (dispatch, getState) => {
    if (!internal && polling) return;
    polling = true;
    const startTime = new Date();

    const controller = new AbortController();
    const abortTimeout = setTimeout(
      () => controller.abort(),
      clientConfig.LONGPOLL_TIMEOUT + 5000,
    );
    const pollNext = () =>
      setTimeout(
        () => dispatch(pollValve(true, history)),
        new Date().getTime() - startTime < 1000 ? 1000 : 0,
      );

    return fetch(`/api/1/poll-valve?open=${getState().valve.open}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.change) {
          dispatch({
            type: actions.SET_VALVE,
            open: res.open,
          });
          dispatch(updateHistory(history));
        }
        pollNext();
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          pollNext();
        } else {
          polling = false;
          dispatch(apiError(err, history));
        }
      })
      .finally(() => {
        clearTimeout(abortTimeout);
      });
  };
}
