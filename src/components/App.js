import React from 'react';
import { appInitStatusCheck } from './CustomHooks.js';
import LoadSpinner from './elements/LoadSpinner.js';
import AppStart from './AppStart.js';
import AppInit from './AppInit.js';
import { Translate } from './Translate.js';

class App extends React.Component {
    state = {
        appInit: null,
        spinner: '',
        errFade: ' fadeUpInit',
        errMessage: '',
    }

    componentDidMount(){
        // Show loader if init status check takes longer than 500 milliseconds
        setTimeout(() => {
            if (this.state.spinner === ''){
                this.setState({
                    spinner: <LoadSpinner size="large" />
                });
            }
        }, 500);
        // Check init status and set. Fade loader out if needed
        appInitStatusCheck((response) => {
            var status = response ? response : 'error';
            
            if (this.state.spinner !== ''){
                this.setState({
                    spinner: <LoadSpinner size="large" fadeOut="true" />
                });
                setTimeout(() => {
                    this.setState({ appInit: status });
                    if (status === 'error' || status === -1){
                        var errMessage = status === -1 ? 'Connetion to the database could not be established.' : '';
                        setTimeout(() => {
                            this.setState({
                                errFade: '',
                                errMessage: errMessage,
                            });
                        }, 400);
                    }
                }, 400);
            } else {
                this.setState({ appInit: status });
            }
        });
    }

    render() {
        if (this.state.appInit === -1 || this.state.appInit === 'error'){ // App is checking init
            return (
                <div className="fullScreenContainer flexCenter">
                    <div id="appInitContainer" className={'borderedContainer textAlignCenter fadeUp' + this.state.errFade}>
                        <div className="borderedContainerContent flexCenter">
                            <div className="iconBGWrapper"><i className="fas fa-database iconBG" aria-hidden="true"></i></div>
                            <div>
                                <h2 style={{marginBottom: '0'}}>{Translate('An Error Occurred')}</h2>
                                <p>{Translate(this.state.errMessage)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (this.state.appInit === '1'){
            return <AppStart />;
        } else if (this.state.appInit === '0'){
            return <AppInit />;
        } else {
            return <div className="fullScreenContainer flexCenter"> {this.state.spinner} </div>;
        }
    };
};

export default App;