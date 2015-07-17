import React from 'react';
import Router from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import RepoDAG from './RepoDAG.react';
import InstanceSelect from './InstanceSelect.react';
import RepoLog from './RepoLog.react';
import RepoMeta from './RepoMeta.react';


class RepoDetails extends React.Component {
  render() {
    if (this.props.repos && this.props.repos.hasOwnProperty(this.props.uuid)) {
      var repo = this.props.repos[this.props.uuid];

      return (
        <div>
          <RepoMeta repo={repo}/>

          <RepoLog log={repo.Log}/>

          <div className="row">
            <div className="col-sm-12">
              <RepoDAG repo={repo}/>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <InstanceSelect repo={repo}/>
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
