/*
 * @format
 */
import actions from '../actions/action-types';

function getInitialState() {
  return {
    items: [],
    latest: null,
    loading: false,
    initialized: false,
  };
}

export default function reducer(state = getInitialState(), action) {
  switch (action.type) {
    case actions.GET_HISTORY_START:
      return {
        ...state,
        loading: true,
      };
    case actions.GET_HISTORY_FINISH:
      if (action.success) {
        return {
          loading: false,
          initialized: true,
          items: action.items
            .filter(i => i.id > state.latest)
            .concat([...state.items]),
          latest: action.latest,
        };
      }
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
