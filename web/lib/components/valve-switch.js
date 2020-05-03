/*
 * @format
 */
import React from 'react';
import {useEffect, useContext} from 'react';
import {StoreContext} from '../store-provider';
import {useHistory} from 'react-router-dom';
import {pollValve, toggleValve} from '../actions/valve';

export default function ValveSwitch() {
  const history = useHistory();
  const [
    {
      valve: {open},
    },
    dispatch,
  ] = useContext(StoreContext);

  useEffect(() => {
    dispatch(pollValve(history));
  }, [dispatch, history]);

  const handleChange = () => {
    dispatch(toggleValve(history));
  };
  return (
    <div className="right switch">
      <label>
        Closed
        <input type="checkbox" onChange={handleChange} checked={open} />
        <span className="lever"></span>
        Open
      </label>
    </div>
  );
}
