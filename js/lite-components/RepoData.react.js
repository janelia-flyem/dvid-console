import React from 'react';
import AltContainer from 'alt-container';
import '../vendor/modernizr-output.js';
import bowser from 'bowser';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import FileActions from '../actions/FileActions';
import InstanceActions from '../actions/InstanceActions';
import ErrorActions from '../actions/ErrorActions';
import RepoDAG from '../components/RepoDAG.react.js';
import DataInstance from '../lite-components/LiteDataInstance.js';
import InstanceStore from '../stores/InstanceStore';
import FileList from '../lite-components/FileList.react.js';
import {DICEDHelp} from './DICEDHelp.react.js';
import config from '../utils/config.js'

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

    //ensure browser can handle neuroglancer
    if(!( (bowser.firefox || bowser.chrome) && Modernizr.webgl && 
        Modernizr.webglextensions && 
        'OES_texture_float' in Modernizr.webglextensions &&
        'OES_element_index_uint' in Modernizr.webglextensions &&
        'WEBGL_draw_buffers' in Modernizr.webglextensions)){
      
      const message = (
        <p>
        Your browser will not support neuroglancer for viewing data. <br/>
        See the neuroglancer <a href='https://github.com/google/neuroglancer#troubleshooting'>documentation</a> for more details on browser requirements.<br/>
        For certain browsers, can <a href="https://superuser.com/questions/836832/how-can-i-enable-webgl-in-my-browser/836833#836833">configure</a> your browser to work with neuroglancer.
        </p>
      );

      ErrorActions.update(message)
      return
    }
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
          const disabled = this.props.InstanceStore.selectedInstances.size === 0;
          neuroGButton = (<button className='btn btn-success btn-xs pull-right' onClick={this.openNeuroG.bind(this)} disabled={disabled}>
            <span className="fa fa-picture-o"></span> View selected
          </button>);
        }
        const pythonHelpLines = [
          `from diced import DicedStore`,
          `store = DicedStore("${this.props.ServerStore.dataSource || '<data source>'}")`,
          `# open repo with version id or repo name`,
          `repo = store.open_repo("${this.props.ServerStore.uuid}")`,
          `my_array = repo.get_array("<array_name>")`
        ];

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
            <DICEDHelp className='pull-right' btnText="Get arrays" lines={pythonHelpLines}/>
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
        <div className='col-md-6'>
          <h5><span className="fa fa-th-large data-icon" aria-hidden="true"></span> Arrays</h5>
          {data}
          
          <h5><span className="fa fa-folder-open data-icon" aria-hidden="true"></span> Files</h5>
          <FileList hasFiles={hasFiles} uuid={this.props.ServerStore.uuid}/>
          
        </div>
        <div className='col-md-6'>
          <RepoDAG lite="1"/>
        </div>
      </div>
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