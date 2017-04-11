import React from 'react';
import ReactDOM from 'react-dom';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import {Router} from 'react-router';

class RepoSelect extends React.Component {

  componentWillMount(props){
    ServerActions.fetch();
    ServerActions.fetchServerInfo();
    ServerActions.fetchDataSource();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this)).tooltip({
      selector: '[data-toggle="tooltip"]'
    });
  }

  componentWillUnmount() {
    var tips = $(ReactDOM.findDOMNode(this)).find('[data-toggle="tooltip"]');
    tips.tooltip('destroy');
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
    let dataSource = '';
    if(false){//this.props.dataSource){
      dataSource = (
        <div className="form-group diced-data-source">
          <label>Data Source:</label> 
          <div type='text' className="form-control" readOnly>{this.props.dataSource}</div>
          <a href='https://github.com/janelia-flyem/diced/blob/master/README.md#accessing-fly-em-public-data' 
            target='blank' className="btn btn-default" data-container="body" data-toggle="tooltip" data-placement="bottom" 
            title="instructions to access data">
            <span className='fa fa-external-link'></span> Get Data
          </a>
          
        </div>
      );
    }
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
          {dataSource}
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