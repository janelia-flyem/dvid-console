import React from 'react';
import AltContainer from 'alt/AltContainer';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import RepoDAG from '../components/RepoDAG.react.js';
import InstanceStore from '../stores/InstanceStore';
import InstanceAdd from '../components/InstanceAdd.react.js';
import FileList from '../lite-components/FileList.react.js';


class RepoData extends React.Component {

  render(){
    var [dataInstances, parents] = InstanceStore.dataInstancesForInstance(
      this.props, true
    );
    
    let raw_data = dataInstances.filter(function(instance){
      let typeName = instance[1].Base.TypeName;
      return typeName === "uint8blk" || typeName === "labelblk"
    });

    let hasFiles = dataInstances.some(function(el){
      return el[0] === ".files";
    })

    var data = <p><em>No data found.</em></p>
    if(raw_data){
       data = (
          <ul className="list-group">
            {raw_data.map( instance => {
              return <li className="list-group-item" key={instance[0]}>{instance[0]} ({instance[1].Base.TypeName})</li>
            })}
          </ul>);
    }
    return (
      <div className='row'>
        <div className='col-xs-6'>
          <h5><span className="fa fa-th-large" aria-hidden="true"></span> Raw Data</h5>
          {data}
          <InstanceAdd/>
          
          <br/>
          
          <h5><span className="fa fa-folder-open-o" aria-hidden="true"></span> Files</h5>
          <FileList hasFiles={hasFiles} uuid={this.props.uuid}/>
          
        </div>
        <div className='col-xs-6'>
          <RepoDAG lite="1"/>
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