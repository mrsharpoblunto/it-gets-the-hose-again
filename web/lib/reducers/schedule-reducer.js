import actions from '../actions/action-types';

function getInitialState() {
    return {
        items: [],
        loading: false,
        initialized: false,
        adding: false
    };
}

export default function reducer(state = getInitialState(),action) {
    switch (action.type) {
        case actions.GET_SCHEDULE_START:
            return Object.assign({},state,{
                loading: true
            });
        case actions.GET_SCHEDULE_FINISH:
            if (action.success) {
                return Object.assign({},state,{
                    loading: false,
                    initialized: true,
                    items: action.items
                });
            }
            return Object.assign({},state,{
                loading: false
            });
        case actions.REMOVE_FROM_SCHEDULE_START: 
        {
            // we optimistically remove from the local UI state
            // before waiting for confirmation of deletion
            const items = state.items.filter(i => i.id !== action.id);
            return Object.assign({},state,{
                items
            });
        }
        case actions.ADD_TO_SCHEDULE_START:
            return Object.assign({},state,{
                adding: true
            });
        case actions.ADD_TO_SCHEDULE_FINISH:
        {
            const items = state.items.slice(0);
            if (action.success) {
                items.push(action.newItem);
            }
            return Object.assign({},state,{
                adding: false,
                items
            });
        }
        default:
            return state;
    }
}
