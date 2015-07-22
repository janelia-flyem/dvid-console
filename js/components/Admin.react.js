import React from 'react';
import ServerStatus from './ServerStatus.react';
import ServerStats from './ServerStats.react';
import ServerTypes from './ServerTypes.react';

class Admin extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {
    return;
  }

  componentWillUnmount() {
    return;
  }

  render() {
    return (
      <div>
        <h1>Server Stats</h1>
        <ServerStats/>
        <ServerStatus/>
        <ServerTypes/>
      </div>
    );
  }
};

module.exports = Admin;
