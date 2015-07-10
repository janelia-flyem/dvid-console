import React from 'react';
import ServerStatus from './ServerStatus.react';
import ServerStats from './ServerStats.react';

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
        <h1>Admin</h1>
        <ServerStats/>
        <ServerStatus dvid={this.props.dvid}/>
      </div>
    );
  }
};

module.exports = Admin;
