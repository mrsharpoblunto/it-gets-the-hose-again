/*
 * @format
 */
import React from 'react';
import {useState, useContext, useEffect} from 'react';
import tapOrClick from 'react-tap-or-click';
import {useHistory} from 'react-router-dom';
import {login} from '../actions/auth';
import Logo from './logo';
import {StoreContext} from '../store-provider';
import M from 'materialize-css';

export default function LoginComponent() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const [
    {
      auth: {loading},
    },
    dispatch,
  ] = useContext(StoreContext);

  useEffect(() => {
    M.updateTextFields();
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    if (name && password) {
      dispatch(login(name, password, history));
    }
  };

  return (
    <div className="valign-wrapper" style={{width: '100%', height: '100%'}}>
      <div className="valign container">
        <div className="row">
          <div className="col s12 center">
            <h5>
              <Logo style={{height: '0.9em', marginBottom: '-0.06em'}} /> It
              gets the hose again
            </h5>
          </div>
        </div>
        <div className="row">
          <form className="col s12 m4 offset-m4">
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <label htmlFor="name">Username</label>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <label htmlFor="password">Password</label>
              </div>
            </div>
            <div className="row">
              <div className="col s12 center">
                <button
                  className={
                    'btn waves-effect waves-light ' +
                    (loading ? 'disabled' : '')
                  }
                  type="submit"
                  name="action"
                  {...tapOrClick(handleLogin)}>
                  {loading ? 'Logging in' : 'Login'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
