import React from 'react';
import {Router, Link} from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import RepoDAG from './RepoDAG.react';
import InstanceSelect from './InstanceSelect.react';
import RepoLog from './RepoLog.react';
import RepoMeta from './RepoMeta.react';


class RepoDetails extends React.Component {
  render() {
    if (this.props.repo) {
      var repo = this.props.repo;

      return (
        <div>
          <ol className="breadcrumb">
            <li><Link to="consoleapp">Home</Link></li>
            <li className="active">Repo</li>
          </ol>
          <RepoMeta repo={repo} uuid={this.props.uuid}/>

          <RepoLog log={repo.Log}/>

          <div className="row">
            <div className="col-sm-12">
              <RepoDAG repo={repo} uuid={this.props.uuid}/>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <InstanceSelect repo={repo} uuid={this.props.uuid}/>
            </div>
          </div>

        </div>
      );
    }

    return (
      <div>
        <ol className="breadcrumb">
          <li><Link to="consoleapp">Home</Link></li>
          <li className="active">Repo</li>
        </ol>
        <RepoMeta repo={repo} uuid={this.props.uuid}/>
      </div>
    );
  }
}


class Repo extends React.Component {
  componentDidMount() {
    ServerActions.fetch(this.props.params.uuid);
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
