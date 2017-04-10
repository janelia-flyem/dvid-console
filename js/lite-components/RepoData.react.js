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
    this.updateMeta(this.props)
  }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.ServerStore.uuid !== this.props.ServerStore.uuid){
      this.updateMeta(nextProps);
    }
  }

  updateMeta(props){
    const repo = props.ServerStore.repo;

    if(repo && repo.DataInstances.hasOwnProperty('.meta')){
      //make sure the meta property exists on this node
      const [dataInstances, parents] = InstanceStore.dataInstancesForNode(
        props.ServerStore, true
      );
      const hasMeta = dataInstances.some(function(el){
        return el[0] === ".meta";
      });
      if(hasMeta){
        InstanceActions.fetchNeuroglancer({uuid: props.ServerStore.uuid});
        InstanceActions.fetchRestrictions({uuid: props.ServerStore.uuid});
      }
      else{
        InstanceActions.setMetaEmpty();
      }
    }
    else if(repo){
      InstanceActions.setMetaEmpty();
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

    //make sure segmentation layers come last, as these need to do so for proper alpha rendering
    layers = layers.sort(function(a, b){
      if(a.includes("segmentation")){
        return 1;
      }else{
        return -1;
      }
    })

    var perspective = "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";
    var glancer_url = `/neuroglancer/#!{%27layers%27:{${layers.join('_')}}_${perspective}}`;

    window.open(glancer_url);

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

        //only show the neuroglancer button if there are some instances that can be viewed in neuroglancer
        const someInstanceUsesNeuroG = this.props.InstanceStore.neuroglancerInstances && 
          raw_data.some(function(neuroglancerInstances, instance){
            return neuroglancerInstances.includes(instance[0]);
          }.bind({}, this.props.InstanceStore.neuroglancerInstances));

        if(someInstanceUsesNeuroG){
          neuroGButton = (<button className='btn btn-success btn-xs pull-right' onClick={this.openNeuroG.bind(this)}>
            <span className="fa fa-picture-o"></span> View Selected
          </button>);
        }

        data = (
          <div>
            <ul className="list-group" ref='instanceList'>
              {raw_data.map( instance => {
                //can be opened in neuroglancer
                const useNeuroG = this.props.InstanceStore.neuroglancerInstances && this.props.InstanceStore.neuroglancerInstances.includes(instance[0]);
                return <DataInstance useNeuroG={useNeuroG} instance={instance} hasMeta={hasMeta} uuid={this.props.ServerStore.uuid} key={instance[0]} />;
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
  constructor(props){
    super(props);
    this.state = {
      ndims: null
    }
  }

  componentWillMount(){
    if(this.props.hasMeta){
      this.getNdims(this.props)
    }

  }

  componentDidMount(nextProps, nextState){
    const refName = `extents-${this.props.instance[0]}`
    if(this.refs[refName]){
      $(this.refs[refName]).tooltip();
    }
  }

  componentWillUnmount(){
    const refName = `extents-${this.props.instance[0]}`
    if(this.refs[refName]){
      let tip = $(this.refs[refName]);
      tip.tooltip('destroy');
    }

  }

  /**
   * Get the ndims for an instance
   * /api/node/a0325/.meta/key/instance:alt-segmetation:b66b5635ee334419b12d83476f61e1b4
   */
  getNdims(props){
    const api = InstanceStore.state.api;
    const dataUuid = props.instance[1].Base.DataUUID;
    const name = props.instance[0];

    api.node({
        uuid: props.uuid,
        endpoint: `.meta/key/instance:${name}:${dataUuid}`,
        callback: function(data) {
          if(data.numdims){
            this.setState({ndims: data.numdims});
          }
        }.bind(this),
        error: function(data){
          this.setState({ndims: null});
        }.bind(this)
    });
  }

  getLabels(datatype, dataTypeInfo){
    let nDimsLabel = '';
    if(this.state.ndims){
       nDimsLabel = <span className='badge' style={{backgroundColor:'#202f9f'}}>{`${this.state.ndims}d`}</span>;
    }

    let extents = "";
    const details = this.props.instance[1].Extended;
    if(details && details.MaxPoint && details.MinPoint){
      
      const max = details.MaxPoint;
      const min = details.MinPoint;
      const extentsDetails = max.map(function(val, i){
          return `${min[i]}:${val}`;
      })
      extents = (
        <span className='badge extents' ref={`extents-${this.props.instance[0]}`} style={{backgroundColor:'#660066'}}
         data-container="body" data-toggle="tooltip" data-placement="bottom" title={`[${extentsDetails.join(', ')}]`}>
          extents <span className="fa fa-angle-down"></span>
        </span>
      );
    }

    var labels = datatype_labels[datatype];
    return (
      <div className='data-badge-container'>
        {
          labels.map( label => {
            var color = label_properties[label].color;
            return <span key={label} className='badge' style={{backgroundColor:color}}>{label}</span>;
          })
        }
        {nDimsLabel}
        {extents}
      </div>
    );
    
  }

  render(){
    let neuroGCheckBox = '';
    if(this.props.useNeuroG){
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