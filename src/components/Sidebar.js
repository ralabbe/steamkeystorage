import React from 'react';
import CryptoJS from "react-native-crypto-js";
import ActionButton from './elements/ActionButton.js';
import KeyButton from './elements/KeyButton.js';
import CloseButton from './elements/CloseButton.js';
import { activateOverlay, closeOverlay } from './elements/Overlay.js';
import './Sidebar.css';


class Sidebar extends React.Component {
    state ={
        keyCount: this.props.keyCount,
        gameKeyIDs: this.props.gameKeyIDs
    }

    componentDidMount(){
        var allKeys = this.props.gameKeyIDs;

        for (var arrayKey in allKeys){
            allKeys[arrayKey]['key'] = CryptoJS.AES.encrypt(allKeys[arrayKey]['key'], this.props.gameTitle).toString();
            var decrypted = CryptoJS.AES.decrypt(allKeys[arrayKey]['key'], this.props.gameTitle).toString(CryptoJS.enc.Utf8);
            allKeys[arrayKey]['key'] = decrypted;
        }
    }
    
    closeSidebar = () => {
        var sidebarWrapper = document.querySelector('#sidebarWrapper');
        if (sidebarWrapper){
            sidebarWrapper.classList.remove('active');
        }

        var sidebarActive = this.props.sidebarActive;
        closeOverlay();

        setTimeout(function(){
            var sidebarWrapper = document.querySelector('#sidebarWrapper');
            if (sidebarActive === false && sidebarWrapper){
                sidebarWrapper.parentNode.removeChild(sidebarWrapper);
            }
        }, 400);
    }

    addKeyCallback = (data) => {
        var newKeyList = this.state.gameKeyIDs;
        if (data.games && data.games[0].keys){
            newKeyList = newKeyList.concat(data.games[0].keys);
        }
        this.setState({
            keyCount: this.state.keyCount + 1,
            gameKeyIDs: newKeyList
        });
    }

    render() {
        if (this.props.sidebarActive === 'true'){ // Activate overlay
            activateOverlay(this.closeSidebar, true);
        }

        const gameKeys = this.state.gameKeyIDs;
        
        // FIX THIS
        const addKeyGameData = {
            appid: this.props.appID,
            name: this.props.gameTitle,
            typeid: this.props.gameTypeID
        };

        return [
            <aside key="gameSidebar" id="gameSidebar">
                <CloseButton clickFunc={this.closeSidebar} />
                <div id="sidebarHeader">
                    <img src={this.props.headerImg} alt={this.props.gameTitle} />
                    <h2 dangerouslySetInnerHTML={{__html: `${this.props.gameTitle}`}}></h2>
                    <div id="sidebarKeyInfo">
                        <div id="sidebarKeyCount"><i className="fas fa-key"></i> {this.state.keyCount}</div>
                        <ActionButton icon="fas fa-plus-circle" text="Add" id="sidebarAdd" clickFunc={() => {this.props.addGameKey(addKeyGameData, this.addKeyCallback)}} />
                    </div>
                </div>
                <hr />
                <div id="sidebarKeys">
                {gameKeys.map(function(name, index){
                    return <KeyButton key={index} keyIndex={index} keyVisible='visible' gameKey={gameKeys[index]} />
                })}
                </div>
            </aside>
        ];
    }
}

Sidebar.defaultProps = {
    gameTitle: '',
    headerImg: '',
    gameKeyIDs: [],
    keyCount: 0,
    appID: '',
    gameTypeID: 1,
    sidebarActive: false,
}

export default Sidebar;