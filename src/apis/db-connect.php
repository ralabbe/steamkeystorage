<?php

header('Access-Control-Allow-Origin:*');

if (!isset($_GET['action'])) { returnError('Action not set'); }


// DATABASE SETTINGS
function databaseCredentials(){
    include('../../settings.php');

    $data = (object)[
        'server'    => $db_server,
        'database'  => $db_name,
        'username'  => $db_username,
        'password'  => $db_password,
    ];
    return $data;
}


// DATABASE TABLES
function databaseTables($type){
    switch ($type){
        case 'settings':
            return 'app_options';
        case 'keys':
            return 'game_key';
        case 'game_type':
            return 'game_type';
        case 'games':
            return 'game';
        case 'users':
            return 'user';
    }
}


// ENDPOINT ROUTES
switch($_GET['action']){
    case 'app_init_check':
        appInitCheck();
    case 'app_init_table_setup':
        appInitTableSetup();
    case 'get_games_info':
        getGames();
        break;
    case 'add_game':
        addGames();
        break;
    case 'get_keys':
        getKeys();
        break;
    case 'add_keys':
        addKeys();
        break;
    case 'delete_keys':
        deleteKeys();
        break;
    case 'user_register':
        userRegister();
        break;
    case 'user_login':
        userLogin();
        break;
    case 'user_password_reset':
        userPasswordReset();
        break;
    default:
        returnError('Action route does not exist');
        break;
}


// RETURN RESPONSE
function returnResponse($data = null, $status = null){
    if ($data == null){ returnError('No data being returned'); } // Return an error if an object isn't sent over
    
    $response           = new stdClass();
    $response->status   = isset($status) ? $status : 1;
    $response->data     = $data;
    
    echo json_encode($response);
    die();
}


// DB CONNECT SETUP AND EXEUCTION
function dbConnect($request, $returnDefaultError = false){
    if (!isset($request)){ returnError('Database request not set'); }

    //// Query Construction
    $query = '';

    // Select, Update, or Delete
    $statement = isset($request->statement) ? strtoupper($request->statement) : '';
    if (!in_array($statement, array('SELECT', 'INSERT INTO','UPDATE', 'DELETE'))){ returnError('Database request statement not set'); }
    
    // Values
    $values         = isset($request->values) ? $request->values : '*';
    $valueKeys      = isset($request->values_keys) ? $request->values_keys : '';
    
    if (gettype($values) === 'array' && gettype($valueKeys) === 'array' && $statement !== 'DELETE'){ // If an object is received, use that
        // Setup keys
        $allValKeys = '';
        foreach ($valueKeys as $valKey){
            $allValKeys .= $valKey . ',';
        }
        
        $valueValues = '';
        foreach ($values as $valueData) {
            $valueValues .= ' ( ';

            foreach ($valueKeys as $valKey){
                $currentIterationValue = isset($valueData->$valKey) ? "'" . addslashes($valueData->$valKey)  . "'" : 'NULL';
                $valueValues .= $currentIterationValue . ',';
            }

            $valueValues = substr($valueValues, 0, -1);

            $valueValues .= ' ),';
        }

        $valueKeys  = substr($allValKeys, 0, -1);
        $values  = substr($valueValues, 0, -1);;
    }

    // Table
    $table = isset($request->table) ? $request->table : returnError('Database request table not set');

    // Where
    $where = isset($request->where) ? ' WHERE ' . $request->where : '';

    // Limit
    $limit = isset($request->limit) && is_numeric($request->limit) ? ' LIMIT ' . intval($request->limit) : '';


    // Construct Query
    if ($statement === 'INSERT INTO'){
        if ($valueKeys === '' || $values === '*'){ returnError('Keys or values not sent to insert query'); }
        $query = 'INSERT INTO ' . $table . ' ( ' . $valueKeys . ' ) VALUES ' . $values;
        if (isset($request->duplicate_keys) && gettype($request->duplicate_keys) === 'array'){
            $query .= ' ON DUPLICATE KEY UPDATE ';
            foreach ($request->duplicate_keys as $index => $duplicate){
                $end = $index === count($request->duplicate_keys) - 1 ? ';' : ',';
                $query .= $duplicate . ' = values(' . $duplicate . ')' . $end . ' ';
            }
        }
        // return returnResponse($query, 1);
    } else if ($statement === 'UPDATE'){
        $query = '';
    } else if ($statement === 'SELECT'){
        $query = 'SELECT  ' . $values . ' FROM ' . $table . $where . $limit;
    } else if ($statement === 'DELETE' && gettype($values) === 'array' && gettype($valueKeys) === 'array'){
        $query = '';
        
        foreach ($values as $valueData){
            $deleteValues = '';
            foreach ($valueKeys as $valKey){
                if (isset($valueData->$valKey)){
                    // returnResponse($valueData->$valKey, 1);
                    $deleteValues .= $deleteValues !== '' ? ' AND ' : '';
                    $deleteValues .= $valKey . ' = "' . $valueData->$valKey . '"';
                }
            }
            
            $query .= $deleteValues != '' ? 'DELETE FROM ' . $table . ' WHERE ' . $deleteValues . ';' : '';
        }
    }


    // Database Connection
    $dbCredentials = databaseCredentials();

    $conn = new mysqli($dbCredentials->server, $dbCredentials->username, $dbCredentials->password, $dbCredentials->database);
    !$conn->connect_error ?: die('Connection failed: ' . $conn->connect_error);

    $sql_result = $conn->query($query);

    $response = new stdClass();
    
    if ($statement === 'INSERT INTO'){
        if (isset($conn->error) && $conn->error !== null && $conn->error !== ''){
            returnError($conn->error);
        } else {
            if (isset($request->output) && $request->output == true){
                $response->id = $conn->insert_id;
            } else {
                $response = 'Success';
            }
        }
    } else if ($statement === 'UPDATE'){
        $query = '';
    } else if ($statement === 'SELECT'){
        if (isset($sql_result->num_rows) && $sql_result->num_rows > 0) {
            // output data of each row
            while($row = $sql_result->fetch_assoc()) {
                $id             = $row['id'];
                $response->$id  = $row;
            }
        } else {
            if ($returnDefaultError !== false){
                returnError('No results found');
            } else {
                $response = null;
            }
        }
    }

    $conn->close();

    return $response;
}

