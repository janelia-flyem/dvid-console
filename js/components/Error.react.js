import React from 'react';
import {Alert} from 'react-bootstrap';
import ErrorStore from '../stores/ErrorStore';
import ErrorActions from '../actions/ErrorActions';
import AltContainer from 'alt/AltContainer';

class ErrorMessage extends React.Component {
  render() {
    if (this.props.errors.length) {
      return (
        <Alert bsStyle='danger' onDismiss={this.handleDismiss.bind(this)}>
          <h4>Error Message</h4>
          <p>{this.props.errors[0]}</p>
        </Alert>
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
