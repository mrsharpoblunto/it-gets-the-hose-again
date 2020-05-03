/*
 * @format
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {StoreProvider} from '../../lib/store-provider';
import Main from '../../lib/components/main';
import Login from '../../lib/components/login';

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
