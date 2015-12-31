import React from 'react'
import { connect } from 'react-redux';
import { getSchedule, removeFromSchedule, addToSchedule } from '../actions/schedule';

import Loading from './loading'

@connect(state => state.schedule)
export default class ScheduleComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        /* eslint no-undef:0 */
        $('select').material_select();
        if (!this.props.initialized) {
            this.props.dispatch(getSchedule());
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.adding && !nextProps.adding) {
            $('#add-modal').closeModal();
        }
    }
    handleShowAdd = () => {
        $('#add-modal').openModal();
    }
    handleDelete = (id) => {
        this.props.dispatch(removeFromSchedule(id));
    }
    handleAdd = () => {
        this.props.dispatch(addToSchedule(
            parseInt(this.refs.duration.value),
            parseInt(this.refs.time.value),
            parseInt(this.refs.frequency.value)
        ));
    }
    handleCancel = () => {
        $('#add-modal').closeModal();
    }
    render() {
        return !this.props.initialized ? <Loading /> : (
            <div className='row'>
                {this.props.items.length ? (
                <div className='col s12'>
                    <table className='highlight bordered'>
                        <thead>
                            <tr>
                                <th>Water for</th>
                                <th>At</th>
                                <th>Every</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.props.items.map(i => {
                                return (<tr key={i.id}>
                                    <td>{i.duration} Minute{i.duration > 1 ? 's': ''}</td>
                                    <td>{i.time === 0 ? '12' : (i.time > 12 ? (i.time - 12) : i.time)}.00 {i.time === 0 ? 'midnight' : (i.time === 12 ? ' noon' : (i.time > 12 ? 'p.m.' : 'a.m.'))}</td>
                                    <td>{i.frequency} Day{i.frequency > 1 ? 's': ''}</td>
                                    <td width='24'><button style={{padding:'0 8px'}} onClick={this.handleDelete.bind(this,i.id) } className='btn-flat'><i className='material-icons'>delete</i></button></td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>) :
                (<div className='col s12 m6 offset-m3'>
                    <div className='card-panel teal'>
                        <span className='white-text'>
                            <h5>Nothing scheduled</h5>
                            Your watering schedule is currently empty. You can configure watering to occur on an automated schedule by clicking on the Add button below and choosing the duration, time, and frequency at which the watering should occur.
                        </span>
                    </div>
                </div>)}

                <div className='fixed-action-btn' style={{'bottom': '24px', 'right': '24px'}}>
                    <a onClick={this.handleShowAdd} className='btn-floating btn-large red waves-effect waves-light'>
                        <i className='large material-icons'>add</i>
                    </a>
                </div>

                <div id='add-modal' className='modal'>
                    <div className='modal-content'>
                        <h5>Schedule watering</h5>
                        <div className='row'>
                            <form className='col s12'>
                                <div className='row'>
                                    <div className='col s12 m4'>
                                        <label>Water for</label>
                                        <select ref='duration' className='browser-default'>
                                            <option value='1'>1 Minute</option>
                                            <option value='5'>5 Minutes</option>
                                            <option value='10'>10 Minutes</option>
                                            <option value='15'>15 Minutes</option>
                                            <option value='30'>30 Minutes</option>
                                            <option value='60'>60 Minutes</option>
                                        </select>
                                    </div>
                                    <div className='col s6 m4'>
                                        <label>At</label>
                                        <select ref='time' className='browser-default'>
                                            <option value='0'>12 midnight</option>
                                            <option value='1'>1.00 a.m.</option>
                                            <option value='2'>2.00 a.m.</option>
                                            <option value='3'>3.00 a.m.</option>
                                            <option value='4'>4.00 a.m.</option>
                                            <option value='5'>5.00 a.m.</option>
                                            <option value='6'>6.00 a.m.</option>
                                            <option value='7'>7.00 a.m.</option>
                                            <option value='8'>8.00 a.m.</option>
                                            <option value='9'>9.00 a.m.</option>
                                            <option value='10'>10.00 a.m.</option>
                                            <option value='11'>11.00 a.m.</option>
                                            <option value='12'>12 noon</option>
                                            <option value='13'>1.00 p.m.</option>
                                            <option value='14'>2.00 p.m.</option>
                                            <option value='15'>3.00 p.m.</option>
                                            <option value='16'>4.00 p.m.</option>
                                            <option value='17'>5.00 p.m.</option>
                                            <option value='18'>6.00 p.m.</option>
                                            <option value='19'>7.00 p.m.</option>
                                            <option value='20'>8.00 p.m.</option>
                                            <option value='21'>9.00 p.m.</option>
                                            <option value='22'>10.00 p.m.</option>
                                            <option value='23'>11.00 p.m.</option>
                                        </select>
                                    </div>
                                    <div className='col s6 m4'>
                                        <label>Every</label>
                                        <select ref='frequency' className='browser-default'>
                                            <option value='1'>1 Day</option>
                                            <option value='2'>2 Days</option>
                                            <option value='3'>3 Days</option>
                                            <option value='4'>4 Days</option>
                                            <option value='5'>5 Days</option>
                                            <option value='6'>6 Days</option>
                                            <option value='7'>7 Days</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <a className={'modal-action waves-effect waves-green btn-flat'+(this.props.adding?' disabled':'')} onClick={this.handleCancel}>Cancel</a>
                        <a className={'modal-action waves-effect waves-green btn-flat'+(this.props.adding?' disabled':'')}  onClick={this.handleAdd}>{this.props.adding ? 'Adding' : 'Add'}</a>
                    </div>
                </div>
            </div>);
    }
}
