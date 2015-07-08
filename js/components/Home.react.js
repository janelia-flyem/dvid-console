import React from 'react';
import Router from 'react-router';

class Home extends React.Component {

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {
    return;
  }

  render() {
    return (
      <div>
        <h1>Repositories</h1>
      </div>
    );
  }
}

module.exports = Home;