function returnError($errMessage){
    $error = isset($errMessage) && $errMessage != '' ? $errMessage : 'Error not set';
    returnResponse($error, 'error');
}


// APP INIT ENDPOINT
function appInitCheck(){
    $request = (object)[
        'statement' => 'SELECT',
        'table'     => databaseTables('settings'),
        'where'     => ' setting="app_init" ',
    ];

    $db_response = dbConnect($request, false);
    
    if (isset($db_response) && gettype($db_response) === 'object'){
        foreach ($db_response as $init_response) {
            if (isset($init_response['value']) && (int)$init_response['value'] === 1){
                returnResponse('1', 1);
            } else {
                returnError('0');
            }
        }
    }
    
    returnError('App not initialized');
}


// APP TABLE SETUP
function appInitTableSetup(){
    $dbCredentials  = databaseCredentials();
    $conn           = new mysqli($dbCredentials->server, $dbCredentials->username, $dbCredentials->password, $dbCredentials->database);
    
    !$conn->connect_error ?: die('Connection failed: ' . $conn->connect_error);

    $query = '';
    $allResults = [];
    $sqlScript = file('../setup/db-setup.sql');
    if ($sqlScript){
        foreach ($sqlScript as $line) {
            $startWith  = substr(trim($line), 0 ,2);
            $endWith    = substr(trim($line), -1 ,1);
            
            if (empty($line) || $startWith == '--' || $startWith == '/*' || $startWith == '//') {
                continue;
            }
                
            $query = $query . $line;
            if ($endWith == ';') {
                $result = mysqli_query($conn, $query);
                $res = new stdClass();
                $res->query = $query;
                $res->result = $result;
                array_push($allResults, $res);
                $query = '';
            }
        }
        
        returnResponse($allResults, 1);
    } else {
        returnError('Unable to setup tables.');
    }
}


