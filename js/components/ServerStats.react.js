import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';


class StatsDisplay extends React.Component {
  render() {
    if (this.props.stats && this.props.repos) {
      var versionNodes = 0;

      for (var key in this.props.repos) {
        if (this.props.repos.hasOwnProperty(key)) {
          var repo = this.props.repos[key];
          versionNodes += Object.keys(repo.DAG.Nodes).length;
        }
      }

      return (
        <div className="serverstats row">
          <div className="col-sm-2">
            <button className="btn btn-primary btn-large">Cores <span className="badge">{this.props.stats.Cores}</span></button>
          </div>
          <div className="col-sm-2 col-sm-offset-1">
            <button className="btn btn-primary btn-large">Repos <span className="badge">{Object.keys(this.props.repos).length}</span></button>
          </div>
          <div className="col-sm-2 col-sm-offset-1">
            <button className="btn btn-primary btn-large">Uptime <span className="badge"> {this.props.stats['Server uptime'].split('.', 1) + 's'}</span></button>
          </div>
          <div className="col-sm-2 col-sm-offset-1">
            <button className="btn btn-primary btn-large">Version Nodes <span className="badge">{versionNodes}</span></button>
          </div>
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
