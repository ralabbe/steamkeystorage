import React from 'react';

class LoadSpinner extends React.Component {
    state = {
        init: ' fadeInInit'
    }

    componentDidMount(){
        setTimeout(() => {
            this.setState({ init: '', });
        }, 100);
    }

    render(){
        var fade    = this.props.fadeOut && this.props.fadeOut === 'true' ? ' fadeInInit' : this.state.init;
        var classes = "loadSpinner fadeIn" + fade;
        var locationProp = this.props.location ? this.props.location.toLowerCase() : '';

        var size = this.props.size === 'small' ? ' smSpinner' : '';
            size = this.props.size === 'xsmall' ? ' xsmSpinner' : size;
            size = this.props.size === 'large' ? ' lgSpinner' : size;

        var location = locationProp === 'top right' ? ' spinnerTopRight ' : '';
            location = locationProp === 'top left' ? ' spinnerTopLeft ' : location;
            location = locationProp === 'bottom right' ? ' spinnerBottomRight ' : location;
            location = locationProp === 'bottom left' ? ' spinnerBottomLeft ' : location;

        return <div className={classes + size + location}></div>
    }
}

LoadSpinner.propDefaults = {
    size: '',
    location: '',
    fadeOut: false
}

export default LoadSpinner;