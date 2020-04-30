import { pushPath } from 'redux-simple-router';
import actions from './action-types';
import { pollValve } from './valve';

export function login(name, password) {
    return dispatch => {
        dispatch({
            type: actions.LOGIN_START
        });
        fetch('/login', {
          method: 'POST',
          body: JSON.stringify({
              name,
              password
          }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(res => {
            res.type = actions.LOGIN_FINISH;
            dispatch(res);
            if (res.success) {
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
