import React from 'react';
import './UserIcon.css';
import { Translate } from '../Translate.js';

class UserIcon extends React.Component {
    state = {
        loggedin: false,
        activeDropdown: false,
    }

    componentWillUnmount(){
        document.removeEventListener('click', this.bodyDropdownClose);
    }

    buttonOnClick(){ // When user icon is clicked, show login popup or dropdown depending on login status
        const currentDropdownStatus = this.state.activeDropdown;
        this.setState({ activeDropdown: !currentDropdownStatus });
    }

    bodyDropdownClose = e => { // Close dropdown if clicked outside of dropdown
        if (!e.target.closest('.profileButtonWrapper')){
            this.setState({ activeDropdown: false });
        }
    }

    logout = () => {
        localStorage.removeItem('steam-key-storage-user');
        if (typeof this.props.appSetUser === 'function'){
            this.props.appSetUser(null);
        }
    }

    render(){
        var icon        = '';
        var iconbg      = '';
        var dropdown    = '';

        if (typeof this.props.user == 'object' && this.props.user['profile_img']){
            iconbg = 'url(' + process.env.REACT_APP_BASE_URL + process.env.REACT_APP_IMG_DIR + 'profile_img/' + this.props.user['profile_img'] + ')';
        } else {
            icon = <i className="fas fa-user"></i>;
        }

        if (this.state.activeDropdown === true){
            dropdown = (
                        <ul id="profileDropdown" className="dropdownLoading">
                            <li><button>{Translate('Account settings')}</button></li>
                            <li><button onClick={this.logout}>{Translate('Logout')}</button></li>
                        </ul>
                    );
            
            setTimeout(() => {
                if (document.querySelector('#profileDropdown')){
                    document.querySelector('#profileDropdown').classList.remove('dropdownLoading');
                }
            }, 100);

            document.addEventListener('click', this.bodyDropdownClose); // Closet dropdown if user clicks outside the dropdown
        } else {
            document.removeEventListener('click', this.bodyDropdownClose);
        }
        
        return (
            <React.Fragment>
                <div className="profileButtonWrapper">
                    <button className='loggedInIcon' aria-label={Translate('Account')} onClick={ this.buttonOnClick.bind(this) } style={ { backgroundImage: iconbg } }>{icon}</button>
                    {dropdown}
                </div>
            </React.Fragment>
        )
    }
}

UserIcon.defaultProps = {
    appLogin: null,
    user: null,
}

export default UserIcon;