import React from 'react';
import './LoginForm.css';
import Toast from './Toast.js';
import LoadSpinner from './LoadSpinner.js';
import { Translate } from '../Translate.js';
import { userLogin, userRegister } from '../../apis/database-hooks.js';

class LoginForm extends React.Component {
    state = {
        formType: 'login',
        username: 'Ralabbe',
        usernameValid: 'valid',
        password: 'test12345',
        passwordValid: 'valid',
        email: '',
        emailValid: '',
        passwordVisible: false,
        result: null,
        loginError: '',
        loading: false,
    }

    componentDidMount(){
        setTimeout(() => {
            if (document.querySelector('.loginFormContent')){
                document.querySelector('.loginFormContent').classList.remove('fadeUpInit');
            }
        }, 100);
    }

    setError = () => {
        if (this.state.loginError !== ''){
            return <Toast message={this.state.loginError} type="error" />;
        }
    }

    // Username
    usernameInputChange = event => {
        const newUsername = event.target.value;

        var valid = this.state.usernameValid;
        if (this.validateUsername(newUsername) === true){
            valid = 'valid';
        } else {
            valid = this.state.usernameValid === 'invalid' ? 'invalid' : '';
        }
        this.setState({ username: newUsername, usernameValid: valid });
    }
    
    validateUsername = username => {
        const usernameToValidate = username || username === '' ? username : this.state.username;

        var validation = false;
        if (usernameToValidate.length >= 5){
            validation = true;
        }
        
        return validation;
    }

    // Password Input
    passwordInputChange = event => {
        const newPassword = event.target.value;

        var valid = this.state.passwordValid;
        if (this.validatePassword(newPassword) === true){
            valid = 'valid';
        } else {
            valid = this.state.passwordValid === 'invalid' ? 'invalid' : '';
        }
        this.setState({ password: newPassword, passwordValid: valid });
    }

    validatePassword = password => {
        const passwordToValidate = password || password === '' ? password : this.state.password;

        var validation = false;
        if (passwordToValidate.length >= 8){
            validation = true;
        }
        
        return validation;
    }
    
    showHidePassword = () => {
        var visibility = this.state.passwordVisible === false ? true : false;
        this.setState({ passwordVisible: visibility });
    }
    
    // Email Input
    emailInputChange = event => {
        const newEmail = event.target.value;

        var valid = this.state.emailValid;
        if (this.validateEmail(newEmail) === true){
            valid = 'valid';
        } else {
            valid = this.state.emailValid === 'invalid' ? 'invalid' : '';
        }
        this.setState({ email: newEmail, emailValid: valid });
    }


    validateEmail = email => {
        const emailToValidate = email || email === '' ? email : this.state.email;
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        var validation = false;
        if (emailToValidate.length >= 5 && re.test(String(emailToValidate).toLowerCase()) === true ){
            validation = true;
        }

        return validation;
    }

    emailInput = () => { // Show/hide email input based on formType
        if (this.state.formType === 'register'){
            return (
                <div className="inputWrapper">
                    <label>{Translate('Email')}</label>
                    <div className="inputIconWrapper">
                        <input type="email" minLength="5" placeholder={Translate('Email')} className={this.state.emailValid} onChange={ this.emailInputChange } value={this.state.email} aria-label={Translate('Email')} required />
                        <i className="fas fa-envelope inputIcon" aria-hidden="true"></i>
                    </div>
                </div>
            );
        }
    }

    swapForms = newType => {
        this.setState({
            formType: newType.toLowerCase(),
            emailValid: '',
            usernameValid: '',
            passwordValid: '',
            loginError: '',
        });
        if (document.querySelector('#loginPopupWrapper')){
            document.querySelector('#loginPopupWrapper').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[1].focus(); // Move focus back to first input
        }
    }

    userLoginComplete = userInfo => {
        const loginData = typeof userInfo === 'object' ? JSON.stringify(userInfo) : userInfo;
        if (this.props.onLogin && typeof this.props.onLogin === 'function'){ this.props.onLogin(loginData); }
        localStorage.setItem('steam-key-storage-user', loginData);
    }

