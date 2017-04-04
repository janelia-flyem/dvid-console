import React from 'react';
import {Alert} from 'react-bootstrap';
import ErrorStore from '../stores/ErrorStore';
import ErrorActions from '../actions/ErrorActions';
import AltContainer from 'alt-container';

class ErrorMessage extends React.Component {
  render() {
    if (this.props.errors) {
      var message = 'Unknown error ocured';

      if (this.props.errors.hasOwnProperty('message')) {
        message = this.props.errors.message;
      } else {
        message = this.props.errors;
      }

      return (
        <div className="fixed_alert">
          <Alert bsStyle='danger' onDismiss={this.handleDismiss.bind(this)}>
            <p>{message}</p>
          </Alert>
        </div>
      );
    }

    return (
      <div></div>
    );
  }

  handleDismiss() {
    ErrorActions.clear();
  }
}

class Error extends React.Component {
  render() {
    return (
      <AltContainer store={ErrorStore}>
        <ErrorMessage />
      </AltContainer>
    );
  }

};

module.exports = Error;
