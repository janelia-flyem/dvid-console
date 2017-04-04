import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt-container';
import {Glyphicon} from 'react-bootstrap';
import pjson from '../../package.json';


class StatsDisplay extends React.Component {
  render() {
    if (this.props.stats && this.props.repos) {
      var versionNodes = 0;

      for (var key in this.props.repos) {
        if (this.props.repos.hasOwnProperty(key)) {
          var repo = this.props.repos[key];
          if (repo) {
            versionNodes += Object.keys(repo.DAG.Nodes).length;
          }
        }
      }

      var dvidVersion = 'unknown';
      var gitLink = "https://github.com/janelia-flyem/dvid/";

      if (this.props.stats.hasOwnProperty("DVID Version")) {
        dvidVersion = this.props.stats["DVID Version"];
        // strip of trailing version information like -dirty or -alpha, so that
        // we can link back to github without it being a broken link.
        gitLink += "commit/" + dvidVersion.replace(/-.*$/,'');
      }


      return (
        <div className="serverstats row">
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="tasks"/> DVID CPU Cores</div>
              <div className="panel-body">
                {this.props.stats.Cores} <small>out of {this.props.stats["Maximum Cores"]}</small>
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
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="bookmark"/> DVID Version</div>
              <div className="panel-body smaller">
                <a href={gitLink}>{dvidVersion}</a>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="hdd"/> Storage Backend</div>
              <div className="panel-body smaller">
              {this.props.stats["Storage backend"]}
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="bookmark"/> Datastore Version</div>
              <div className="panel-body">
              {this.props.stats["Datastore Version"]}
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading"><Glyphicon glyph="bookmark"/>Console Version</div>
              <div className="panel-body">
              <p>v{pjson.version}</p>
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
