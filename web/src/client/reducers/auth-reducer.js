/*
 * @format
 */
import actions from '../actions/action-types';

function getInitialState() {
  return {
    loading: false,
  };
}

export default function reducer(state = getInitialState(), action) {
  switch (action.type) {
    case actions.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case actions.LOGIN_FINISH:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
