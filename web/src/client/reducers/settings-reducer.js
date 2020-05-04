/*
 * @format
 */
import actions from '../actions/action-types';

function getInitialState() {
  return {
    loading: false,
    initialized: false,
    updating: false,
    settings: {},
  };
}

export default function reducer(state = getInitialState(), action) {
  switch (action.type) {
    case actions.GET_SETTINGS_START:
      return {
        ...state,
        loading: true,
      };
    case actions.GET_SETTINGS_FINISH:
      if (action.success) {
        return {
          ...state,
          loading: false,
          initialized: true,
          settings: {...state.settings, ...action.settings},
        };
      }
      return state;
    case actions.UPDATE_SETTINGS_START:
      return {
        ...state,
        updating: true,
      };
    case actions.UPDATE_SETTINGS_FINISH:
      if (action.success) {
        return {
          ...state,
          updating: false,
          settings: {...state.settings, ...action.settings},
        };
      }
      return {
        ...state,
        updating: false,
      };
    default:
      return state;
  }
}