// KEY ENDPOINTS
function getKeys(){
    $user_id        = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $key_id         = isset($_GET['key_id']) ? $_GET['key_id'] : null;
    $decoded_keys   = isset($_GET['decoded']) && $_GET['decoded'] === 'true' ? 'game_key,' : '';

    if ($user_id === null){ returnError('No user id'); }

    $where = 'user_id='.$user_id;
    $where .= $key_id !== null ? 'AND key_id='.$key_id : '';

    $request = (object)[
        'statement' => 'SELECT',
        'table'     => databaseTables('keys'),
        // 'values'    => 'id, '.$decoded_keys.' game_id, redeemed',
        'values'    => 'id, '.$decoded_keys.' game_id, redeemed, game_key', // Remove game_key later
        'where'     => $where,
    ];

    $db_response = dbConnect($request);

    returnResponse($db_response, 1);
}

function keyUpdate($statement, $user_id, $keys_data){
    $keys_data  = isset($keys_data) && gettype($keys_data) === 'array' ? $keys_data : [];

    if (!isset($user_id) || $user_id === null){ returnError('Missing user id.'); }
    if (count($keys_data) === 0){ returnError('Missing key data.'); }
    if (!isset($statement) || $statement == ''){ returnError('Missing dd statement.'); }

    $valuesKeys = $statement === 'DELETE' ? ['user_id', 'id'] : ['game_id', 'game_key', 'user_id', 'redeemed'];
    $keyValues  = [];

    foreach ($keys_data as $key_data) {
        if ($statement === 'DELETE'){
            $newKeyValues = (object)[
                'user_id'   => $user_id,
                'id'  => $key_data
            ];
            array_push($keyValues, $newKeyValues);
        } else {
            try {
                $key_data = json_decode($key_data);
            } catch (Exception $e){}
    
            $game_id = isset($key_data->game_id) ? $key_data->game_id : null;
            $new_key = isset($key_data->key) ? $key_data->key : null;
    
            if ($game_id !== null && $new_key !== null && $new_key !== ''){
                $newKeyValues = (object)[
                    'game_id'   => $game_id,
                    'game_key'  => $new_key,
                    'user_id'   => $user_id,
                    'redeemed'  => 0
                ];
                array_push($keyValues, $newKeyValues);
            }
        }
    }

    if (count($keyValues) === 0) { returnError('Missing key data.'); }
    
    $request = (object)[
        'statement'     => $statement,
        'table'         => databaseTables('keys'),
        'values_keys'   => $valuesKeys,
        'values'        => $keyValues,
        'output'        => true,
    ];

    $db_response = dbConnect($request);

    returnResponse($db_response, 1);
}

function addKeys(){
    $user_id    = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $keys_data  = isset($_GET['keys_data']) && gettype($_GET['keys_data']) === 'array' ? $_GET['keys_data'] : [];
    keyUpdate('INSERT INTO', $user_id, $keys_data);
}

function deleteKeys(){
    $user_id    = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $keys_data  = isset($_GET['keys_data']) && gettype($_GET['keys_data']) === 'array' ? $_GET['keys_data'] : [];
    keyUpdate('DELETE', $user_id, $keys_data);
    return;
    

    if ($user_id === null){ returnError('Missing user id.'); }
    if (count($keys_data) === 0){ returnError('Missing key data.'); }

    $keyValues  = [];

    foreach ($keys_data as $key_data) {
        try {
            $key_data = json_decode($key_data);
        } catch (Exception $e){}

        $game_id = isset($key_data->game_id) ? $key_data->game_id : null;
        $new_key = isset($key_data->key) ? $key_data->key : null;

        if ($game_id !== null && $new_key !== null && $new_key !== ''){
            $newKeyValues = (object)[
                'game_id'   => $game_id,
                'game_key'  => $new_key,
                'user_id'   => $user_id,
                'redeemed'  => 0
            ];
            array_push($keyValues, $newKeyValues);
        }
    }
    
    $request = (object)[
        'statement'     => 'DELETE',
        'table'         => databaseTables('keys'),
        'values_keys'   => ['id', 'user_id'],
        'values'        => $keys_data,
        'output'        => true,
    ];

    $db_response = dbConnect($request);

    returnResponse($db_response, 1);
}

