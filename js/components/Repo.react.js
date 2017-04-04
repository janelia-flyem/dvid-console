import React from 'react';
import {Router, Link} from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt-container';
import RepoDAG from './RepoDAG.react';
import InstanceSelect from './InstanceSelect.react';
import RepoLog from './RepoLog.react';
import RepoMeta from './RepoMeta.react';
import RepoGraph from './RepoGraph.react';


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

          <RepoLog log={repo.Log} uuid={this.props.uuid}/>

          <div className="row">
            <div className="col-sm-12">
              {/*<RepoDAG repo={repo} uuid={this.props.uuid}/>*/}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <InstanceSelect repo={repo} uuid={this.props.uuid}/>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <RepoGraph repo={repo} uuid={this.props.uuid}/>
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
  refreshServerStore(props){
    //get data upfront to avoid multiple cascading rerenders
    ServerActions.fetchTypes();
    ServerActions.fetch({uuid: props.params.uuid});
    ServerActions.fetchMaster({uuid: props.params.uuid});
    ServerActions.fetchDefaultInstances({uuid: props.params.uuid});
  }
  componentWillMount() {
    this.refreshServerStore(this.props)
  }

  componentWillUpdate(nextProps, nextState){
    this.refreshServerStore(nextProps)

  }

  render() {
    return (
      <AltContainer store={ServerStore} >
        <RepoDetails />
      </AltContainer>
    );
  }
}

module.exports = Repo;
