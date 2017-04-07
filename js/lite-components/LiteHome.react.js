import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import InstanceActions from '../actions/InstanceActions';
import ErrorActions from '../actions/ErrorActions';
import {Link} from 'react-router';
import moment from 'moment';

class LiteHome extends React.Component {

  componentWillMount(){
    ServerActions.fetch();
    InstanceActions.clearMeta();
  }

  render(){
    if(this.props.repos === null){
      return <p><em>Loading...</em></p>;
    }

    let repo_list = ServerStore.sortRepolist(this.props.repos);
    let newRepoButton = '';
    let serverInfo = this.props.serverInfo;

    if(serverInfo !== null && (!serverInfo.Mode || serverInfo.Mode!=='read only')){
      newRepoButton = (<Link to="newrepo" id="repoAddBtn" className="btn btn-success">
          <span className="fa fa-plus" aria-hidden="true"></span> New
        </Link>);
    }

    return (
      <div className='container'>
        <div className='row'>
          <div className="col-xs-3"></div>
          <div className="col-xs-6">
            <h3>Repositories</h3>
          </div>
          <div className="col-xs-3">
            {newRepoButton}
          </div>

        </div>
        <div className='row'>
          <div className="col-xs-3"></div>
          <div className="col-xs-6">
              {repo_list.map( (repo) =>{
                const last_updated = moment(repo.Updated).fromNow();

                return (

                  <div className='repo-summary' key={repo.Alias}>
                    <h4><Link to="repo" params={{alias: repo.Alias}}>{repo.Alias}</Link></h4>
                    <span>{repo.Description}</span>
                    <div>
                    <div className='info'>
                      <div className='text-right'><span className='fa fa-clock-o'></span> <small>updated {last_updated}</small></div>
                    </div>
                    </div>
                  </div>
                );
              

              })}
          </div>
          <div className="col-xs-3">
          </div>

        </div>
      </div>


    );
  }

}

class ConnectedLiteHome extends React.Component {

  render() {
    return (
      <AltContainer store={ServerStore}>
        <LiteHome />
      </AltContainer>
    );
  }
}


module.exports = ConnectedLiteHome;