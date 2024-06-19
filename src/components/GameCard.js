import React from 'react';
import ReactDOM from 'react-dom';
// import CryptoJS from "react-native-crypto-js";
import Sidebar from './Sidebar.js';

class GameCard extends React.Component {
    state = {
        errorMesage: '',
        fadeIn: 'fadeUp fadeUpInit',
    };

    componentDidMount(){
        const timer = (this.props.cardKey * 20) + 400;
        
        setTimeout(() => {
            this.setState({ fadeIn: '' });
        }, timer);
    }

    activateSidebar(){
        if (!document.querySelector('#sidebarWrapper')){ // Create sidebar if it doesn't exist
            var div = document.createElement('div');
            div.id = 'sidebarWrapper';
            div.classList.add('activatingSidebar');
            document.querySelector('body').append(div);
        }

        setTimeout( () => {
            if(document.querySelector('#sidebarWrapper')){
                document.querySelector('#sidebarWrapper').classList.remove('activatingSidebar');
            }
        }, 400);

        ReactDOM.render(
            <Sidebar
                key={this.props.appID}
                appID={this.props.appID}
                gameTitle={this.props.gameTitle}
                headerImg={this.props.headerImg}
                sidebarActive='true'
                keyCount={this.props.keyCount}
                gameKeyIDs={this.props.gameKeyIDs}
                gameTypeID={this.props.gameTypeID}
                addGameKey={this.props.addGameKey}
            />, document.querySelector("#sidebarWrapper")
        );
        setTimeout( () => {
            if (document.querySelector("#sidebarWrapper")){
                document.querySelector("#sidebarWrapper").classList.add('active');
                document.querySelector('.closeButton').focus();
            }
        }, 100);
    } 
    
    render() {
        const gameTitle = this.props.gameTitle;
        const gameCardClasses = 'gameCard ' + this.props.visible + ' ' + this.state.fadeIn;

        if (gameTitle !== ''){
            return (
                <div id={'gameCard-'+this.props.cardKey} className={gameCardClasses} tabIndex="0" aria-label={gameTitle} aria-pressed="false" role="button" onClick={this.activateSidebar.bind(this)} >
                    <div className="gameCardHeader">
                        <img src={this.props.headerImg} alt={gameTitle} />
                    </div>
                    <div className="gameCardInfo">
                        <div className="gameCardName" dangerouslySetInnerHTML={{__html: `${gameTitle}`}}></div>
                        <div className="gameCardKeys"><i className="fas fa-key"></i> {this.props.keyCount}</div>
                    </div>
                </div>
            );
        } else {
            return '';
        }
    }
}

GameCard.defaultProps = {
    cardKey: 0,
    appID: '',
    gameTitle: '',
    headerImg: 'steam_placeholder',
    keyCount: 0,
    gameKeyIDs: [],
    gameTypeID: 1,
}

export default GameCard;