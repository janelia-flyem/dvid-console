import React from 'react';
import {Alert} from 'react-bootstrap';

class Error extends React.Component {
  constructor() {
    super();
    this.state = {"visible": true};
  }

  render() {
    if (this.state.visible) {
      return (
        <Alert bsStyle='danger' onDismiss={this.handleDismiss.bind(this)}>
          <h4>Error Message</h4>
          <p>More information about the error</p>
        </Alert>
      );
    }

    return (
      <div></div>
    );

  }

  handleDismiss() {
    this.setState({"visible": false});
  }
};

module.exports = Error;
