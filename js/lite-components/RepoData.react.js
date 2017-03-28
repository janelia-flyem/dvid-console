import React from 'react';
import AltContainer from 'alt/AltContainer';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import RepoDAG from '../components/RepoDAG.react.js';
import InstanceStore from '../stores/InstanceStore';

class RepoData extends React.Component {

  render(){
    var [dataInstances, parents] = InstanceStore.dataInstancesForInstance(
      this.props, true
    );
    
    let raw_data = dataInstances.filter(function(instance){
      let typeName = instance[1].Base.TypeName;
      return typeName === "uint8blk" || typeName === "labelblk"
    });

    return (
      <div className='row'>
        <div className='col-xs-6'>
          <h5>Raw Data</h5>
          <ul>
            {raw_data.map( instance => {
              return <li key={instance[0]}>{instance[0]} ({instance[1].Base.TypeName})</li>
            })}
          </ul>
          <h5>Files</h5>
          <FileList/>
        </div>
        <div className='col-xs-6'>
          <RepoDAG lite="1"/>
        </div>
      </div>
    );
  }

}

class FileList extends React.Component {
  render(){

    return (
      <div>
        No files found. Upload files to the dvid .files keyvalue
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