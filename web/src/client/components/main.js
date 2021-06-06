/*
 * @format
 */
import React from 'react';
import {Route, Switch, useHistory} from 'react-router-dom';
import {useRef, useLayoutEffect} from 'react';
import {useLocation} from 'react-router-dom';
import ValveSwitch from './valve-switch';
import Logo from './logo';
import Schedule from './schedule';
import Settings from './settings';
import History from './history';
import NotFound from './not-found';
import M from 'materialize-css';

export default function Main() {
  const location = useLocation();
  const history = useHistory();
  const sideNav = useRef();

  useLayoutEffect(() => {
    sideNav.current = M.Sidenav.init(sideNav.current);
    return () => {
      sideNav.current.destroy();
    };
  }, []);

  const handleShowSideNav = () => {
    sideNav.current.open();
  };

  const handleNav = (path, e) => {
    e.preventDefault();
    history.push(path);
    sideNav.current.close();
  };

  return (
    <div>
      <header>
        <nav className="top-nav">
          <div className="nav-wrapper">
            <a className="brand-logo hide-on-med-and-down">
              <Logo
                style={{
                  width: '2rem',
                  height: '2rem',
                  marginLeft: '8px',
                  marginRight: '8px',
                }}
              />
            </a>
            <a
              href="#"
              onClick={handleShowSideNav}
              className="left hide-on-large-only">
              <i style={{marginLeft: '8px'}} className="material-icons">
                menu
              </i>
            </a>
            <ul className="right hide-on-med-and-down">
              <li className={location.pathname === '/' ? 'active' : ''}>
                <a onClick={handleNav.bind(this, '/')}>
                  <i className="material-icons">schedule</i>
                </a>
              </li>
              <li className={location.pathname === '/history' ? 'active' : ''}>
                <a onClick={handleNav.bind(this, '/history')}>
                  <i className="material-icons">history</i>
                </a>
              </li>
              <li className={location.pathname === '/settings' ? 'active' : ''}>
                <a onClick={handleNav.bind(this, '/settings')}>
                  <i className="material-icons">settings</i>
                </a>
              </li>
            </ul>
            <ValveSwitch />
          </div>
          <ul ref={sideNav} className="sidenav">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <a onClick={handleNav.bind(this, '/')}>
                <i className="material-icons left">schedule</i> Schedule
              </a>
            </li>
            <li className={location.pathname === '/history' ? 'active' : ''}>
              <a onClick={handleNav.bind(this, '/history')}>
                <i className="material-icons left">history</i> History
              </a>
            </li>
            <li className={location.pathname === '/settings' ? 'active' : ''}>
              <a onClick={handleNav.bind(this, '/settings')}>
                <i className="material-icons left">settings</i> Settings
              </a>
            </li>
            <li>
              <a href="/logout">
                <i className="material-icons left">exit_to_app</i> Logout
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="container">
          <Switch>
            <Route path="/" exact component={Schedule} />
            <Route path="/settings" component={Settings} />
            <Route path="/history" component={History} />
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
      </main>
      <footer className="center"></footer>
    </div>
  );
}
