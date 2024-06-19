import React from 'react';
import Navbar from './Navbar.js';
import GameCardList from './GameCardList.js';
import AddKeyPopup from './AddKeyPopup.js';
import LoginForm from './elements/LoginForm.js';
import { activatePopup } from './elements/Popup.js';
import { userData, userKeyData } from './CustomHooks.js';
import './AppStart.css';

class App extends React.Component {
    state = {
        searchTerm: '',
        user: 'pending...',
        userGameKeys: [],
        userTotalKeys: 0,
        userTotalGames: 0,
    };

    componentDidMount(){ // Set user if they're logged in
        userData((user) => {
            var setUser = user ? user : null;
            this.appSetUser(setUser);
        });
    }

    appSetUser = user => {
        var setUser = user ? user : null;
        try {
            setUser = JSON.parse(setUser);
        } catch(err) {}

        userKeyData(setUser, (keyData) =>{
            if (keyData !== null){
                this.setState({
                    user: setUser,
                    userTotalKeys: keyData['key_count'],
                    userTotalGames: keyData['game_count'],
                    userGameKeys: keyData['sorted_keys']
                });
            } else {
                this.setState({
                    user: setUser,
                    userTotalKeys: 0,
                    userTotalGames: 0,
                    userGameKeys: []
                });
            }
        });
    }

    onGameSearch = term => {
        this.setState({ searchTerm: term });
    }
    
    showAddGameKeyPopup = (game, submitCallback) => {
        const popupID = 'addGameKeyWrapper';
        activatePopup(popupID, <AddKeyPopup selectedGame={game} user={this.state.user} formSubmit={(data) => { this.userKeysUpdated(data); if (submitCallback && typeof submitCallback === 'function') { submitCallback(data) } }} popupID={popupID} />);
    }

    userKeysUpdated = (data) => {
        // If data is passed, an action is passed, and if at least 1 key is passed
        if (data && typeof data === 'object' && data.action && data.games && typeof data.games === 'object' && Object.keys(data.games).length > 0){
            const currentKeys = this.state.userGameKeys; // Current keys

            // Used to update totals later
            var keyTotal = this.state.userTotalKeys;
            var gameTotal = this.state.userTotalGames;
            
            const newGames = data.games; // Games and keys passed as params
            const action = data.action; // Add or remove action

            var currentKeysUpdated = false; // Used to check if states need to be updated

            for (var newGames_i in newGames){
                const currentNewGame = newGames[newGames_i];
                var added = false;
                if (typeof currentNewGame === 'object' && currentNewGame.game_id && currentNewGame.keys && typeof currentNewGame.keys === 'object' && Object.keys(currentNewGame.keys).length > 0){
                    for (var currentKeys_i in currentKeys){
                        const currentGame = currentKeys[currentKeys_i];
                        if (currentGame.game_id === currentNewGame.game_id){
                            currentKeys[currentKeys_i].keys.concat(currentNewGame.keys);
                            added = true;
                            currentKeysUpdated = true;
                            keyTotal = keyTotal + Object.keys(currentNewGame.keys).length;
                            currentKeys[currentKeys_i].keyCount = currentKeys[currentKeys_i].keyCount + Object.keys(currentNewGame.keys).length;
                        }
                    }

                    if (added === false && action === 'add'){ // Game doesn't exist in current game list and keys need to be added
                        currentKeys.push(currentNewGame);
                        currentKeysUpdated = true;
                        gameTotal++;
                        keyTotal = keyTotal + Object.keys(currentNewGame.keys).length;
                    }
                }
            }

            if (currentKeysUpdated === true){
                currentKeys.sort(function(a, b){ // Sort games in alphabetical order
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                });
                
                this.setState({
                    userGameKeys: currentKeys,
                    userTotalKeys: keyTotal,
                    userTotalGames: gameTotal,
                });
            }
        }
    }

    render() {
        if (this.state.user === null){
            return (
                <main>
                    <LoginForm onLogin={this.appSetUser} />
                </main>
            );
        } else { // If init has been set up
            return (
                <main>
                    <Navbar appSetUser={this.appSetUser} user={this.state.user} keyCount={this.state.userTotalKeys} gameCount={this.state.userTotalGames} onSearch={this.onGameSearch} addGameKey={this.showAddGameKeyPopup} />
                    <GameCardList searchTerm={this.state.searchTerm} addGameKey={this.showAddGameKeyPopup} user={this.state.user} gameKeys={this.state.userGameKeys} />
                </main>
            );
        }
    };
};

export default App;