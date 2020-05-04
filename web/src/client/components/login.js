/*
 * @format
 */
import React from 'react';
import {useState, useContext} from 'react';
import tapOrClick from 'react-tap-or-click';
import {useHistory} from 'react-router-dom';
import {login} from '../actions/auth';
import Logo from './logo';
import {StoreContext} from '../store-provider';

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
    /* eslint no-undef:0 */
    Materialize.updateTextFields();
  });

  handleLogin = useCallback(
    e => {
      e.preventDefault();
      if (name && password) {
        dispatch(login(name, password, history));
      }
    },
    [name, password, dispatch, history],
  );

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
                  id="name"
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
                  id="password"
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
                    (state.loading ? 'disabled' : '')
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
