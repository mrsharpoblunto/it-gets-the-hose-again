import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { createHistory } from 'history';
import { syncReduxAndRouter } from 'redux-simple-router';

import createStoreWithMiddleware from '../../lib/store';
import routes from '../../lib/routes';

const store = createStoreWithMiddleware();
const history = createHistory();
syncReduxAndRouter(history,store);

ReactDOM.render(<Provider store={store}>
    <Router history={history}>
        { routes }
    </Router>
</Provider>,document.getElementById('app-container'));
