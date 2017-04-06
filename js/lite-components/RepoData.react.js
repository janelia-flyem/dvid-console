import React from 'react';
import AltContainer from 'alt-container';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import FileActions from '../actions/FileActions';
import InstanceActions from '../actions/InstanceActions';
import ErrorActions from '../actions/ErrorActions';
import RepoDAG from '../components/RepoDAG.react.js';
import InstanceStore from '../stores/InstanceStore';
import FileList from '../lite-components/FileList.react.js';
import config from '../utils/config.js'
import {datatype_labels, label_properties} from '../utils/datalabels.js';

class RepoData extends React.Component {

  componentWillMount(){
    const repo = this.props.ServerStore.repo;

    if(repo && repo.DataInstances.hasOwnProperty('.meta')){
      InstanceActions.fetchNeuroglancer({uuid: this.props.ServerStore.uuid});
      InstanceActions.fetchRestrictions({uuid: this.props.ServerStore.uuid});
    }
    else if(repo){
      InstanceActions.setMetaEmpty();
    }
  }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.ServerStore.uuid !== this.props.ServerStore.uuid){
      InstanceActions.clearMeta();
      const repo = nextProps.ServerStore.repo;

      if(repo && repo.DataInstances.hasOwnProperty('.meta')){
        InstanceActions.fetchNeuroglancer({uuid: nextProps.ServerStore.uuid});
        InstanceActions.fetchRestrictions({uuid: nextProps.ServerStore.uuid});
      }
      else if(repo){
        InstanceActions.setMetaEmpty();
      }
    }

  }

  openNeuroG(e){
    ErrorActions.clear()
    const imageTypes = ["uint8blk", "uint16blk", "uint32blk", "uint64blk"];
    const uuid = this.props.ServerStore.uuid;
    var errors = null;
    var layers = $(this.refs.instanceList).find(':checked').toArray().map(function(el){
      //determine if it's a segmentation or grayscale image, then build the neuroglancer layer info
      const name = el.id;
      const type = this.props.ServerStore.repo.DataInstances[name].Base.TypeName;

      if(type === 'labelblk'){//segmentation
        return `%27${name}%27:{%27type%27:%27segmentation%27_%27source%27:%27dvid://${config.baseUrl()}/${uuid}/${name}%27}`;

      }
      else if(imageTypes.includes(type)){//image
        return `%27${name}%27:{%27type%27:%27image%27_%27source%27:%27dvid://${config.baseUrl()}/${uuid}/${name}%27}`;
 
      }
      else{
        errors += `Selected array ${name} can't be viewed in neuroglancer\n`;
        return '';
      }
    }.bind(this));

    if(errors !== null){
      ErrorActions.update(errors);
      return;
    }

    var perspective = "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";
    var glancer_url = `/neuroglancer/#!{%27layers%27:{${layers.join('_')}}_${perspective}}`;

    window.location.href = glancer_url

  }

  render(){
    const repo = this.props.ServerStore.repo;
    let neuroGButton = "";
    let data = <em>Loading...</em>;
    let [dataInstances, parents] = InstanceStore.dataInstancesForNode(
      this.props.ServerStore, true
    );
    
    var hasMeta = dataInstances.some(function(el){
      return el[0] === ".meta";
    });
    const allMetaFetched = this.props.InstanceStore.restrictions !== null && 
      this.props.InstanceStore.neuroglancerInstances !== null;

    if(repo && (!hasMeta || allMetaFetched)){
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

        //set value to let DataInstance know if this instance can be viewed in neuroglancer
        if(this.props.InstanceStore.neuroglancerInstances){
          raw_data = raw_data.map(function(instance){
            instance[1].Base.useNeuroG = this.props.InstanceStore.neuroglancerInstances.includes(instance[0]);
            return instance;
          }.bind(this));
        }

        //only show the neuroglancer button if there are some instances that can be viewed in neuroglancer
        if(raw_data.some(function(instance){return instance[1].Base.useNeuroG})){
          neuroGButton = (<button className='btn btn-success btn-xs pull-right' onClick={this.openNeuroG.bind(this)}>
            <span className="fa fa-picture-o"></span> View Selected
          </button>);
        }

        data = (
          <div>
            <ul className="list-group" ref='instanceList'>
              {raw_data.map( instance => {

                return <DataInstance instance={instance} hasMeta={hasMeta} key={instance[0]} />;
              })}
            </ul>
            <div className='data-footer'>
            {neuroGButton}
            </div>
          </div>
        );
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
    let neuroGCheckBox = '';
    if(this.props.instance[1].Base.useNeuroG){
      neuroGCheckBox = <input className="pull-right" type="checkbox" id={this.props.instance[0]}/>;
    }
    return (
      <li className="list-group-item">
            {this.props.instance[0]}
            {this.getLabels(this.props.instance[1].Base.TypeName, this.props.instance[1])}
            {neuroGCheckBox}
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