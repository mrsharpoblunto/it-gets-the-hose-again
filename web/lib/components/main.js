'use strict';

import { Link } from 'react-router';
import React from 'react';
import { connect } from 'react-redux';
import ValveSwitch from './valve-switch';

let DevTools = null; 
if (process.env.NODE_ENV !== 'production') {
    DevTools = require('../devtools');
}

@connect(state => state)
export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    /* eslint no-undef:0 */
    $('.button-collapse').sideNav({
        closeOnClick: true
    });
  }
  render() {
    return (
      <div>
        { DevTools ? <DevTools /> : null }
        <header>
            <nav className='top-nav'>
                <div className='nav-wrapper'>
                    <a className='brand-logo hide-on-med-and-down'>
                       <svg style={{width:"2rem",height:"2rem",marginLeft:"8px",marginRight:"8px"}} viewBox="0 0 24 24">
                           <path fill="#fff" d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" />
                       </svg>
                    </a>
                    <a href='#' data-activates='mobile-nav' className='button-collapse'><i className='material-icons'>menu</i></a>
                    <ul className='right hide-on-med-and-down'>
                        <li className={this.props.routing.path==='/'?'active':''}><Link to='/'><i className='material-icons'>schedule</i></Link></li>
                        <li className={this.props.routing.path==='/history'?'active':''}><Link to='/history'><i className='material-icons'>history</i></Link></li>
                        <li className={this.props.routing.path==='/settings'?'active':''}><Link to='/settings'><i className='material-icons'>settings</i></Link></li>
                    </ul>
                    <ValveSwitch />
                </div>
                <ul className='side-nav' id='mobile-nav'>
                    <li className={this.props.routing.path==='/'?'active':''}><Link to='/'><i className='material-icons left'>schedule</i> Schedule</Link></li>
                    <li className={this.props.routing.path==='/history'?'active':''}><Link to='/history'><i className='material-icons left'>history</i> History</Link></li>
                    <li className={this.props.routing.path==='/settings'?'active':''}><Link to='/settings'><i className='material-icons left'>settings</i> Settings</Link></li>
                </ul>
            </nav>
        </header>
        <main>
          <div className='container'>
          { this.props.children }
          </div>
        </main>
        <footer className='center'>
        </footer>
      </div>
    );
  }
}
