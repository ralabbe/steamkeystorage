import React from 'react';
import './CloseButton.css';

class CloseButton extends React.Component {
    render(){
        if (this.props.clickFunc){
            return <button className="closeButton" onClick={this.props.clickFunc}><i className="fas fa-times-circle"></i></button>
        } else {
            return;
        }
    }
}

export default CloseButton;