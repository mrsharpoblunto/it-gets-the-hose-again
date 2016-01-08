import React from 'react';
import tapOrClick from 'react-tap-or-click';
import { connect } from 'react-redux';
import { pollValve,toggleValve } from '../actions/valve';

@connect(state => state.valve)
export default class ValveSwitch extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch(pollValve());
    }
    handleChange = () => {
        this.props.dispatch(toggleValve());
    }
    render() {
        return (<div className='right switch'>
            <label>
                Closed
                <input type='checkbox' {...tapOrClick(this.handleChange)} checked={this.props.open}/>
                <span className='lever'></span>
                Open
            </label>
        </div>);
    }
}
