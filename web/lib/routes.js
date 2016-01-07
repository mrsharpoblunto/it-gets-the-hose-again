'use strict'
import { Router,Route, IndexRoute } from 'react-router';
import React from 'react';
import Main from './components/main';
import Schedule from './components/schedule';
import Settings from './components/settings';
import History from './components/history';
import Login from './components/login';
import NotFound from './components/not-found';

export default (
  <Router>
    <Route path='/login' component={Login} />
    <Route path='/' component={Main}>
      <IndexRoute component={Schedule} />
      <Route path='/settings' component={Settings} />
      <Route path='/history' component={History} />
      <Route path='*' component={NotFound} />
    </Route>
  </Router>);
