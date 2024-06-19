import React from 'react';
import SearchBar from './elements/SearchBar.js';
import UserIcon from './elements/UserIcon.js';
import ActionButton from './elements/ActionButton.js';

class Navbar extends React.Component {
    state = {
        mounting: null,
    }

    toggleMobileMenu = () => {
        document.querySelector('#primaryNav').classList.toggle('show');
    }

    componentDidMount(){
        var mount = setTimeout( () => {
            if (document.querySelector('#navWrapper')){
                document.querySelector('#navWrapper').style.top = 0;
    
                window.addEventListener('scroll', () => { // Remove show class from navbar on scroll (for mobile)
                    if (document.querySelector('#primaryNav') && document.querySelector('#primaryNav').length > 0){
                        document.querySelector('#primaryNav').classList.remove('show');
                    }
                });
            }
        }, 500);

        this.setState({ mounting: mount });
    }

    componentWillUnmount(){
        clearTimeout(this.state.mounting);
    }

    render() {
        
        if (this.props.user !== null){
            return (
                <nav id="navWrapper">
                    <SearchBar onSearch={this.props.onSearch} />
                    <div id="mobileNavToggleWrapper">
                        <ActionButton icon="fas fa-bars" id="mobileNavToggle" clickFunc={this.toggleMobileMenu} label="Toggle Menu" />
                    </div>
                    <div id="primaryNav">
                        <ActionButton icon="fas fa-plus-circle" text="Add" id="navbarAdd" label="Add Key" clickFunc={this.props.addGameKey} />
                        <div className="gameKeyCount">
                            <div className="keyCount">
                                <i className="fas fa-key"></i> {this.props.keyCount}
                            </div>
                            <div className="gameCount">
                                <i className="fas fa-gamepad"></i> {this.props.gameCount}
                            </div>
                        </div>
                        <UserIcon appSetUser={this.props.appSetUser} user={this.props.user} />
                    </div>
                </nav>
            );
        } else {
            return '';
        }
    }
}

Navbar.defaultProps = {
    appSetUser: null,
    keyCount: '0',
    gameCount: '0',
    user: null,
}

export default Navbar;