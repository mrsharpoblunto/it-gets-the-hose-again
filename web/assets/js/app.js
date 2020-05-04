/*
 * @format
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {StoreProvider} from '../../src/client/store-provider';
import Main from '../../src/client/components/main';
import Login from '../../src/client/components/login';

ReactDOM.render(
  <StoreProvider>
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  </StoreProvider>,
  document.getElementById('app-container'),
);
