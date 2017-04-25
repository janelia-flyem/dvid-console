import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import InstanceActions from '../actions/InstanceActions';
import {DICEDHelp, CodeOutput} from './DICEDHelp.react.js';
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
      return <div className='container'><p><em>Loading...</em></p></div>;
    }

    let repo_list = ServerStore.sortRepolist(this.props.repos);
    let newRepoButton = '';
    let serverInfo = this.props.serverInfo;

    if(serverInfo !== null && (!serverInfo.Mode || serverInfo.Mode!=='read only')){
      newRepoButton = (<Link to="newrepo" id="repoAddBtn" className="btn btn-success btn-sm pull-right">
          <span className="fa fa-plus" aria-hidden="true"></span> New
        </Link>);
    }

    return (
      <div className='container'>
        
        <div className='row'>
          <div className='col-md-12'>
            <h3>Repositories</h3>
            <hr/>
          </div>
        </div>
        
        <div className='row'>

          <div className="col-md-7">

              {newRepoButton}
              {repo_list.map( (repo) =>{
                const last_updated = moment(repo.Updated).fromNow();
                const codeLines = [`from diced import DicedStore`,
                                   `store = DicedStore("${this.props.dataSource || '<data source>'}")`,
                                   `repo = store.open_repo("${repo.Alias || '<data source>'}")`];

                return (
                  <div className='repo-summary' key={repo.Alias}>
                    <h4><Link to="repo" params={{alias: repo.Alias}}>{repo.Alias}</Link></h4>
                    <span>{repo.Description}</span>
                    <div>
                    <div className='info'>
                      <div className='text-right'>
                      
                        <DICEDHelp lines={codeLines}/>
                        <span className='fa fa-clock-o'></span> <small>updated {last_updated}</small>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}

          </div>
          
          <div className="col-md-5">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="form-group">
                  <label>Data Source</label>
                  <div className='main-help'>
                    <CodeOutput lines={[this.props.dataSource||'Unavailable']}/>
                  </div>

                </div>
                <div className="form-group">
                  <label>Get Data from DICED</label>
                    <ol>
                      <li>
                        <a href='https://github.com/janelia-flyem/diced/blob/master/README.md#installation' 
                        target='blank'> 
                        Install DICED <span className='fa fa-external-link'></span>
                        </a>
                      </li>
                      <li>
                        Run DICED in Python
                          <div className='main-help'>
                            <CodeOutput lines={[`from diced import DicedStore`,`store = DicedStore("${this.props.dataSource || '<data source>'}")`]}/>
                          </div>
                        </li>
                      <li>
                        Get data
                          <div className='main-help'>
                          <CodeOutput lines={[`# open repo`,`repo = store.open_repo("<reponame>")`,
                                              `# get array`,`my_array = repo.get_array("<array_name>")`]}/>
                         
                          </div>
                      </li>
                    </ol>
                </div>
              </div>
            </div>
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