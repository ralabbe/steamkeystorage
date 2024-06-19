import React from 'react';
import ReactDOM from 'react-dom';
import CloseButton from './CloseButton.js';
import { activateOverlay, closeOverlay } from './Overlay.js';

class Popup extends React.Component {
    render(){
        return <React.Fragment></React.Fragment>;
    }
}

// Close button functionality
export function closePopup(id){
    var popupID = document.querySelector('#' + id);

    if (popupID){ popupID.classList.add('popupInit'); } // Fade out
    document.querySelector('body').classList.remove('activePopup'); // Remove fixed body

    setTimeout(() => {
        if (popupID){ popupID.parentNode.removeChild(popupID); } // Remove popup
    
        // Close overlay
        if (!document.querySelector('#sidebarWrapper') || !document.querySelector('#sidebarWrapper').classList.contains('active')){
            closeOverlay();
        }
    
    }, 300);
}

// Contents to go inside popup + close button
const popupContents = (id, contents) => {
    return (
        <div className="appPopupContent borderedContainerContent">
            <CloseButton clickFunc={ () => { closePopup(id) } } />
            {contents}
        </div>
    );
}

// Popup activate function
export function activatePopup(id, contents) {
    if (!document.querySelector('#' + id)){
        var div = document.createElement('div');
        div.id = id;
        div.classList.add('popupInit');
        div.classList.add('appPopup');
        div.classList.add('borderedContainer');
        document.querySelector('body').classList.add('activePopup');

        document.querySelector('#root').append(div);
        setTimeout(() => {
            document.querySelector('#' + id).classList.remove('popupInit');
        }, (10));
    }

    ReactDOM.render(popupContents(id, contents), document.querySelector('#' + id));

    // Focus on the second focusable element in the popup (the first is the close button)
    document.querySelector('#' + id).querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[1].focus();
    
    activateOverlay(() => { closePopup(id) }, true);
}

export default Popup;