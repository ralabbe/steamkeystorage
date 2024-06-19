import React from 'react';

const dictionary = {
    'App Initialization': {
        'en': 'App Initialization',
        'es': 'Inicialización de la Aplicación'
    },
    'An Error Occurred': {
        'en': 'An Error Occurred',
        'es': 'Ocurrió Un Error'
    },
    'Connetion to the database could not be established.': {
        'en': 'Connetion to the database could not be established.',
        'es': 'No se pudo establecer la conexión a la base de datos.'
    },
    'Please set up the settings.php file in the base directory prior to initialization.': {
        'en': 'Please set up the settings.php file in the base directory prior to initialization.',
        'es': 'Configure el archivo settings.php en el directorio base antes de la inicialización.'
    },
    'Click below to set up the Steam key app.': {
        'en': 'Click below to set up the Steam key app.',
        'es': 'Haga clic a continuación para configurar la aplicación Steam key.'
    },
    'Initilize': {
        'en': 'Initilize',
        'es': 'Inicializar'
    },
    'Importing Games': {
        'en': 'Importing Games',
        'es': 'Importación de Juegos'
    },
    'Games Imported': {
        'en': 'Games Imported',
        'es': 'Juegos importados'
    },
    'Tables Created': {
        'en': 'Tables Created',
        'es': 'Tablas Creadas'
    },
    'Populate Database': {
        'en': 'Populate Database',
        'es': 'Rellenar La Base De Datos'
    },
    'Click below to pouplate the database tables.': {
        'en': 'Click below to pouplate the database tables.',
        'es': 'Haga clic a continuación para mostrar las tablas de la base de datos.'
    },
    'Complete': {
        'en': 'Complete',
        'es': 'Completa'
    },
    'Register': {
        'en': 'Register',
        'es': 'Registrar'
    },
    'Login': {
        'en': 'Login',
        'es': 'Enviar'
    },
    'Username': {
        'en': 'Username',
        'es': 'Nombre de usuario'
    },
    'Password': {
        'en': 'Password',
        'es': 'Contraseña'
    },
    'Email': {
        'en': 'Email',
        'es': 'Correo Electrónico'
    },
    'There was an error registering your account.': {
        'en': 'There was an error registering your account.',
        'es': 'Hubo un error al registrar su cuenta.'
    },
    'The username and email are already in use.': {
        'en': 'The username and email are already in use.',
        'es': 'El nombre de usuario y el correo electrónico ya están en uso.'
    },
    'The email is already in use.': {
        'en': 'The email is already in use.',
        'es': 'El correo electrónico ya está en uso.'
    },
    'The username is already in use.': {
        'en': 'The username is already in use.',
        'es': 'El nombre de usuario ya está en uso.'
    },
    'The email and password combination is incorrect.': {
        'en': 'The email and password combination is incorrect.',
        'es': 'La combinación de correo electrónico y contraseña es incorrecta.'
    },
    'Logout': {
        'en': 'Logout',
        'es': 'Cerrar Sesion'
    },
    'Account': {
        'en': 'Account',
        'es': 'Cuenta'
    },
    'Settings': {
        'en': 'Settings',
        'es': 'Configuracións'
    },
    'Key': {
        'en': 'Key',
        'es': 'Clave'
    },
    'Keys': {
        'en': 'Keys',
        'es': 'Claves'
    },
    'Show key': {
        'en': 'Show key',
        'es': 'Mostrar clave'
    },
    'New key': {
        'en': 'New key',
        'es': 'Nuevo clave'
    },
    'Search Games': {
        'en': 'Search Games',
        'es': 'Buscar juegos'
    },
    'Add': {
        'en': 'Add',
        'es': 'Agregar'
    },
    'Add key': {
        'en': 'Add key',
        'es': 'Agregar clave'
    },
    'Add a key': {
        'en': 'Add a key',
        'es': 'Agregar una clave'
    },
    'Game': {
        'en': 'Game',
        'es': 'Juego'
    },
    'DLC': {
        'en': 'DLC',
        'es': 'DLC'
    },
    'Music': {
        'en': 'Music',
        'es': 'Música'
    },
    'Your user information is incorrect. Please sign out and sign back in.': {
        'en': 'Your user information is incorrect. Please sign out and sign back in.',
        'es': 'Tu información de usuario es incorrecta. Por favor cierre sesión y vuelva a iniciar sesión.'
    },
    'The key you entered is not the correct format.': {
        'en': 'The key you entered is not the correct format.',
        'es': 'La clave que ingresó no tiene el formato correcto.'
    },
    'Please select a game from the dropdown.': {
        'en': 'Please select a game from the dropdown.',
        'es': 'Selecciona un juego del menú desplegable.'
    },
    'There was an error adding your key.': {
        'en': 'There was an error adding your key.',
        'es': 'Hubo un error al agregar su clave.'
    },
    'Missing key data.': {
        'en': 'Missing key data.',
        'es': 'No hay datos clave.'
    },
    'Missing user id.': {
        'en': 'Missing user id.',
        'es': 'Falta el ID de usuario.'
    },
    'Mark': {
        'en': 'Mark',
        'es': 'Marca'
    },
    'Redeemed': {
        'en': 'Redeemed',
        'es': 'Redimido'
    },
    'Unredeemed': {
        'en': 'Unredeemed',
        'es': 'No redimido'
    },

}

export function Translate(string) {
    const lang = process.env.REACT_APP_LANG ? process.env.REACT_APP_LANG : 'en';

    if (dictionary[string] && dictionary[string][lang] && dictionary[string][lang] !== ''){
        return dictionary[string][lang];
    } else {
        return string;
    }
}


class TranslationDefault extends React.Component {
    render(){ return; }
}

export default TranslationDefault;