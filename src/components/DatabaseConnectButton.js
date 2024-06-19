import React from 'react';
import axios from 'axios';

class DatabaseConnectButton extends React.Component {
    state = {
        test: {},
    }

    buttonClickTest = () => {

        const awaitTest = async () => {
            const response = await axios.get( 'http://localsteam.local/steam-key-storage/src/apis/db-connect.php', {
                params: {
                    'user_id': 3,
                }
            } ).catch( e => {console.log(e)} );
            this.setState({ test: response.data });
        }
        awaitTest();
        
    }

    render(){
        console.log(this.state.test);
        return (
            <div style={{textAlign: 'center', marginTop: '20px'}}> <button value="test" onClick={this.buttonClickTest}>Test</button> </div>
        )
    }
}

export default DatabaseConnectButton;