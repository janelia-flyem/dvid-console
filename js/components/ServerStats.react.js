var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link;

var ServerStats = React.createClass({
  getInitialState: function() {
    return {
      serverInfo: {}
    };
  },

  // this gets called after the first time the component is loaded into the page.
  componentDidMount: function () {
    var self = this;
    // fetch the stats
    this.props.dvid.serverInfo({
      callback: function(data) {
        if (self.isMounted()) {
          self.setState({
            serverInfo: data
          });
        }
      }.bind(this),
      error: function (err) {
        console.log(err);
      }
    });
    return;
  },

  componentWillUnmount: function () {
    return;
  },

  render: function () {
    return (
      <div className="serverstats">
        <p>Cores: {this.state.serverInfo.Cores}</p>
        <p>Repos: </p>
        <p>Uptime: {this.state.serverInfo["Server uptime"]}</p>
        <p>Open Nodes: </p>
      </div>
    );
  }
});

module.exports = ServerStats;
