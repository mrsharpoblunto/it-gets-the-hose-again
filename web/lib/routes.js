'use strict'
import { Router,Route, IndexRoute } from 'react-router';
import React from 'react';
import Main from './components/main';
import NotFound from './components/not-found';

export default (
  <Router>
    <Route path='/' component={Main}>
      <Route path='*' component={NotFound} />
    </Route>
  </Router>);
