import React from 'react';
import { Translate } from '../Translate.js';

class SearchBar extends React.Component {
    state = {
        errorMesage: '',
        search: '',
    }

    onFormSubmit = event => {
        event.preventDefault();
        this.props.onSearch(this.state.search);
    }

    onInputChange = event => {
        this.setState({ search: event.target.value });
        this.props.onSearch(event.target.value);
    }

    searchbarIcon = () => {
        if(this.state.search === ''){
            return <i className="fas fa-search inputIcon"></i>;
        } else {
            return <i className="fas fa-search inputIcon"></i>;
        }
    }

    render() {
        return (
            <form className="searchBar inputIconWrapper" onSubmit={this.onFormSubmit}>
                <label className="positionAbsolute"> {Translate('Search Games')} </label>
                <input
                    type="text"
                    value={this.state.search}
                    className="field"
                    onChange={this.onInputChange}
                    placeholder={Translate('Search Games')}
                />
                {this.searchbarIcon()}
            </form>
        );
    }
}

export default SearchBar;