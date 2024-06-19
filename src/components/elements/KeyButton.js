import React from 'react';
import './KeyButton.css';
import { Translate } from '../Translate.js';
import { deleteKeys } from '../../apis/database-hooks.js';

class SingleKey extends React.Component {
    state = {
        keyStatus : 'inactive',
        gameKey : '',
        redemption: this.props.redemption,
        keyVisible: this.props.keyVisible,
    }

    componentDidMount() {
        // REMOVE COMPONENT WILL MOUNT. THIS IS LEGACY NOW
        if (this.props.redemption === 'Redeemed'){
            this.markRedeemedClick();
        }
    }

    keyInputClick = () => {
        if (this.state.gameKey === ''){ // If key is not being show, activate it
            this.acitvateKey();
        } else { // If key is shown, create a dummy input, copy it's value, and remove it
            this.copyKey();
        }
    }

    acitvateKey = () => {
        const key = this.props.gameKey['key'] ? this.props.gameKey['key'] : this.props.gameKey['id'];
        this.setState({
            gameKey: key,
            keyStatus: 'active'
        });
    }

    copyKey = () => {
        const dummyInput = document.createElement("input");
        document.body.appendChild(dummyInput);
        dummyInput.value = this.state.gameKey;
        dummyInput.select();
        document.execCommand('copy');
        document.body.removeChild(dummyInput);
    }

    markRedeemedClick = () => {
        if (this.state.redemption === 'Redeemed'){
            this.setState({ redemption: 'Unredeemed' });
        } else {
            this.setState({ redemption: 'Redeemed' });
    
            this.acitvateKey();
        }
    }

    deleteKey = () => {
        // this.setState({ keyVisible: 'hide' });
        const gameKeyID = this.props.gameKey['id'] ? this.props.gameKey['id'] : '';
        var func = function(response){
            console.log(response);
        }

        deleteKeys('79', [gameKeyID], func);
    }

    render(){
        const wrapperClasses = this.state.keyStatus === 'inactive' ? 'singleKeyWrapper' : 'singleKeyWrapper active';
        const copyIcon = this.state.keyStatus === 'inactive' ? '' : <i className="fas fa-copy"></i>;
        const redeemedButtonText = this.state.redemption === 'Redeemed' ? Translate('Mark') + ' ' + Translate('Unredeemed').toLowerCase() : Translate('Mark') + ' ' + Translate('Redeemed').toLowerCase();
        const gameKeyText = this.state.gameKey === '' ? Translate('Show key') : this.state.gameKey;

        if (this.state.keyVisible === 'hide'){
            return '';
        } else{
            if (1 == 2){
                return (
                    <div className={wrapperClasses}>
                        <div className="keyLabel">{Translate('Key')} #{this.props.keyIndex + 1} - {Translate(this.state.redemption)} <button className="markRedeemedButton" onClick={this.markRedeemedClick} >{redeemedButtonText}</button> <button className="deleteKeyButton" onClick={this.deleteKey} ><i className="fas fa-trash-alt"></i></button></div>
                        <div className="singleKeyInputWrapper">
                            <input type="button" readOnly value={gameKeyText} onClick={this.keyInputClick.bind(this)} />
                            {copyIcon}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className={wrapperClasses}>
                        <div className="keyLabel">{Translate('Key')} #{this.props.keyIndex + 1}</div>
                        <div className="singleKeyInputWrapper">
                            <input type="button" readOnly value={gameKeyText} onClick={this.keyInputClick.bind(this)} />
                            {copyIcon}
                        </div>
                    </div>
                );
            }
        }
    }
}

SingleKey.defaultProps = {
    redemption: 'Unredeemed',
    keyVisible: 'visible',
    userAuth: '',
}

export default SingleKey;