import React from 'react';
import { Translate } from '../Translate.js';

class Button extends React.Component {
    render() {
        return (
            <button type="button" className="actionButton" aria-label={Translate(this.props.label)} label={Translate(this.props.label)} id={this.props.id} onClick={this.props.clickFunc} >
                <i className={this.props.icon}></i> {Translate(this.props.text)}
            </button>
        );
    }
}

Button.defaultProps = {
    icon: 'fas fa-cog',
    text: '',
    label: '',
    id:   '',
    clickFunc: null,
}

export default Button;