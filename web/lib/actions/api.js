import actionTypes from './action-types';

export function apiError(err, history) {
  if (err.status === 401) {
    history.replace('/login');
  }
  return {
    type: actionTypes.API_ERROR,
    details: err,
  };
}
