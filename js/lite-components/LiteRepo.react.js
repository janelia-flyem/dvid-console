import React from 'react';
import AltContainer from 'alt/AltContainer';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';

class LiteRepo extends React.Component {


  componentWillReceiveProps(nextProps){
    if(nextProps.repos && (!this.props.repo || this.props.repo.Root != nextProps.repo.Root)){
      ServerActions.fetch({uuid: this.props.urlRootID});
    }
  }

  render(){
    if(!this.props.repo){
      return (
        <div className="container">
          <div className="col-md-6 text-muted">
            Loading...
          </div>
       </div>
       );
    }
    return (
      <div className="container">

        <div className="col-md-12">
        </div>
        <div className="col-md-4">
          <div className="center-block">
            <h2> Repo: {this.props.repo.Alias}</h2>

          </div>
        </div>
        <div className="col-md-4"></div>
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