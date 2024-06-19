import React from 'react';
import axios from 'axios';
import { appInitCheck, getGames, getKeys, addGames, appTableSetup } from '../apis/database-hooks.js';

export function appInitStatusCheck(func) {
    if (typeof func === 'function'){
        appInitCheck((response) => {
            if (response && typeof response === 'object' && response.data && (response.data === 1 || response.data === -1)){
                func(response.data);
            } else {
                func('1'); // FOR TESTING
                // func('0');
            }
        });
    }
    return;
}

export function appInitTableSetup(func){
    appTableSetup((response) => {
        if (typeof func === 'function'){
            if (response && response.data && response.status === 1){
                func(response);
            } else {
                func('0');
            }
        }
    });
    return;
}

export function userData(func) {
    if (typeof func !== 'function'){ console.log('Function not passed to userData hook.'); return; }

    var userData = null;
    const localUser = localStorage.getItem('steam-key-storage-user');

    if (localUser && localUser !== ''){
        try {
            userData = JSON.parse(localUser);
        } catch (e){
            userData = localUser;
        }
    }

    func(userData);
    return;
}

export const addGamesToDatabase = async (gameIds, func) => {
    if (!gameIds){ return; }
    for (var id in gameIds){
        gameIds[id] = parseInt(gameIds[id]);
    }

    const fileName = '../data/masterAppList.json';
    const response = await axios.get( fileName ).catch( e => {console.log(e)} );

    var types = {
        'game': 1,
        'dlc': 2,
    };

    if (response && response.data){
        var gamesToAdd = [];
        for (var i in response.data){
            if (gameIds.includes(parseInt(response.data[i].appid))){
                var returnData = response.data[i];
                var type = types[response.data[i].type] ? types[response.data[i].type] : null;
                if (type !== null){
                    var name = returnData.name ? returnData.name : '';
                    var newGame = {
                        'id': returnData.appid,
                        'name': name,
                        'type': type
                    };
                    gamesToAdd.push(newGame);
                }
            }
        }

        addGames(gamesToAdd, (response) => {
            if (func && typeof func === 'function'){
                func(response);
            }
        });
    }
}

export function sortKeys(allKeys, func) {
    if (typeof func !== 'function'){ console.log('Function not passed to userData hook.'); return; }
    
    if (typeof allKeys === 'object'){ // Convert to array
        var gameKeys    = [];
        var keyCount    = 0;
        var gameCount   = 0;
        var gameIds     = [];

        for (var i in allKeys) { // Put keys in the same game id under one object
            if (allKeys[i].id && allKeys[i].game_id){ // Check to see if all required key data is available
                var gameId          = allKeys[i]['game_id'];
                var newGameKey      = allKeys[i]['game_key'];
                var newGameKeyId    = allKeys[i]['id'];
                var redeemed        = allKeys[i].redeemed ? allKeys[i].redeemed : 0;

                var inNewArray      = false;
                var gameKey         = '';

                for (var sortedi in gameKeys){ // Check if already in new keys array
                    if (sortedi === gameId){
                        inNewArray = true;
                        gameKey = {
                            'id': newGameKeyId,
                            'key': newGameKey,
                            'redeemed': redeemed
                        };
                        gameKeys[sortedi]['keys'].push(gameKey);
                        gameKeys[sortedi]['keyCount'] = gameKeys[sortedi]['keyCount'] + 1;
                        keyCount = keyCount + 1;
                        break;
                    }
                };
            
                if (inNewArray !== true){ // If yes, increment key count
                    var gameArray = [];
                    gameArray['game_id'] = gameId;
                    gameArray['keys'] = [];
                    gameArray['keyCount'] = 1;

                    gameKey = {
                        'id': newGameKeyId,
                        'key': newGameKey,
                        'redeemed': redeemed
                    };


                    gameIds[gameCount] = gameId;
                    gameArray['keys'].push(gameKey);
                    gameKeys[gameId] = gameArray;
                    gameCount = gameCount + 1;
                    keyCount = keyCount + 1;
                };
            }
        }
    }


    getGames(gameIds, (response) => { // Get game data (name & type)
        if (!gameIds || typeof gameIds !== 'object' || gameIds.length === 0){ console.error('No game keys passed'); return; }
        
        var sortedKeys = [];
        if (response.status === 1){
            var gamesInfo = response.data;

            for (var i in gamesInfo){
                var gameId = gamesInfo[i]['game_id'];
                gameKeys[gameId]['name'] = gamesInfo[i]['name'];
                gameKeys[gameId]['game_type'] = gamesInfo[i]['game_type_id'];
                sortedKeys.push(gameKeys[gameId]);

                var idIndex = gameIds.indexOf(gamesInfo[i]['game_id']);
                if (idIndex > -1) { gameIds.splice(idIndex, 1); } // Remove game from gameIds because it's been found
            }
        }

        if (gameIds.length > 0){
            // var newData = addGamesToDatabase(gameIds, function(){
            //     console.log('test');
            // });
        }

        sortedKeys.sort(function(a, b){ // Sort game by name
            var a_name = a['name'] ? a['name'] : '';
            var b_name = b['name'] ? b['name'] : '';
            if(a_name < b_name) { return -1; }
            if(a_name > b_name) { return 1; }
            return 0;
        });

        const returnedKeys = {
            'key_count': keyCount,
            'game_count': gameCount,
            'sorted_keys': sortedKeys,
        };

        func(returnedKeys);

    });

    return;
}



export function userKeyData(user, func) {
    var setUser = user ? user : null;

    try { // Parse if needed
        setUser = JSON.parse(setUser);
    } catch (err){ }

    const userID = setUser && typeof setUser === 'object' && setUser.id && !isNaN(parseInt(setUser.id)) ? setUser.id : null;
    getKeys(userID, null, (response) => {
        if (response.status && response.status === 1){
            sortKeys(response.data, (keysData) => {
                if (typeof func === 'function'){
                    func(keysData)
                }
            });
        } else {
            if (typeof func === 'function'){
                func(null)
            }
        }

    }, false);
}


class CustomHooks extends React.Component {
    render(){ return; }
}

export default CustomHooks;