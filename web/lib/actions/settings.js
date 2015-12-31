import actions from './action-types';

import superagent from '../superagent-promise';

export function getSettings() {
    return dispatch => {
        dispatch({
            type: actions.GET_SETTINGS_START
        });

        superagent
            .get('/api/1/settings')
            .accept('json')
            .end()
            .then(res => {
               res.body.type = actions.GET_SETTINGS_FINISH;
               dispatch(res.body);
            })
            .catch(()=> {
                dispatch({
                    type: actions.GET_SETTINGS_FINISH,
                    success: false
                });
            });
    };
}

export function updateSettings(settings) {
    return dispatch => {
        dispatch({
            type: actions.UPDATE_SETTINGS_START
        });

        superagent
            .post('/api/1/settings')
            .accept('json')
            .send(settings)
            .end()
            .then(res => {
               res.body.type = actions.UPDATE_SETTINGS_FINISH;
               dispatch(res.body);
            })
            .catch(()=> {
                dispatch({
                    type: actions.UPDATE_SETTINGS_FINISH,
                    success: false
                });
            });
    };
}
