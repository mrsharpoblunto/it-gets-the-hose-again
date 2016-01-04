import React from 'react'
import { connect } from 'react-redux';

import superagent from '../superagent-promise';
import * as keys from '../../keys';
import { getSettings, updateSettings } from '../actions/settings';
import Loading from './loading';

@connect(state => state.settings)
export default class SettingsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shutoffDuration: 0,
            location: null,
            checkWeather: false
        };
    }
    componentDidMount() {
        if (!this.props.initialized) {
            this.props.dispatch(getSettings());
        } else {
            this.setStateFromProps(this.props);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.initialized && !nextProps.updating) {
            this.setStateFromProps(nextProps);
        }
    }
    setStateFromProps(props) {
        this.setState({
            shutoffDuration: props.settings.shutoffDuration,
            location: props.settings.location,
            checkWeather: !!props.settings.location
        });
    }
    handleChangeShutoffDuration = (e) => {
        const newState = {
            shutoffDuration: parseInt(e.target.value)
        };
        this.setState(newState);
        this.props.dispatch(updateSettings(newState));
    }
    handleCheckWeather = (e) => {
        this.setState({
            checkWeather: e.target.checked
        });
        if (!e.target.checked) {
            this.props.dispatch(updateSettings({
                location: null
            }));
        }
    }
    handleChangeLocation = (loc) => {
        const newState = {
           location: loc
        };
        this.setState(newState);
        this.props.dispatch(updateSettings(newState));
    }
    handleRefreshLocation = () => {
        this.setState({ location: null });
    }
    render() {
        return !this.props.initialized ? <Loading /> : (<div className='row'>
            <h3>Settings</h3>
            <form className='col s12'>
                <div className='row'>
                    <div className='col s12'>
                        <p>Automatically switch off the valve after a set duration of time. This setting does not affect scheduled waterings.</p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col s12'>
                        <label>Automatic valve shut-off</label>
                        <select ref='shutoffDuration' className='browser-default' value={this.state.shutoffDuration} onChange={this.handleChangeShutoffDuration}>
                            <option value='0'>Disabled</option>
                            <option value='1'>1 Minute</option>
                            <option value='2'>2 Minutes</option>
                            <option value='5'>5 Minutes</option>
                            <option value='10'>10 Minutes</option>
                            <option value='15'>15 Minutes</option>
                            <option value='30'>30 Minutes</option>
                            <option value='60'>60 Minutes</option>
                        </select>
                    </div>
                </div>
                <div className='row'>
                    <div className='col s12'>
                        <p>Check the weather in your location and don't start scheduled waterings if it currently raining.</p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col s12'>
                        <p>
                            <input type='checkbox' id='checkWeather' className='filled-in' onChange={this.handleCheckWeather} checked={this.state.checkWeather} />
                            <label htmlFor='checkWeather'>Check weather</label>
                            { this.state.checkWeather ? (<a className="waves-effect waves-teal btn-flat right" style={{marginTop:'-6px'}} onClick={this.handleRefreshLocation}><i className='material-icons left'>refresh</i> Refresh</a>) : null }
                        </p>
                    </div>
                </div>
                { this.state.checkWeather ?
                (<div className='row'>
                    <div className='col s12'>
                        <UserLocationComponent location={this.state.location} onChange={this.handleChangeLocation} />
                    </div>
                </div>) : null }
            </form>
        </div>);
    }
}

class UserLocationComponent extends React.Component {
    static propTypes = {
        onChange: React.PropTypes.func.isRequired,
        location: React.PropTypes.object
    }
    constructor(props) {
        super(props);
        this.state = {
            notSupported: false,
            denied: false
        };
    }
    componentDidMount() {
        this.setStateFromProps(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.setStateFromProps(nextProps);
    }
    setStateFromProps(props) {
        this.setState({
            location: props.location
        });
        if (!props.location) {
            this.findLocation();
        } else {
            superagent
                .get(`/api/1/weather?lat=${props.location.latitude}&lon=${props.location.longitude}`)
                .accept('json')
                .end()
                .then(res => {
                    if (res.body.success) {
                        this.setState({ weather: res.body.weather });
                    }
                })
                .catch(() => {
                    this.setState({ weather: null });
                });
        }
    }
    findLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const newState = {
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                };
                this.setState(newState);
                this.props.onChange(newState.location);
            },() => {
                this.setState({ denied: true });
            });
        } else {
            this.setState({ notSupported: true });
        }
    }
    render() {
        if (this.state.denied || this.state.notSupported) {
            return <div className="row">
                <div className="col s12">
                    <div className="card-panel teal">
                        <span className="white-text">{ 
                            this.state.denied ? 
                            'To use the weather checking feature this application must be able to determine your current location. Ensure that you have given permission for this website to view your location information.' : 'Your browser doesn\t support geolocation. To use the weather checking feature this application must be able to determine your current location.'} </span>
                    </div>
                </div>
            </div>;
        } else if (!this.state.location) {
            return <div className='row'>
                <div className='col s12'>
                    <div className="progress">
                        <div className="indeterminate"></div>
                    </div>
                </div>
            </div>;
        } else {
            return <div>
                { this.state.weather ? 
                (<div className='weather-info'>
                    <img src={this.state.weather.icon} /> 
                    <p className='right'>{this.state.weather.description}</p>
                </div>)
                : null }
                <img style={{width:'100%',maxWidth:'100%'}}src={`https://maps.googleapis.com/maps/api/staticmap?center=${this.state.location.latitude},${this.state.location.longitude}&zoom=15&size=1280x720&key=${keys.GOOGLE_MAPS_API_KEY}`} />
            </div>;
        }
    }
}
