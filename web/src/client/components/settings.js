/*
 * @format
 */
import React from 'react';
import {useState, useEffect, useContext} from 'react';
import tapOrClick from 'react-tap-or-click';

import keys from '../../../keys.json';
import {getSettings, updateSettings} from '../actions/settings';
import {useHistory} from 'react-router-dom';
import Loading from './loading';
import {StoreContext} from '../store-provider';
import M from 'materialize-css';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';

export default function SettingsComponent() {
  const history = useHistory();
  const [
    {
      settings: {updating, initialized, settings},
    },
    dispatch,
  ] = useContext(StoreContext);

  const hasLocation = !!settings.location;
  const [locationError, setLocationError] = useState(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [checkWeather, setCheckWeather] = useState(hasLocation);
  const [shutoffDuration, setShutoffDuration] = useState(
    settings.shutoffDuration,
  );

  // initialize the UI and keep it in sync with
  // store changes
  useEffect(() => {
    if (!initialized) {
      dispatch(getSettings(history));
    } else {
      M.updateTextFields();
      setShutoffDuration(settings.shutoffDuration);
      if (!updatingLocation) {
        setCheckWeather(hasLocation);
      }
    }
  }, [
    initialized,
    updatingLocation,
    hasLocation,
    dispatch,
    history,
    settings.shutoffDuration,
  ]);

  // get the users location
  useEffect(() => {
    if (!updatingLocation) {
      return;
    }

    let cancelled = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (cancelled) {
            return;
          }

          setUpdatingLocation(false);
          setLocationError(null);
          dispatch(
            updateSettings({
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
            }),
          );
        },
        () => {
          if (cancelled) {
            return;
          }
          setUpdatingLocation(false);
          setLocationError('denied');
        },
      );
    } else {
      setUpdatingLocation(false);
      setLocationError('notSupported');
    }

    return () => {
      cancelled = true;
    };
  }, [updatingLocation, dispatch]);

  const handleChangeShutoffDuration = e => {
    const newSettings = {
      shutoffDuration: parseInt(e.target.value),
    };
    setShutoffDuration(newSettings.shutoffDuration);
    dispatch(updateSettings(newSettings, history));
  };

  const handleCheckWeather = e => {
    const newSettings = {
      location: null,
    };
    setCheckWeather(e.target.checked);
    dispatch(updateSettings(newSettings, history));
    if (e.target.checked) {
      setUpdatingLocation(true);
    }
  };

  const handleRefreshLocation = () => {
    setUpdatingLocation(true);
  };

  return !initialized ? (
    <Loading />
  ) : (
    <div className="row">
      <h3>
        Settings
        {updating && (
          <div className="preloader-wrapper small active">
            <div className="spinner-layer spinner-green-only">
              <div className="circle-clipper left">
                <div className="circle"></div>
              </div>
              <div className="gap-patch">
                <div className="circle"></div>
              </div>
              <div className="circle-clipper right">
                <div className="circle"></div>
              </div>
            </div>
          </div>
        )}
      </h3>
      <form className="col s12">
        <div className="row">
          <div className="col s12">
            <p>
              The 8 digit Pin code required to register this device with Apple
              HomeKit.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="input-field col s12">
            <label htmlFor="homekit-pin">HomeKit Pin</label>
            <input
              value={keys.HOMEKIT_PINCODE}
              readOnly={true}
              id="homekit-pin"
              type="text"
            />
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <p>
              Automatically switch off the valve after a set duration of time.
              This setting does not affect scheduled waterings.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <label>Automatic valve shut-off</label>
            <select
              className="browser-default"
              value={shutoffDuration}
              onChange={handleChangeShutoffDuration}>
              <option value="0">Disabled</option>
              <option value="1">1 Minute</option>
              <option value="2">2 Minutes</option>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <p>
              Check the weather in your location and don&apos;t start scheduled
              waterings if it currently raining.
            </p>
          </div>
        </div>
        <div className="row weather-row">
          <div className="col s12">
            <p>
              <label>
                <input
                  type="checkbox"
                  id="checkWeather"
                  className="filled-in"
                  onChange={handleCheckWeather}
                  checked={checkWeather}
                />
                <span>Check weather</span>
              </label>
              {checkWeather ? (
                <a
                  className="waves-effect weather-btn btn-flat right"
                  {...tapOrClick(handleRefreshLocation)}>
                  <i className="material-icons left">refresh</i> Refresh
                </a>
              ) : null}
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            {updatingLocation && (
              <div className="progress">
                <div className="indeterminate"></div>
              </div>
            )}
            {checkWeather && !updatingLocation && settings.location && (
              <UserLocationComponent location={settings.location} />
            )}
          </div>
        </div>
        {(locationError === 'denied' || locationError === 'notSupported') && (
          <div className="row">
            <div className="col s12">
              <div className="card-panel green accent-4">
                <span className="white-text">
                  {locationError === 'denied'
                    ? 'To use the weather checking feature this application must be able to determine your current location. Ensure that you have given permission for this website to view your location information.'
                    : 'Your browser doesn\t support geolocation. To use the weather checking feature this application must be able to determine your current location.'}{' '}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function useWeather(location) {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    let controller = null;
    if (location) {
      controller = new AbortController();
      fetch(
        `/api/1/weather?lat=${location.latitude}&lon=${location.longitude}`,
        {signal: controller.signal},
      )
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setWeather(res.weather);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setWeather(null);
          }
        });
    } else {
      setWeather(null);
    }

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [location]);

  return weather;
}

const MapContainer = GoogleApiWrapper({
  apiKey: keys.GOOGLE_MAPS_API_KEY,
})(props => {
  return (
    <Map
      google={props.google}
      zoom={15}
      containerStyle={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: '100vh',
      }}
      scrollWheel={false}
      draggable={false}
      keyboardShortcuts={false}
      disableDoubleClickZoom={true}
      zoomControl={false}
      mapTypeControl={false}
      scaleControl={false}
      streetViewControl={false}
      panControl={false}
      rotateControl={false}
      fullscreenControl={false}
      initialCenter={props.center}>
      <Marker />
    </Map>
  );
});

function UserLocationComponent({location}) {
  const weather = useWeather(location);
  return (
    <div className="row">
      <div className="col s12">
        {weather ? (
          <div className="weather-info">
            <img src={weather.icon} />
            <h5 className="right">{weather.description}</h5>
          </div>
        ) : null}
        <MapContainer
          center={{lat: location.latitude, lng: location.longitude}}
        />
      </div>
    </div>
  );
}
