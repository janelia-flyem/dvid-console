import React from 'react';
import AltContainer from 'alt/AltContainer';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';

class RepoData extends React.Component {

  render(){
    return (
      <div>
        <div className='col-xs-6'>
          TODO: data list content
        </div>
        <div className='col-xs-6'>
          TODO: DAG Component
        </div>
      </div>
    );
  }

}


class ConnectedRepoData extends React.Component {


  render() {
    return (
      <AltContainer store={ServerStore}>
        <RepoData />
      </AltContainer>
    );
  }
}


module.exports = ConnectedRepoData;