import actions from './action-types';
import { apiError } from './api';
import superagent from '../superagent-promise';

export function updateHistory() {
    return (dispatch,getState) => {
        dispatch({
            type: actions.GET_HISTORY_START
        });

        const after = getState().history.latest;
        superagent
            .get(`/api/1/history${after?('?after='+after):''}`)
            .accept('json')
            .end()
            .then(res => {
               res.body.type = actions.GET_HISTORY_FINISH;
               dispatch(res.body);
            })
            .catch(err => {
               dispatch(apiError(err)); 
            });
    };
}
