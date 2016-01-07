import actions from '../actions/action-types';

function getInitialState() {
    return {
        loading: false,
        initialized: false,
        updating: false,
        settings: {}
    };
}

export default function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case actions.GET_SETTINGS_START:
            return Object.assign({}, state, {
                loading: true
            });
        case actions.GET_SETTINGS_FINISH:
            if (action.success) {
                return Object.assign({}, state, {
                    loading: false,
                    initialized: true,
                    settings: action.settings
                });
            }
            return state;
        case actions.UPDATE_SETTINGS_START:
            return Object.assign({}, state, {
                updating: true
            });
        case actions.UPDATE_SETTINGS_FINISH:
            if (action.success) {
                return Object.assign({}, state, {
                    updating: false,
                    settings: action.settings
                });
            }
            return Object.assign({}, state, {
                updating: false
            });
        default:
            return state;
    }
}