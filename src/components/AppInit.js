import React from 'react';
import LoadSpinner from './elements/LoadSpinner.js';
import { Translate } from './Translate.js';
import { databaseSetup } from '../apis/database-hooks.js';
import { addGamesToDatabase, appInitTableSetup } from './CustomHooks.js';
import gameSetupFile from '../data/steamapp_game.json';
import dlcSetupFile from '../data/steamapp_dlc.json';
// import gameSetupFile from '../data/steamapp_gameTest.json';
// import dlcSetupFile from '../data/steamapp_dlcTest.json';
import './AppInit.css';

class AppInit extends React.Component {
    state = {
        initStart: false,
        fade: ' fadeUpInit',
        loader: false,
        currentStep: 'start',

        stepDatabaseConnection: false,
        serverUri: '',
        serverUsername: '',
        serverPassword: '',
        databaseName: '',

        dataAddLimit: 50,
        tablesCreated: false,
        totalGameCount: null,
        currentGameCount: 0,
        totalDlcCount: null,
        currentDlcCount: 0,
    }

    

    componentDidMount(){
        var gameCount = gameSetupFile && typeof gameSetupFile === 'object' ? Object.keys(gameSetupFile).length : 0;
        var dlcCount = dlcSetupFile && typeof dlcSetupFile === 'object' ? Object.keys(dlcSetupFile).length : 0;
        setTimeout(() => {
            this.setState({
                fade: '',
                totalGameCount: gameCount,
                totalDlcCount: dlcCount
            });
        }, 400);
    }

    changeStep = (step) => { // Reset fade and change step
        this.setState({ fade: ' fadeUpInit' });
        setTimeout(() => {
            this.setState({
                currentStep: step,
                fade: ''
            });
        }, 400);
    }

    populateGameTable = () => {
        var gamesToAdd = [];

        for (var i = this.state.currentGameCount; i < this.state.totalGameCount; i++){
            gamesToAdd.push(gameSetupFile[i].appid);
            if (gamesToAdd.length === this.state.dataAddLimit){
                break;
            }
        }

        addGamesToDatabase(gamesToAdd, (response) => {
            if (response && response.status && response.status === 1){
                const newCount = this.state.currentGameCount + gamesToAdd.length;
                this.setState({
                    currentGameCount: newCount,
                    loader: true
                });
    
                if (this.state.currentGameCount< this.state.totalGameCount){
                    this.populateGameTable();
                }
            } else {
                console.log(response);
            }
        });
    }

    
    populateDlcTable = () => {
        var dlcToAdd = [];

        for (var i = this.state.currentDlcCount; i < this.state.totalDlcCount; i++){
            dlcToAdd.push(dlcSetupFile[i].appid);
            if (dlcToAdd.length === this.state.dataAddLimit){
                break;
            }
        }
        
        addGamesToDatabase(dlcToAdd, (response) => {
            if (response && response.status && response.status === 1){
                const newCount = this.state.currentDlcCount + dlcToAdd.length;
                const loader = this.state.totalDlcCount === newCount ? false : true;
                this.setState({
                    currentDlcCount: newCount,
                    loader: loader
                });

                if (newCount < this.state.totalDlcCount){
                    this.populateDlcTable();
                }
            } else {
                console.log(response);
            }
        });
    }

    renderStepInitStart = () => {
        return (
            <React.Fragment>
                <h2>{Translate('App Initialization')}</h2>
                <p>{Translate('Please set up the settings.php file in the base directory prior to initialization.')}</p>
                <p>{Translate('Click below to set up the Steam key app.')}</p>
                <button className="submitBtn" onClick={ () => { this.changeStep('databaseConnection'); } } >{Translate('Initilize')}</button>
            </React.Fragment>
        );
    }

    renderStepDatabaseConnection = () => {
        if (this.state.tablesCreated === false){
            appInitTableSetup((response) => {
                console.log(response);
                this.setState({ tablesCreated: true });
            });
        }
        
        if (this.state.tablesCreated === true){
            return (
                <React.Fragment>
                    <h2>{Translate('Tables Created')}</h2>
                    <p>{Translate('Click below to pouplate the database tables.')}</p>
                    <button className="submitBtn" onClick={ () => { this.changeStep('populateDatabase'); } } >{Translate('Populate Database')}</button>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    Test
                </React.Fragment>
            );
        }
    }

