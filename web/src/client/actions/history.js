/**
 * @format
 */
import actions from './action-types';
import {handleApiError} from './api';

export function updateHistory(history) {
  return (dispatch, getState) => {
    dispatch({
      type: actions.GET_HISTORY_START,
    });

    const after = getState().history.latest;
    fetch(`/api/1/history${after ? '?after=' + after : ''}`)
      .then(res => handleApiError(res, history))
      .then(res => {
        res.type = actions.GET_HISTORY_FINISH;
        dispatch(res);
      })
      .catch(() => {
        dispatch({
          type: actions.GET_HISTORY_FINISH,
          success: false,
        });
      });
  };
}
