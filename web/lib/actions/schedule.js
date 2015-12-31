import actions from './action-types';
import superagent from '../superagent-promise';

export function getSchedule() {
    return dispatch => {
        dispatch({
            type: actions.GET_SCHEDULE_START
        });
        superagent
            .get('/api/1/schedule')
            .end()
            .then(res => {
                res.body.type = actions.GET_SCHEDULE_FINISH;
                dispatch(res.body);
            })
            .catch(() => {
                dispatch({
                    type: actions.GET_SCHEDULE_FINISH,
                    success: false
                });
            });
    };
}

export function removeFromSchedule(id) {
    return dispatch => {
        dispatch({
            type: actions.REMOVE_FROM_SCHEDULE_START,
            id
        });
        superagent
            .del('/api/1/schedule/'+id)
            .end()
            .then(res => {
                res.body.type = actions.REMOVE_FROM_SCHEDULE_FINISH;
                res.body.id = id;
                dispatch(res.body);
            })
            .catch(() => {
                dispatch({
                    type: actions.REMOVE_FROM_SCHEDULE_FINISH,
                    id,
                    success: false
                });
            });
    };
}

export function addToSchedule(duration,time,frequency) {
    return dispatch => {
        dispatch({
            type: actions.ADD_TO_SCHEDULE_START
        });
        superagent
            .post('/api/1/schedule')
            .accept('json')
            .send({
                duration,
                time,
                frequency
            })
            .end()
            .then(res => {
                res.body.type = actions.ADD_TO_SCHEDULE_FINISH;
                dispatch(res.body);
            })
            .catch(() => {
                dispatch({
                    type: actions.ADD_TO_SCHEDULE_FINISH,
                    success: false
                });
            });
    };
}
