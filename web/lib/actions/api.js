'use strict'
import { pushPath } from 'redux-simple-router';

export function apiError(err) {
    return dispatch => {
        if (err.status === 401) {
            dispatch(pushPath('/login'));
        }
    };
}
