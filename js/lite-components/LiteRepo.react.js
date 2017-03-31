import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import ErrorActions from '../actions/ErrorActions';
import RepoTabs from '../lite-components/RepoTabs.react.js';

class LiteRepo extends React.Component {

  componentDidMount(){
    this.onUpdate();
  }
  componentDidUpdate(preProps, prevState){
    this.onUpdate();
  }

  onUpdate(){
    if(this.props.repos){
      var rootId = ServerStore.getRepoRootFromAlias(this.props.repos, this.props.alias)
      if(!rootId){
        ErrorActions.update(`Repo named "${this.props.alias}" not found`)
      }
      else if(!ServerStore.IdInCurrentRepo(this.props.repo, rootId)){
        ServerActions.fetch({uuid: rootId});
      }
    }
  }

  render(){
    if(!this.props.repo){
      return (
        <div className='row'>
          <div className="col-md-6 text-muted">
            Loading...
          </div>
        </div>
       );
    }
    return (
      <div >
      
        <div className='row'>
          <div className="col-xs-12 ">
              <div className="repo-title">
              <h4 > {this.props.repo.Alias}</h4>
              <span className="pull-right"> {this.props.repo.Description}</span>
              </div>
          </div>

        </div>

        <div className='row'>
          <RepoTabs/>
        </div>

      </div>

    );
  }

}

LiteRepo.contextTypes = {
  router: React.PropTypes.func.isRequired
};

class ConnectedLiteRepo extends React.Component {

  render() {
    return (
      <AltContainer store={ServerStore}>
        <LiteRepo alias={this.props.params.alias}/>
      </AltContainer>
    );
  }
}


module.exports = ConnectedLiteRepo;