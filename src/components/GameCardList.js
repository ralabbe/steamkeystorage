import React from 'react';
import GameCard from './GameCard.js';
import DefaultKeys from '../default-keys/keys.json';

// Create new keys array
var newDefaultKeys = [];

// Cycle through current keys
for (var arrayKey in DefaultKeys){
    var gameInfo = DefaultKeys[arrayKey]['Game,Key,Image Name,App ID,Notes'].split(','); // Split cells string into array
    
    var inNewArray = false;
    for (var newArrayKey in newDefaultKeys){ // Check if already in new keys array
        if (newDefaultKeys[newArrayKey]['name'] === gameInfo[0]){
            inNewArray = true;
        }
    };

    var gameKey = '';

    if (inNewArray === true){ // If yes, increment key count
        newDefaultKeys[newArrayKey]['keyCount']++;
        gameKey = {
            'key': gameInfo[1],
            'redeemed': 'unredeemed'
        }
        newDefaultKeys[newArrayKey]['keys'].push(gameKey);
    } else { // Otherwise, create new entry and add to new keys array
        var gameArray = [];
        gameArray['name']       = gameInfo[0];
        gameArray['keyCount']   = 1;
        gameArray['keys']       = [];
        gameArray['img']        = gameInfo[2];
        gameArray['game_id']    = gameInfo[3];
        gameKey = {
            'key': gameInfo[1],
            'redeemed': 'unredeemed'
        }
        gameArray['keys'].push(gameKey);
        newDefaultKeys.push(gameArray);
    };
};

newDefaultKeys.sort(function(a, b){ // Sort keys in alphabetical order
    if(a['name'] < b['name']) { return -1; }
    if(a['name'] > b['name']) { return 1; }
    return 0;
});

class CardList extends React.Component {
    componentDidMount(){
        setTimeout(() => {
            if (document.querySelector('.cardList')){
                document.querySelector('.cardList').classList.remove('fadeInInit');
            }
        }, 500);
    }

    render() {
        const searchTerm    = this.props.searchTerm;
        const addGameKey    = this.props.addGameKey;
        
        const userGameKeys  = this.props.gameKeys;
        const flexJustify = userGameKeys.length < 6 ? 'center' : 'normal';
        return (
            <div className="cardList fadeIn fadeInInit" style={{ justifyContent: flexJustify }}>
                {userGameKeys.map((gameData, index) => {
                    const gameTitle = gameData['name'] ? gameData['name'].toLowerCase() : '';
                    
                    if ( gameTitle !== '' && gameData['keyCount'] > 0 ){
                        var type = 'game';
                        type = gameData['game_type'] === '2' ? 'dlc' : type;
                        type = gameData['game_type'] === '3' ? 'music' : type;
                        const headerImg = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_IMG_DIR}${type}/${gameData['game_id']}-header.jpg`;
                        const visible = gameTitle.includes(searchTerm.toLowerCase()) ? '' : 'hidden';
                        
                        return (
                            <GameCard
                                key={gameData['game_id']}
                                cardKey={index}
                                visible={visible}
                                gameTitle={gameData['name']}
                                appID={gameData['game_id']}
                                gameKeyIDs={gameData['keys']}
                                headerImg={headerImg}
                                gameTypeID={gameData['game_type']}
                                keyCount={gameData['keyCount']}
                                addGameKey={addGameKey}
                            />
                        )
                    } else {
                        return '';
                    };
                })}
            </div>
        );
    }
};

CardList.defaultProps = {
    user: null,
    gameKeys: [],
}

export default CardList;