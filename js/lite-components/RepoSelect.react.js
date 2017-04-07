import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import {Router} from 'react-router';

class RepoSelect extends React.Component {

  componentWillMount(props){
    ServerActions.fetch();
    ServerActions.fetchServerInfo();
  }

  handleSelect(event){
    var alias = event.target.value;
    //update the route
    if(alias){
      //LiteRepo will update the store
      this.context.router.transitionTo('/repo/' + alias);

    }
    else{
      //Home updates store
      this.context.router.transitionTo('/');
    }
  }

  render(){
    var repo_list = []
    if(this.props.repos){
      repo_list = ServerStore.sortRepolist(this.props.repos)

    }
    var alias = this.context.router.getCurrentParams().alias;
    if(alias === undefined){
      alias = "";
    }
    return (
      <div className="form-group">
          <label>Repo </label>
          <select className="form-control" onChange={this.handleSelect.bind(this)} value={alias}>
            <option value="">Select a repository</option>
            {
              repo_list.map((repo, i) => {

                return <option key={repo.Alias} value={repo.Alias}>{repo.Alias}</option>;
              })
            }
          </select>

      </div>
    );
  }

}

RepoSelect.contextTypes = {
  router: React.PropTypes.func.isRequired
};


class ConnectedRepoSelect extends React.Component {

  render() {
    return (
      <AltContainer store={ServerStore}>
        <RepoSelect/>
      </AltContainer>
    );
  }
}


module.exports = ConnectedRepoSelect;