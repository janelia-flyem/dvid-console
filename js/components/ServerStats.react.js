import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';


class StatsDisplay extends React.Component {
  render() {
    if (this.props.stats && this.props.repos) {
      return (
        <div className="serverstats">
          <p>Cores: {this.props.stats.Cores}</p>
          <p>Repos: {Object.keys(this.props.repos).length}</p>
          <p>Uptime: {this.props.stats['Server uptime'].split('.', 1) + 's'}</p>
          <p>Version Nodes: </p>
        </div>
      );
    }

    return (
      <div className="serverstats"></div>
    );
  }
}


class ServerStats extends React.Component {

  componentDidMount() {
    ServerActions.fetch();
    ServerActions.fetchStats();
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <StatsDisplay/>
      </AltContainer>
    );
  }
};

module.exports = ServerStats;
