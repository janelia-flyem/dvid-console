var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link,
  ServerStatus = require('./ServerStatus.react');
  ServerStats = require('./ServerStats.react');


var Admin = React.createClass({
  getInitialState: function() {
    return {
    };
  },

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount: function () {
    return;
  },

  componentWillUnmount: function () {
    return;
  },

  render: function () {
    return (
      <div>
        <h1>Admin</h1>
        <ServerStats dvid={this.props.dvid}/>
        <ServerStatus dvid={this.props.dvid}/>
      </div>
    );
  }
});

module.exports = Admin;
