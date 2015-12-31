import React from 'react'
import { connect } from 'react-redux';

import { getSettings, updateSettings } from '../actions/settings';
import Loading from './loading';

@connect(state => state.settings)
export default class SettingsComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (!this.props.initialized) {
            this.props.dispatch(getSettings());
        }
    }
    handleApply = (e) => {
        e.preventDefault();
        this.props.dispatch(updateSettings({
            shutoffDuration: parseInt(this.refs.shutoffDuration.value)
        }));
    }
    render() {
        return !this.props.initialized ? <Loading /> : (<div className='row'>
            <h3>Settings</h3>
            <form className='col s12'>
                <div className='row hide-on-large-only'>
                    <div className='col s12'>
                        <p>Automatically switch off the valve after a set duration of time. This setting does not affect scheduled watering timings.</p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col s12 m12 l6'>
                        <label>Automatic valve shut-off</label>
                        <select ref='shutoffDuration' className='browser-default' defaultValue={this.props.settings.shutoffDuration}>
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
                    <div className='col m6 hide-on-med-and-down'>
                        <p>Automatically switch off the valve after a set duration of time. This setting does not affect scheduled watering timings.</p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col s12'>
                        <button onClick={this.handleApply} className={'btn waves-effect waves-light '+(this.props.updating?'disabled':'')} type='submit' name='action'>{this.props.updating ? 'Applying' : 'Apply'}</button>
                    </div>
                </div>
            </form>
        </div>);
    }
}
