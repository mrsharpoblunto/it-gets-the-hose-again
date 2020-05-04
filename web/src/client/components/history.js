/*
 * @format
 */
import React from 'react';
import {useEffect, useContext} from 'react';
import moment from 'moment';
import {StoreContext} from '../store-provider';
import {useHistory} from 'react-router-dom';
import {updateHistory} from '../actions/history';

import Loading from './loading';

export default function HistoryComponent() {
  const history = useHistory();
  const [
    {
      history: {initialized, loading, items},
    },
    dispatch,
  ] = useContext(StoreContext);

  useEffect(() => {
    if (!initialized) {
      dispatch(updateHistory(history));
    }
  }, [initialized, dispatch, history]);

  return !initialized && loading ? (
    <Loading />
  ) : (
    <div>
      <h3>History</h3>
      {items.length ? (
        <ul className="collection">
          {items.map(i => {
            return (
              <li key={i.id} className="collection-item">
                {moment(i.timestamp, 'x').format('MMM DD, hh:mm:ss a')} -{' '}
                {i.message} by <strong>{i.source}</strong>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="col s12 m6 offset-m3">
          <div className="card-panel green accent-4">
            <span className="white-text">
              Your watering history is currently empty. Every watering event
              that occurs will be recorded here.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
