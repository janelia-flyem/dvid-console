import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import FileActions from '../actions/FileActions';
import InstanceActions from '../actions/InstanceActions';
import RepoDAG from '../components/RepoDAG.react.js';
import InstanceStore from '../stores/InstanceStore';
import FileList from '../lite-components/FileList.react.js';
import {datatype_labels, label_properties} from '../utils/datalabels.js';

class RepoData extends React.Component {

  componentWillMount(){
    const repo = this.props.ServerStore.repo;

    FileActions.fetchFileNames(this.props.uuid)
    if(repo && repo.DataInstances.hasOwnProperty('.meta')){
        InstanceActions.fetchMeta({uuid: this.props.ServerStore.uuid});
    }
  }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.ServerStore.uuid !== this.props.ServerStore.uuid){
      const repo = nextProps.ServerStore.repo;
      FileActions.fetchFileNames(nextProps.uuid)

      if(repo && repo.DataInstances.hasOwnProperty('.meta')){
        InstanceActions.fetchMeta({uuid: nextProps.ServerStore.uuid});
      }
    }
  }

  render(){
    const repo = this.props.ServerStore.repo;

    var data = <em>Loading...</em>;
    var [dataInstances, parents] = InstanceStore.dataInstancesForInstance(
      this.props.ServerStore, true
    );
    var data = <em>Loading...</em>;
    
    var hasMeta = dataInstances.some(function(el){
      return el[0] === ".meta";
    });

    if(repo && (!hasMeta || this.props.InstanceStore.restrictions !== null)){
      //retrictions have been fetched, so it's ok to render the data instances

      //filter out the restricted section
      if(this.props.InstanceStore.restrictions !== null){
        dataInstances = dataInstances.filter(function(restrictions, instance){
          return !restrictions.includes(instance[1].Base.Name);
        }.bind({}, this.props.InstanceStore.restrictions))
      }

      const allowed_types = ["uint8blk", "uint16blk", "uint32blk", "uint64blk", "labelblk"];
      let raw_data = dataInstances.filter(function(instance){
        let typeName = instance[1].Base.TypeName;
        return allowed_types.includes(typeName);
      });

      data = <p><em>No data found.</em></p>
      if(raw_data.length !== 0){
         data = (
            <ul className="list-group">
              {raw_data.map( instance => {
                return <DataInstance instance={instance} hasMeta={hasMeta} key={instance[0]} />;
              })}
            </ul>);
      }
    }

    let hasFiles = dataInstances.some(function(el){
      return el[0] === ".files";
    })


    return (
      <div className='row'>
        <div className='col-xs-6'>
          <h5><span className="fa fa-th-large data-icon" aria-hidden="true"></span> Arrays</h5>
          {data}
          
          <h5><span className="fa fa-folder-open data-icon" aria-hidden="true"></span> Files</h5>
          <FileList hasFiles={hasFiles} uuid={this.props.ServerStore.uuid}/>
          
        </div>
        <div className='col-xs-6'>
          <RepoDAG lite="1"/>
        </div>
      </div>
    );
  }

}

class DataInstance extends React.Component {
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
    return (
      <li className="list-group-item">
            {this.props.instance[0]}
            {this.getLabels(this.props.instance[1].Base.TypeName, this.props.instance[1])}
      </li>
    );
  }
}

class ConnectedRepoData extends React.Component {

  render() {
    return (
      <AltContainer stores={{ServerStore, InstanceStore}}>
        <RepoData />
      </AltContainer>
    );
  }
}


module.exports = ConnectedRepoData;