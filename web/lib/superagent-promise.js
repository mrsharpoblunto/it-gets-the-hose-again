import superagent from 'superagent';
import superagentPromise from 'superagent-promise';

export default superagentPromise(superagent, Promise);