// GAMES INFO ENDPOINTS
function getGames(){
    $game_ids    = isset($_GET['game_ids']) && gettype($_GET['game_ids']) === 'array' ? $_GET['game_ids'] : null;
    if ($game_ids === null || count($game_ids) === 0){ returnError('No game ids passed'); }

    $where = '';

    foreach($game_ids as $index => $game_id){
        if ($index !== 0){
            $where .= ' OR ';
        }

        $where .= 'game_id='.$game_id;
    }

    $request = (object)[
        'statement' => 'SELECT',
        'table'     => databaseTables('games'),
        'where'     => $where,
    ];

    $db_response = dbConnect($request);

    returnResponse($db_response, 1);
}

function addGames(){
    if (!isset($_GET['games_data']) || gettype($_GET['games_data']) !== 'array'){ returnError('Missing games data'); }

    $value = [];
    foreach ($_GET['games_data'] as $gameData){
        try { $gameData = json_decode($gameData); } catch (Exception $e){}
        $game_id = isset($gameData->id) ? $gameData->id : null;
        $game_name = isset($gameData->name) ? $gameData->name : null;
        $game_type = isset($gameData->type) ? $gameData->type : null;
        if ($game_name === null || $game_type === null || $game_id === null){ returnError('Data not set properly'); }
        $newVal = (object)[
            'game_id'       => $game_id,
            'name'          => $game_name,
            'game_type_id'  => $game_type,
        ];
        array_push($value, $newVal);
    }

    $valuesKeys     = ['game_id', 'name', 'game_type_id'];
    $duplicateKeys  = ['name', 'game_type_id'];

    $request = (object)[
        'statement'         => 'INSERT INTO',
        'table'             => databaseTables('games'),
        'values_keys'       => $valuesKeys,
        'duplicate_keys'    => $duplicateKeys,
        'values'            => $value,
        'output'            => true,
    ];
    
    $db_response = dbConnect($request);

    returnResponse($db_response, 1);
}


// USER ACCOUNT ENDPOINTS
function userRegister(){
    $email      = isset($_GET['email']) ? filter_var($_GET['email'], FILTER_SANITIZE_EMAIL) : null;
    $username   = isset($_GET['username']) || $_GET['username'] == '' ? htmlspecialchars($_GET['username']) : null;
    $password   = isset($_GET['password']) || $_GET['password'] == '' ? md5($_GET['password']) : null;

    if ($email == null || $username == null || $password == null){ returnError('Missing required registration form data'); }


    $valuesKeys = ['email', 'username', 'password'];

    $values = [(object)[
        'email'     => $email,
        'username'  => $username,
        'password'  => $password,
    ]];

    $request = (object)[
        'statement'     => 'INSERT INTO',
        'table'         => databaseTables('users'),
        'values_keys'   => $valuesKeys,
        'values'        => $values,
        'output'        => true,
    ];

    $db_response = dbConnect($request);

    if (isset($db_response->id)){
        $db_response->username = $username;
    }

    returnResponse($db_response, 1);
}

function userLogin(){
    $login = isset($_GET['login']) || $_GET['login'] == '' ? htmlspecialchars($_GET['login']) : null;
    $password = isset($_GET['password']) || $_GET['password'] == '' ? md5($_GET['password']) : null;

    if ($login == null && $password == null){
        returnError('No login and password provided');
    } else if ($login == null){
        returnError('No email/username provided');
    } else if ($password == null){
        returnError('No password provided');
    }

    $request = (object)[
        'statement' => 'SELECT',
        'table'     => databaseTables('users'),
        'values'    => 'id, username',
        'where'     => 'password="'.$password.'" AND (username="'.$login.'" OR email="'.$login.'")',
        'limit'     => 1,
    ];
    $db_response = dbConnect($request);
    
    returnResponse($db_response, 1);
}

function userPasswordReset(){
    $email = isset($_GET['email']) ? $_GET['email'] : 'No email provided';
    
    $data = 'Endpoint not configured';

    returnResponse($data, 1);
}

return;
?>