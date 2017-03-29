import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import RepoTabs from '../lite-components/RepoTabs.react.js';

class LiteRepo extends React.Component {


  componentWillReceiveProps(nextProps){
    if(nextProps.repos && (!this.props.repo || this.props.repo.Root != nextProps.repo.Root)){
      ServerActions.fetch({uuid: this.props.urlRootID});
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
          <div className="col-xs-4">
              <h3> {this.props.repo.Alias}</h3>
          </div>
          <div className="col-xs-4"></div>
                  <div className="col-xs-4">
          </div>

        </div>

        <div className='row'>
          <RepoTabs/>
        </div>

      </div>

    );
  }

}


class ConnectedLiteRepo extends React.Component {

  componentWillMount() {
    if(ServerStore.state.repos){
      ServerActions.fetch({uuid: this.props.params.uuid});
    }
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <LiteRepo  urlRootID={this.props.params.uuid}/>
      </AltContainer>
    );
  }
}


module.exports = ConnectedLiteRepo;