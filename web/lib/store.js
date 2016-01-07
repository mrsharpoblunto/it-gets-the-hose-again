import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import rootReducer from './reducers';

function middlewareBuilder() {
    let commonMiddleware = [thunk];

    if (process.env.NODE_ENV === 'production') {
        return [
            applyMiddleware(...commonMiddleware)
        ];
    } else {
        const DevTools = require('./devtools');
        return [
            applyMiddleware(...commonMiddleware, createLogger()),
            DevTools.instrument()
        ];
    }
}

export default function createStoreWithMiddleware() {
    const createStoreWithMiddleware = compose(...middlewareBuilder())(createStore);
    const store = createStoreWithMiddleware(rootReducer);

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers', () => {
            const nextRootReducer = require('./reducers');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}
