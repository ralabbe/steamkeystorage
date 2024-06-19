import React from 'react';
import axios from 'axios';
import './AddKeyPopup.css';
import Toast from './elements/Toast.js';
import { closePopup } from './elements/Popup.js';
import { Translate } from './Translate.js';
import { addKeys } from '../apis/database-hooks.js';

const appTypes = {
    'game': {
        'type_id': 1,
        'name': 'Game',
        'placeholder': 'Portal 2',
    },
    'dlc': {
        'type_id': 2,
        'name': 'DLC',
        'placeholder': Translate('DLC')
    },
};

class AddKeyPopup extends React.Component {
    state = {
        appTypeSelected: 'game',
        appTypeLoaded: 'game',
        oldTerm: '',
        newTerm: '',
        searchTimeout: null,
        newKey: '',
        appsFound: [],
        masterAppsList: null,
        selectedGame: null,
        user: null,
        addKeyError: '',
    }

    componentDidMount(){
        if (this.props.selectedGame !== null && typeof this.props.selectedGame === 'object'){
            var game = this.props.selectedGame;
            if (game.appid && game.name && game.typeid){
                this.setState({
                    selectedGame: game,
                    newTerm: game.name.replace('&apos;', "'")
                });
            }
        }
    }

    setError = () => {
        if (this.state.addKeyError !== ''){
            return <Toast message={this.state.addKeyError} type="error" />;
        }
    }
    
    // After Game Search input functionality
    gameSearch = async () => {
        if (this.state.masterAppsList === null || this.state.appTypeSelected !== this.state.appTypeLoaded){
            const fileName = '/data/steamapp_'+this.state.appTypeSelected+'.json';
            const response = await axios.get( fileName ).catch( e => {console.log(e)} );
    
            if (response){
                this.setState({
                    masterAppsList: response.data,
                    appTypeLoaded: this.state.appTypeSelected,
                });
            }
        }

        for (var gameKey in this.state.masterAppsList){ // Search all games
            var name = this.state.masterAppsList[gameKey].name; // Get game name

            if (name.toLowerCase().includes(this.state.newTerm.toLowerCase()) && name.toLowerCase() !== this.state.newTerm.toLowerCase()){ // If game name includes searched term
                var updatedList = this.state.appsFound;
                updatedList.push(this.state.masterAppsList[gameKey]);
                this.setState({ appsFound: updatedList });
            }

            if (this.state.appsFound.length > 50){
                break;
            }
        }

        for (var specificGameKey in this.state.masterAppsList){ // Search all games
            var specifiName = this.state.masterAppsList[specificGameKey].name; // Get game name

            if (specifiName.toLowerCase() === this.state.newTerm.toLowerCase()){
                var specificUpdatedList = this.state.appsFound;
                specificUpdatedList.unshift(this.state.masterAppsList[specificGameKey]);
                this.setState({ appsFound: specificUpdatedList });
            }
        }
    }

    radioInputChange = event => {
        this.setState({
            appTypeSelected: event.target.value,
            appsFound: [],
            newTerm: '',
            selectedGame: null
        });
    }

    gameSearchInputChange = event => {
        this.setState({ newTerm: event.target.value, selectedGame: null }); // Set the current game search

        clearTimeout(this.state.searchTimeout); // Clear timeout
        if (this.state.oldTerm !== event.target.value && event.target.value.length > 2){
            this.setState({ searchTimeout: setTimeout(() => {
                this.setState({ appsFound: [] }); // Set games found to 0 before searching (prevent showing games if value is an empty string)
                if (event.target.value !== ''){
                    this.setState({ oldTerm: event.target.value });
                    this.gameSearch();
                }
            }, 500) });
        } else if (event.target.value.length <= 2) {
            this.setState({ appsFound: [] });
        }
    }

    gameInputSet = game => {
        this.setState({ selectedGame: game, newTerm: game.name, appsFound: [] }) 
    }

    // Game key input functionality
    keyInputChange = event => {
        var newVal = event.target.value;

        // Force dash after 5th and 10th character
        if (newVal[5] && newVal[5] !== '-'){
            newVal = newVal.substr(0, 5) + '-' + newVal.substr(5); 
        }

        if (newVal[11] && newVal[11] !== '-'){
            newVal = newVal.substr(0, 11) + '-' + newVal.substr(11); 
        }

        this.setState({ newKey: newVal.toUpperCase() });
    }

