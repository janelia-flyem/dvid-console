import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import FileActions from '../actions/FileActions'
import RepoDAG from '../components/RepoDAG.react.js';
import InstanceStore from '../stores/InstanceStore';
import FileList from '../lite-components/FileList.react.js';
import {datatype_labels, label_properties} from '../utils/datalabels.js';

class RepoData extends React.Component {

  componentWillUpdate(nextProps, nextState){
    FileActions.fetchFileNames(nextProps.uuid)
  }

  getLabels(datatype, dataTypeInfo){
    var labels = datatype_labels[datatype];
    return (
      <div className='data-badge-container'>
        {
          labels.map( label => {
            var color = label_properties[label].color;
            return <span key={label} className='badge' style={{backgroundColor:color}}>{label}</span>;
          })
        }
      </div>
    );
    
  }

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
    if(raw_data.length !== 0){
       data = (
          <ul className="list-group">
            {raw_data.map( instance => {
              return (
                <li className="list-group-item" key={instance[0]}>
                  {instance[0]} 
                  {this.getLabels(instance[1].Base.TypeName,instance[1])}
                </li>
            );})}
          </ul>);
    }

    return (
      <div className='row'>
        <div className='col-xs-6'>
          <h5><span className="fa fa-th-large data-icon" aria-hidden="true"></span> Arrays</h5>
          {data}
          
          <h5><span className="fa fa-folder-open data-icon" aria-hidden="true"></span> Files</h5>
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