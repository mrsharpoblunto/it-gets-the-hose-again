import actions from '../actions/action-types';

function getInitialState() {
    return {
        items: [],
        latest: null,
        loading: false,
        initialized: false
    };
}

export default function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case actions.GET_HISTORY_START:
            return Object.assign({}, state, {
                loading: true
            });
        case actions.GET_HISTORY_FINISH:
            if (action.success) {
                const items = action.items
                    .filter(i => i.id > state.latest)
                    .concat(state.items.slice(0));
                return Object.assign({}, state, {
                    loading: false,
                    initialized: true,
                    items: items,
                    latest: action.latest
                });
            }
            return Object.assign({}, state, {
                loading: false
            });
        default:
            return state;
    }
}