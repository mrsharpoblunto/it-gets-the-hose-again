import actions from './action-types';
import { apiError } from './api';

export function getSettings() {
    return dispatch => {
        dispatch({
            type: actions.GET_SETTINGS_START
        });

        fetch('/api/1/settings')
            .then(res => res.json())
            .then(res => {
                res.type = actions.GET_SETTINGS_FINISH;
                dispatch(res);
            })
            .catch(err => {
                dispatch({
                    type: actions.GET_SETTINGS_FINISH,
                    success: false
                });
                dispatch(apiError(err));
            });
    };
}

export function updateSettings(settings) {
    return dispatch => {
        dispatch({
            type: actions.UPDATE_SETTINGS_START
        });

        fetch('/api/1/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
          .then(res => res.json())
            .then(res => {
                res.type = actions.UPDATE_SETTINGS_FINISH;
                dispatch(res);
            })
            .catch(err => {
                dispatch({
                    type: actions.UPDATE_SETTINGS_FINISH,
                    success: false
                });
                dispatch(apiError(err));
            });
    };
}
