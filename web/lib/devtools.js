'use strict'
import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h'
               defaultIsVisible={false}
               changePositionKey='ctrl-q'>
    <LogMonitor theme='solarized' />
  </DockMonitor>
);

export default DevTools;
