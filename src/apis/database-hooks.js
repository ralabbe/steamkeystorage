import axios from 'axios';
// import CryptoJS from "react-native-crypto-js";


function returnErr(errData, errMessage){
    const errResponse = {
        status: 'error',
        data: errData ? errData : -1,
        errMessage: errMessage ? errMessage : -1,
    };

    return errResponse;
}

const dbConnect = async (url, params, func) => {
    url = url && url !== '' ? url : process.env.REACT_APP_BASE_URL + process.env.REACT_APP_API_DIR + 'db-connect.php';
    params = params && typeof params === 'object' ? params : {};

    const response = await axios.get( url, {
        params: params
    } ).catch( e => {
        return returnErr(null, e);
    });

    if (response && response.data){
        if (func){
            var returnData = response.data === -1 ? response : response.data;
            func(returnData);
        }
    }

    return response;
}

// APP INITIONALIZATION HOOKS
export function appInitCheck(func){
    const params = {
        'action': 'app_init_check',
    };

    dbConnect(null, params, func);
}

export function appTableSetup(func){
    const params = {
        'action': 'app_init_table_setup',
    };

    dbConnect(null, params, func);
}

// DATABASE SETUP HOOK
export function databaseSetup(func){
    const params = {
        'action': 'database_setup',
    };
    
    dbConnect(null, params, func);
}

// KEY HOOKS
export function getKeys(user_id, key_id, func, decoded){
    const params = {
        'action': 'get_keys',
        'user_id': user_id,
        'key_id': key_id,
        'decoded': decoded,
    };
    
    dbConnect(null, params, func);
}

export function addKeys(user_id, keys_data, func){
    const params = {
        'action': 'add_keys',
        'user_id': user_id,
        'keys_data': keys_data,
    };

    dbConnect(null, params, func);
}

export function deleteKeys(user_id, keys_data, func){
    const params = {
        'action': 'delete_keys',
        'user_id': user_id,
        'keys_data': keys_data,
    };

    dbConnect(null, params, func);
}

// GAME INFO HOOKS
export function getGames(game_ids, func){
    if (typeof game_ids !== 'object'){ returnErr('Game ids need to be in an object'); }
    const params = {
        'action': 'get_games_info',
        'game_ids': game_ids,
    };

    dbConnect(null, params, func);
}

export function addGames(gamesData, func){
    if (!gamesData || typeof gamesData !== 'object'){ returnErr('Missing game data.'); }
    const params = {
        'action': 'add_game',
        'games_data': gamesData,
    };

    dbConnect(null, params, func);
}

// USER ACCOUNT HOOKS
export function userRegister(email, username, password, func){
    const params = {
        'action': 'user_register',
        'email': email,
        'username': username,
        'password': password,
    };

    dbConnect(null, params, func);
}

export async function userLogin(login, password, func){
    const params = {
        'action': 'user_login',
        'login': login,
        'password': password,
    };

    dbConnect(null, params, func);
}

export function userPasswordReset(email, func){
    const params = {
        'action': 'user_password_reset',
        'email': email,
    };

    dbConnect(null, params, func);
}

const defaultExport = () => {
    return '';
};

export default defaultExport;