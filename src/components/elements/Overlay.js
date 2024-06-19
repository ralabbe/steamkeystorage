import React from 'react';

class Overlay extends React.Component {
    render(){
        return(
            <div></div>
        )
    }
}

export function activateOverlay(func, closeOnClick) {
    closeOnClick = closeOnClick ? closeOnClick : true;
    if (!document.querySelector('#overlayBG')){
        var div = document.createElement('div');
        div.id = 'overlayBG';
        if (closeOnClick === true){
            div.addEventListener('click', function(){
                var overlay = document.querySelector('#overlayBG');
                overlay.parentNode.removeChild(overlay);
            });
        }
        document.querySelector('body').append(div);
        document.querySelector('#overlayBG').classList.add('activeOverlay');
    }

    if (func){
        document.querySelector('#overlayBG').addEventListener('click', function(){
            func();
        });
    }
}

export function closeOverlay() {
    var overlay = document.querySelector('#overlayBG');
    if (overlay){
        overlay.parentNode.removeChild(overlay);
    }
}

export default Overlay;