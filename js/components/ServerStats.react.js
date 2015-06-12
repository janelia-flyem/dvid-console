var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link;

var ServerStats = React.createClass({
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
      <div className="serverstats">
        <p>Cores: </p>
        <p>Repos: </p>
        <p>Uptime: </p>
        <p>Open Nodes: </p>
      </div>
    );
  }
});

module.exports = ServerStats;
