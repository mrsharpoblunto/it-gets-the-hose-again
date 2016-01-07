import actions from '../actions/action-types';

function getInitialState() {
    return {
        loading: false
    };
}

export default function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case actions.LOGIN_START:
            return Object.assign({}, state, {
                loading: true
            });
        case actions.LOGIN_FINISH:
            return Object.assign({}, state, {
                loading: false
            });
        default:
            return state;
    }
}