    // Form submit
    onFormSubmit = e => { // Add Key form submit
        e.preventDefault();

        if (this.formType === 'register' && this.validateEmail() === false) {
            this.setState({ emailValid: 'invalid' });
            return;
        }

        if (this.validateUsername() === false) {
            this.setState({ usernameValid: 'invalid' });
            return;
        }

        if (this.validatePassword() === false) {
            this.setState({ passwordValid: 'invalid' });
            return;
        }

        this.setState({ loading: true });
        if (this.state.formType === 'register'){
            userRegister(this.state.email, this.state.username, this.state.password, (response) => {
                this.setState({ loading: false });
                if (response.status === 1){
                    this.userLoginComplete(response.data);
                } else {
                    console.log(response);
                    var errMessage = 'There was an error registering your account.';
                    var emailUsed = '';
                    var usernameUsed = '';

                    if (response.data && typeof response.data === 'string'){
                        emailUsed    = response.data.includes('Duplicate') && response.data.includes('email') ? 'invalid' : this.state.emailValid;
                        usernameUsed = response.data.includes('Duplicate') && response.data.includes('username') ? 'invalid' : this.state.usernameValid;
                        
                        if (emailUsed === 'invalid' && usernameUsed === 'invalid'){ // Currently unable to get both. SQL is only sending 1 duplicate error at a time.
                            errMessage = 'The username and email are already in use.';
                        } else if (emailUsed === 'invalid'){
                            errMessage = 'The email is already in use.';
                        } else if (usernameUsed === 'invalid'){
                            errMessage = 'The username is already in use.';
                        }
                    }

                    this.setState({
                        loginError: errMessage,
                        usernameValid: usernameUsed,
                        emailValid: emailUsed
                    });
                }
            });
        } else if (this.state.formType === 'login' ) {
            userLogin(this.state.username, this.state.password, (response) => {
                this.setState({ loading: false });
                if (response.status === 1){
                    const key = Object.keys(response.data)[0];
                    
                    if (document.querySelector('.loginFormContent')){
                        document.querySelector('.loginFormContent').classList.add('fadeUpInit');
                    }

                    setTimeout(() => {
                        this.userLoginComplete(response.data[key]);
                    }, 400);
                } else if (response.status === 'error' && response.data.toLowerCase() === 'no data being returned') {
                    this.setState({
                        loginError: 'The email and password combination is incorrect.',
                        usernameValid: 'invalid',
                        passwordValid: 'invalid'
                    });
                } else {
                    var errMessage = 'There was an error logging in. Please try again.';
                    this.setState({ loginError : errMessage });
                }
            });
        }
    }

    render(){
        const formTitle = this.state.formType === 'login' ? Translate('Login') : Translate('Register');
        const switchButtonTitle = this.state.formType === 'login' ? 'Register' : 'Login';
        const loadSpinner = this.state.loading === true ? <LoadSpinner size="xsmall" location="top right" /> : '';
        return (
            <div className="loginFormWrapper fullScreenContainer flexCenter">
                <div className="loginFormContent borderedContainer fadeUp fadeUpInit">
                    {loadSpinner}
                    <div className="borderedContainerContent">
                        <div className="iconBG"><i className="fab fa-steam icon-bg" aria-hidden="true"></i></div>
                        <h2>{formTitle}</h2>
                        {this.setError()}
                        <form className="form" onSubmit={this.onFormSubmit}>
                            <div className="formInputsWrapper">
                                <div className="inputWrapper">
                                    <label>{Translate('Username')}</label>
                                    <div className="inputIconWrapper">
                                        <input type="text" minLength="5" placeholder={Translate('Username') + ' (5 character minimum)'} className={this.state.usernameValid} onChange={ this.usernameInputChange } value={this.state.username} aria-label={Translate('Password')} required />
                                        <i className="fas fa-user inputIcon" aria-hidden="true"></i>
                                    </div>
                                </div>

                                {this.emailInput()}

                                <div className="inputWrapper">
                                    <label aria-label={Translate('Password')}>{Translate('Password')} <button type="button" onClick={ this.showHidePassword.bind(this) } tabIndex="0" className="showPassword" aria-label={Translate('Password')} >{ this.state.passwordVisible === false ? Translate('Show') : Translate('Hide') } {Translate('Password').toLowerCase()}</button></label>
                                    <div className="inputIconWrapper">
                                        <input type={ this.state.passwordVisible === false ? 'password' : 'text' } placeholder={Translate('Password') + ' (8 character minimum)'} minLength="8" className={this.state.passwordValid} onChange={ this.passwordInputChange } value={this.state.password} required />
                                        <i className="fas fa-lock inputIcon" aria-hidden="true"></i>
                                    </div>
                                </div>
                                <div className="submitWrapper">
                                    <input type="submit" value={formTitle} aria-label={formTitle} />
                                </div>
                            </div>
                        </form>
                        <div className="registerButtonWrapper">
                            <button onClick={ () => { this.swapForms(switchButtonTitle) } }>{Translate(switchButtonTitle)}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

LoginForm.defaultProps = {
    onLogin: null,
    popupClass: 'loginPopupWrapper',
}


export default LoginForm;