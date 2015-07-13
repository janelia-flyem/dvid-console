import React from 'react';
import Router from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';
import RepoDAG from './RepoDAG.react.js';
import DataInstances from './DataInstances.react.js';
import RepoLog from './RepoLog.react.js';
import RepoMeta from './RepoMeta.react.js';


class RepoDetails extends React.Component {
  render() {
    if (this.props.repos && this.props.repos.hasOwnProperty(this.props.uuid)) {
      var repo = this.props.repos[this.props.uuid];
      var span = null;

      if (repo.Log.length > 1) {
        var oldest = moment(repo.Log[0].split(' ', 1)[0]);
        var newest = moment(repo.Log[repo.Log.length -1].split(' ', 1)[0]);
        var span = 'covering ' + moment.duration(newest.diff(oldest)).humanize();
      }

      return (
        <div>
          <RepoMeta repo={repo}/>

          <div className="row">
            <div className="col-sm-6">
              <p><b>Log:</b></p>
            </div>
            <div className="col-sm-6 text-right">
              <p>{repo.Log.length} entries {span}</p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <RepoLog log={repo.Log}/>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <RepoDAG dag={repo.DAG}/>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <DataInstances repo={repo}/>
            </div>
          </div>

        </div>
      );
    }

    return (
      <div></div>
    );
  }
}


class Repo extends React.Component {
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    return (
      <AltContainer store={ServerStore} >
        <RepoDetails uuid={this.props.params.uuid}/>
      </AltContainer>
    );
  }
}

module.exports = Repo;
