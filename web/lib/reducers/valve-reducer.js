import actions from '../actions/action-types';

export function getInitialState() {
    return {
        open: false
    };
}

export default function reducer(state = getInitialState(), action) {
    /* eslint no-fallthrough:0 */
    switch (action.type) {
        case actions.SET_VALVE:
            return Object.assign({}, state, {
                open: action.open
            });
        case actions.TOGGLE_VALVE_START:
            return Object.assign({}, state, {
                open: !state.open
            });
        case actions.TOGGLE_VALVE_FINISH:
            if (action.success) {
                return Object.assign({}, state, {
                    open: action.open
                });
            }
        default:
            return state;
    }
}