    // Form submit
    onFormSubmit = (event, formClose) => { // Add Key form submit
        event.preventDefault();
        
        const game = this.state.selectedGame;
        const user = this.props.user;
        const key = this.state.newKey;

        const validGame = game && typeof game === 'object' && game.appid && game.appid !== '' ? true : false;
        const validUser = user && typeof user === 'object' && user.id && !isNaN(parseInt(user.id)) ? true : false;
        const validKey  = key && typeof key === 'string' && key.length === 17 ? true : false;

        if ( validGame === true && validUser === true && validKey === true ){ // Valid form submit
            this.setState({ addKeyError: '' });
            const keyData = [{
                game_id: game.appid,
                key: key,
            }];

            addKeys(user.id, keyData, (response) => {
                if (typeof this.props.formSubmit === 'function'){
                    if (response.status && response.status === 1 && response.data && response.data.id){
                        const newKeys = [{
                            'id':       response.data.id.toString(),
                            'key':      key,
                            'redeemed': '0',
                        }];

                        const gameData          = [];
                        gameData['game_id']     = game.appid.toString();
                        gameData['keys']        = newKeys;
                        gameData['keyCount']    = 1;
                        gameData['name']        = game.name;
                        gameData['game_type']   = appTypes[game.type] ? appTypes[game.type].type_id.toString() : '1';

                        const keyAddParams      = [];
                        keyAddParams['games']   = [gameData];
                        keyAddParams['action']  = 'add';

                        this.props.formSubmit(keyAddParams);

                        if (formClose === true){
                            closePopup(this.props.popupID);
                        } else {
                            this.setState({
                                selectedGame: '',
                                newTerm: '',
                                newKey: '',
                            });
                        }
                    } else {
                        const errMessage = response.data && typeof response.data === 'string' ? ' ' + Translate(response.data) : ''
                        this.setState({ addKeyError: Translate('There was an error adding your key.') + errMessage });
                    }
                }
            });
        } else {
            if (validGame === false){
                this.setState({ addKeyError: 'Please select a game from the dropdown.' });
            }
            
            if (validUser === false){
                this.setState({ addKeyError: 'Your user information is incorrect. Please sign out and sign back in.' });
            }
            
            if (validKey === false){
                this.setState({ addKeyError: 'The key you entered is not the correct format.' });
            }
            
            return;
        }
    }

    render(){
        var suggestionsContainer = '';
        if (this.state.appsFound.length > 0){
            var suggestions = this.state.appsFound.map( (game, index) => {
                return <li  tabIndex="0" key={index} onMouseDown={() => { this.gameInputSet(game) } } onKeyDown={(e) => { if (e.keyCode === 13 || e.keyCode === 32){ this.gameInputSet(game) } } } >{game.name}</li>;
            });
            suggestionsContainer = <ul className="suggestionList">{suggestions}</ul>;
        }

        const radioInputs = Object.keys(appTypes).map( (key, index) => {
            const type = appTypes[key];
            return <React.Fragment key={type.name}>
                <input type="radio" key={type} id={`steam${type.name}`} tabIndex="0" defaultChecked={ index === 0 ? true : false } onChange={ this.radioInputChange.bind(this) } name="keyType" value={key} aria-label={Translate(type.name)} />
                <label htmlFor={`steam${type.name}`}>{Translate(type.name)}</label>
            </React.Fragment>
        });

        var appInputClass = '';
        if (this.state.selectedGame === 'INVALID'){
            appInputClass = 'invalid';
        } else if (this.state.selectedGame){
            appInputClass = 'valid';
        }

        return (
            <React.Fragment>
                {this.setError()}
                <div className="iconBGWrapper"><i className="fab fa-steam iconBG" aria-hidden="true"></i></div>
                <h2>{Translate('Add a key')}</h2>
                <form className="form">
                    <div className="formInputsWrapper">
                        <div className="formRadioWrapper">
                            {radioInputs}
                        </div>
                        <div className="inputWrapper">
                            <label>{Translate(appTypes[this.state.appTypeSelected].name)}</label>
                            <div id="gameKeyInputWrapper" className="inputIconWrapper">
                                <input type="text" placeholder={appTypes[this.state.appTypeSelected].placeholder} minLength="3" className={appInputClass} onChange={ this.gameSearchInputChange.bind(this) } value={this.state.newTerm} required />
                                <i className="fas fa-gamepad inputIcon" aria-hidden="true"></i>
                                {suggestionsContainer}
                            </div>
                        </div>
                        <div className="inputWrapper">
                            <label>{Translate('New key')}</label>
                            <div className="inputIconWrapper">
                                <input type="text" placeholder="00000-xxxxx-xxxxx" maxLength="17" className={this.state.newKey.length === 17 ? 'valid' : ''} onChange={this.keyInputChange} pattern="[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}" value={this.state.newKey} required />
                                <i className="fas fa-key inputIcon" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className="submitWrapper">
                            <input type="submit" style={{width: 'calc(50% - .4rem'}} value={Translate('Save')} onClick={e => this.onFormSubmit(e, false)} />
                            <input type="submit" style={{width: 'calc(50% - .4rem', marginLeft: '.8rem'}} value={Translate('Save and Close')} onClick={e => this.onFormSubmit(e, true)} />
                        </div>
                    </div>
                </form>
            </React.Fragment>
        )
    }
}

AddKeyPopup.defaultProps = {
    user: null,
    formSubmit: null,
    selectedGame: null,
    popupID: 'addGameKeyWrapper',
}


export default AddKeyPopup;