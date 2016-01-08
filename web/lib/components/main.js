import tapOrClick from 'react-tap-or-click';
import React from 'react';
import { pushPath } from 'redux-simple-router';
import { connect } from 'react-redux';
import ValveSwitch from './valve-switch';
import Logo from './logo';

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
        $('.button-collapse').sideNav();
    }
    handleShowSideNav() {
        $('.button-collapse').sideNav('show');
    }
    handleNav(path,e) {
        e.preventDefault();
        this.props.dispatch(pushPath(path));        
        $('.button-collapse').sideNav('hide');
    }
    render() {
        return (<div>
            { DevTools ? <DevTools /> : null }
            <header>
                <nav className='top-nav'>
                    <div className='nav-wrapper'>
                        <a className='brand-logo hide-on-med-and-down'>
                           <Logo style={{width:"2rem",height:"2rem",marginLeft:"8px",marginRight:"8px"}} />
                        </a>
                        <a href='#' {...tapOrClick(this.handleShowSideNav)} data-activates='mobile-nav' className='button-collapse'><i style={{marginLeft:'8px'}} className='material-icons'>menu</i></a>
                        <ul className='right hide-on-med-and-down'>
                            <li className={this.props.routing.path==='/'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/'))}><i className='material-icons'>schedule</i></a></li>
                            <li className={this.props.routing.path==='/history'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/history'))}><i className='material-icons'>history</i></a></li>
                            <li className={this.props.routing.path==='/settings'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/settings'))}><i className='material-icons'>settings</i></a></li>
                        </ul>
                        <ValveSwitch />
                    </div>
                    <ul className='side-nav' id='mobile-nav'>
                        <li className={this.props.routing.path==='/'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/'))}><i className='material-icons left'>schedule</i> Schedule</a></li>
                        <li className={this.props.routing.path==='/history'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/history'))}><i className='material-icons left'>history</i> History</a></li>
                        <li className={this.props.routing.path==='/settings'?'active':''}><a {...tapOrClick(this.handleNav.bind(this,'/settings'))}><i className='material-icons left'>settings</i> Settings</a></li>
                        <li><a href='/logout'><i className='material-icons left'>exit_to_app</i> Logout</a></li>
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
        </div>);
    }
}
