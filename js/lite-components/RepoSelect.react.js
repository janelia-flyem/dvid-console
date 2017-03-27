import React from 'react';
import AltContainer from 'alt/AltContainer';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import {Router} from 'react-router';

class RepoSelect extends React.Component {

  handleSelect(event){
    var repoid = event.target.value;
    //update the store
    ServerActions.fetch({'uuid': repoid})
    //update the route
    if(repoid){
      this.context.router.transitionTo('/repo/' + repoid);
    }
    else{
      this.context.router.transitionTo('/');
    }
  }

  render(){
    var repo_list = []
    if(this.props.repos){
      repo_list = ServerStore.sortRepolist(this.props.repos)

    }
    return (
      <div className="form-group">

          <label>Repo </label>
          <select className="form-control" onChange={this.handleSelect.bind(this)} value={this.props.repo && this.props.repo.Root}>
            <option value="">Please select a repo</option>
            {
              repo_list.map((repo, i) => {

                return <option key={repo.Alias} value={repo.Root}>{repo.Alias}</option>;
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

  componentWillMount() {
      ServerActions.fetch();
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <RepoSelect/>
      </AltContainer>
    );
  }
}


module.exports = ConnectedRepoSelect;