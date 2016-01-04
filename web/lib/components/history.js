import React from 'react'
import moment from 'moment';
import { connect } from 'react-redux';
import { updateHistory } from '../actions/history';

import Loading from './loading';

@connect(state => state.history)
export default class HistoryComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (!this.props.initialized) {
            this.props.dispatch(updateHistory());
        }
    }
    render() {
        if (!this.props.initialized && this.props.loading) {
            return <Loading />;
        }
        return <div>
            <h3>History</h3> 
            {this.props.items.length ? (
            <ul className='collection'>
                {this.props.items.map(i => {
                    return <li key={i.id} className='collection-item'>{moment(i.timestamp,'x').format('MMM DD, hh:mm:ss a')} - {i.message} by <strong>{i.source}</strong></li>;
                })}
            </ul>) : 
            (<div className='col s12 m6 offset-m3'>
                <div className='card-panel green accent-4'>
                    <span className='white-text'>
                        Your watering history is currently empty. Every watering event that occurs will be recorded here.
                    </span>
                </div>
            </div>)}
        </div>
    }
}
