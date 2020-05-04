import actions from './action-types';
import { apiError } from './api';

export function updateHistory(history) {
    return (dispatch, getState) => {
        dispatch({
            type: actions.GET_HISTORY_START
        });

        const after = getState().history.latest;
        fetch(`/api/1/history${after?('?after='+after):''}`)
          .then(res => res.json())
          .then(res => {
              res.type = actions.GET_HISTORY_FINISH;
              dispatch(res);
          })
          .catch(err => {
              dispatch(apiError(err,history));
          });
    };
}
