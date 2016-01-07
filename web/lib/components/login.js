import React from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/auth';
import Logo from './logo';

@connect(state => state.auth)
export default class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            nameValid: true,
            passwordValid: true
        };
    }
    componentDidUpdate() {
        /* eslint no-undef:0 */
        Materialize.updateTextFields();
    }
    handleInput = (field,e) => {
        const newState = {};
        newState[field] = e.target.value;
        this.setState(newState);
    }
    handleLogin = (e) => {
        e.preventDefault();
        if (this.state.name && this.state.password) {
            this.props.dispatch(login(this.state.name,this.state.password));
        }
    }
    render() {
        return <div className='valign-wrapper' style={{width:'100%',height:'100%'}}>
            <div className='valign container'>
                <div className='row'>
                    <div className='col s12 center'>
                        <h5><Logo style={{height: '0.9em',marginBottom:'-0.06em'}} /> It gets the hose again</h5>
                    </div>
                </div>
                <div className='row'>
                    <form className='col s12 m4 offset-m4'>
                        <div className="row">
                            <div className="input-field col s12">
                                <input id="name" type="text" value={this.state.name} onChange={this.handleInput.bind(this,'name')} />
                                <label htmlFor="name">Username</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <input id="password" type="password" value={this.state.password} onChange={this.handleInput.bind(this,'password')} />
                                <label htmlFor="password">Password</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col s12 center'>
                                <button className={'btn waves-effect waves-light '+(this.props.loading ? 'disabled': '')} type='submit' name='action' onClick={this.handleLogin}>{this.props.loading ? 'Logging in' : 'Login'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>;
    }
}
