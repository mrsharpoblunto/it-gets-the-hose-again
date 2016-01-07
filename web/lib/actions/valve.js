'use strict'
import superagent from '../superagent-promise';
import actions from './action-types';
import { updateHistory } from './history';
import { apiError } from './api';
import * as clientConfig from '../client-config';

export function toggleValve() {
   return dispatch => {
      dispatch({
        type: actions.TOGGLE_VALVE_START
      })
      return superagent
        .post('/api/1/toggle-valve')
        .type('json')
        .accept('json')
        .end()
        .then(res => {
            res.body.type = actions.TOGGLE_VALVE_FINISH;
            dispatch(res.body);
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
    return (dispatch,getState) => {
        if (!internal && polling) return;
        polling = true;
        const startTime = new Date();
        return superagent
            .get(`/api/1/poll-valve?open=${getState().valve.open}`)
            .accept('json')
            .timeout(clientConfig.LONGPOLL_TIMEOUT + 5000)
            .end()
            .then(res => {
                if (res.body.success && res.body.change) {
                    dispatch({
                        type: actions.SET_VALVE,
                        open: res.body.open
                    });
                    dispatch(updateHistory());
                }
                setTimeout(()=>dispatch(pollValve(true)),(new Date()).getTime() - startTime < 1000 ? 1000 : 0);
            })
            .catch(err => {
                polling = false;
                dispatch(apiError(err));
            });

    };
}