    renderStepPopulateDatabase = () => {
        var gamesProgress = '';
        var dlcProgress = '';
        

        if (this.state.totalGameCount !== null && this.state.totalGameCount !== 0){
            if (this.state.currentGameCount === 0){
                this.populateGameTable();
            }

            const gamesPercent = this.state.totalGameCount ? (this.state.currentGameCount * 100) / this.state.totalGameCount : 0;
            const gamesImported = this.state.currentGameCount === this.state.totalGameCount ? true: false;

            var gamesImportText = Translate('Importing Games');
            var gameProgressStripes = ' progressStripes';
            if (gamesImported === true){
                gamesImportText = <React.Fragment>{Translate('Games Imported')} <i className="fas fa-check popIn"></i></React.Fragment>;
                gameProgressStripes = '';
            }

            gamesProgress = (
                <React.Fragment>
                    <label style={{fontWeight: 'bold'}}>{gamesImportText}</label>
                    <small className="progressBarCount"><strong>{this.state.currentGameCount}</strong> out of <strong>{this.state.totalGameCount}</strong> imported {gamesImported === true ? <span className="processCompleteMessage">{Translate('Complete')}!</span> : '' }</small>
                    <div className="progressBarWrapper"><div className={'progressBar' + gameProgressStripes} style={{ width: gamesPercent + '%' }}></div></div>
                </React.Fragment>
            );
        }

        if (this.state.totalGameCount === this.state.currentGameCount && this.state.totalDlcCount !== null && this.state.totalDlcCount !== 0){ // If game setup is complete, add dlc
            if (this.state.currentDlcCount === 0){ // If dlc count is set and not 0
                console.log('before populate dlc');
                this.populateDlcTable();
            }

            if (this.state.totalDlcCount !== null && this.state.totalDlcCount !== 0){
                const gamesPercent = this.state.totalDlcCount ? (this.state.currentDlcCount * 100) / this.state.totalDlcCount : 0;
                const dlcImported = this.state.currentDlcCount === this.state.totalDlcCount ? true : false;
                
                var dlcImportText = Translate('Importing DLC');
                var dlcProgressStripes = ' progressStripes';
                if (dlcImported === true){
                    dlcImportText = <React.Fragment>{Translate('DLC Imported')} <i className="fas fa-check popIn"></i></React.Fragment>;
                    dlcProgressStripes = '';
                }
    
                dlcProgress = (
                    <React.Fragment>
                        <label style={{fontWeight: 'bold'}}>{dlcImportText}</label>
                        <small className="progressBarCount"><strong>{this.state.currentDlcCount}</strong> out of <strong>{this.state.totalDlcCount}</strong> imported {dlcImported === true ? <span className="processCompleteMessage">{Translate('Complete')}!</span> : '' }</small>
                        <div className="progressBarWrapper"><div className={'progressBar' + dlcProgressStripes} style={{ width: gamesPercent + '%' }}></div></div>
                    </React.Fragment>
                );
            }
        }
        
        return (
            <React.Fragment>
                {gamesProgress}
                {dlcProgress}
            </React.Fragment>
        );
    }

    renderSteps = () => {
        return (
            <React.Fragment>
                
            </React.Fragment>
        )
    }
    
    renderInitComplete = () => {
        return(
            <div>test</div>
        )
    }

    render(){
        var page = this.renderStepInitStart;
        if (this.state.currentStep === 'databaseConnection'){
            page = this.renderStepDatabaseConnection;
        } else if (this.state.currentStep === 'populateDatabase'){
            page = this.renderStepPopulateDatabase;
        } else if (this.state.currentStep === 'initComplete'){
            page = this.renderInitComplete;
        }

        const loader = this.state.loader === true ? <LoadSpinner size="xsmall" location="top right" /> : '';

        return (
            <div className="fullScreenContainer flexCenter">
                <div id="appInitContainer" className={'borderedContainer textAlignCenter fadeUp' + this.state.fade}>
                    <div className="borderedContainerContent">
                        <div className="iconBGWrapper"><i className="fas fa-database iconBG" aria-hidden="true"></i></div>
                        {loader}
                        {page()}
                    </div>
                </div>
            </div>
        );
    }
}

export default AppInit;