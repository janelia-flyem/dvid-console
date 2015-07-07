import React from 'react';

class Error extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    return;
  }

  render() {
    return (
      <div className="alert alert-danger" role="alert">...</div>
    );
  }
};

module.exports = Error;
