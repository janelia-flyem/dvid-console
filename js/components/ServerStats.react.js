import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import {Glyphicon} from 'react-bootstrap';


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
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="tasks"/> DVID CPU Cores</div>
              <div className="panel-body">
                {this.props.stats.Cores}
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="folder-open"/> Repositories</div>
              <div className="panel-body">
                {Object.keys(this.props.repos).length}
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="time"/> Server Uptime</div>
              <div className="panel-body">
                {this.props.stats['Server uptime'].split('.', 1) + 's'}
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="tags"/> Version Nodes</div>
              <div className="panel-body">
                {versionNodes}
              </div>
            </div>
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
