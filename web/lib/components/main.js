import { Link } from 'react-router';
import React from 'react';
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
        $('.button-collapse').sideNav({
            closeOnClick: true
        });
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
                        <a href='#' data-activates='mobile-nav' className='button-collapse'><i style={{marginLeft:'8px'}} className='material-icons'>menu</i></a>
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
