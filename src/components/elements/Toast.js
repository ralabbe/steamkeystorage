import React from 'react';
import { Translate } from '../Translate.js';

class Toast extends React.Component {
    render(){
        if (this.props.message !== ''){
            return (
                <div className={'toast ' + this.props.type}><i className="fas fa-exclamation-circle"></i> {Translate(this.props.message)}</div> 
            );
        } else {
            return '';
        }
    }
}

Toast.defaultProps = {
    message: '',
    type: 'success'
}

export default Toast;