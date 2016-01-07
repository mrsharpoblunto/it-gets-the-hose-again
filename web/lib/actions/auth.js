import { pushPath } from 'redux-simple-router';
import superagent from '../superagent-promise';
import actions from './action-types';
import { pollValve } from './valve';

export function login(name, password) {
    return dispatch => {
        dispatch({
            type: actions.LOGIN_START
        });
        superagent
            .post('/login')
            .accept('json')
            .send({
                name,
                password
            })
            .end()
            .then(res => {
                res.body.type = actions.LOGIN_FINISH;
                dispatch(res.body);
                if (res.body.success) {
                    dispatch(pollValve());
                    dispatch(pushPath('/'));
                }
            })
            .catch(() => {
                dispatch({
                    type: actions.LOGIN_FINISH,
                    success: false
                });
            });
    };
}
