'use strict'
import actions from './action-types';
import { updateHistory } from './history';
import { apiError } from './api';
import * as clientConfig from '../client-config';

export function toggleValve() {
    return dispatch => {
        dispatch({
            type: actions.TOGGLE_VALVE_START
        })
        return fetch('/api/1/toggle-valve', { method: 'POST' })
            .then(res => res.json())
            .then(res => {
                res.type = actions.TOGGLE_VALVE_FINISH;
                dispatch(res);
            })
            .catch(err => {
                dispatch({
                    type: actions.TOGGLE_VALVE_FINISH,
                    success: false
                });
                dispatch(apiError(err));
            });
    };
}

let polling = false;

export function pollValve(internal) {
    return (dispatch, getState) => {
        if (!internal && polling) return;
        polling = true;
        const startTime = new Date();

        const controller = new AbortController();
        const abortTimeout = setTimeout(() => controller.abort(), clientConfig.LONGPOLL_TIMEOUT + 5000);
        const pollNext = () => setTimeout(() => dispatch(pollValve(true)), (new Date()).getTime() - startTime < 1000 ? 1000 : 0);

        return fetch(`/api/1/poll-valve?open=${getState().valve.open}`, { signal: controller.signal })
            .then(res => res.json())
            .then(res => {
                if (res.success && res.change) {
                    dispatch({
                        type: actions.SET_VALVE,
                        open: res.open
                    });
                    dispatch(updateHistory());
                }
                pollNext();
            })
            .catch(err => {
              if (err.name === 'AbortError') {
                pollNext();
              } else {
                polling = false;
                dispatch(apiError(err));
              }
            }).finally(() => {
                clearTimeout(abortTimeout);
            });

    };
}
