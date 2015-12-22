'use strict';

import React from 'react';

let DevTools = null; 
if (process.env.NODE_ENV !== 'production') {
    DevTools = require('../devtools');
}

export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        { DevTools ? <DevTools /> : null }
        <header>
        </header>
        <main>
          { this.props.children }
        </main>
        <footer>
        </footer>
      </div>
    );
  }
}
