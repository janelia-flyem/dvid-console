import React from 'react';
import ServerStore from '../stores/ServerStore';
import InstanceStore from '../stores/InstanceStore';
import AltContainer from 'alt/AltContainer';

class DataInstanceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSub: false,
      nodeRestrict: true,
      onlyShowDefault: true
    };
  }

  showHandler() {
    if (this.state.showSub) {
      this.setState({showSub: false});
    } else {
      this.setState({showSub: true});
    }
  }

  nodeResHandler() {
    if (this.state.nodeRestrict) {
      this.setState({nodeRestrict: false});
    } else {
      this.setState({nodeRestrict: true});
    }
  }

  toggleShowDefault(){
    this.setState({onlyShowDefault: !this.state.onlyShowDefault})
  }

  render() {
    var nonDefaultCount = 0;
    var tileRows = [];
    var defaultInstances = new Array;

    for(var key in this.props.ServerStore.repoDefaultInstances) {
        defaultInstances.push(this.props.ServerStore.repoDefaultInstances[key]);
    }

    if (this.props.ServerStore && this.props.ServerStore.repo.DataInstances) {
      var instances = this.props.ServerStore.repo.DataInstances;

      var chosen_node = this.props.uuid;
      var dagNodes = this.props.ServerStore.repo.DAG.Nodes;

      // create a lookup and reverse lookup for all of the nodes so we can get parents.
      var byUUIDLookUp = {};
      var byIdLookUp = {};

      for (var key in dagNodes) {
        byUUIDLookUp[key] = dagNodes[key].Parents;
        byIdLookUp[dagNodes[key].VersionID] = key;
      }


      // generate an ancestors list to be used for exclusion.
      var ancestors = {};
      // work back from the chosen node and add all the ancestors to one list.
      function add_ancestors (node) {
        if (byUUIDLookUp.hasOwnProperty(node.UUID)) {
          ancestors[node.UUID] = true;
          // check for parents array
          if (node.Parents.length > 0) {
            for (let nodeParent of node.Parents) {
              var parentUUID = byIdLookUp[nodeParent]
              add_ancestors(dagNodes[parentUUID])
            }
          }
        }
      }
      add_ancestors(dagNodes[chosen_node]);

      var sorted = [];
      var parents = {};

      var base_key_regex = /^(.*)(_\d)$/;

      var toggleIcon = '+';

      if (this.state.showSub) {
        toggleIcon = '-';
      }

      for (var key in instances) {
        // skip this if RepoUUID is not in ancestors list
        if (this.props.InstanceStore.nodeRestrict === false || ancestors.hasOwnProperty(instances[key].Base.RepoUUID)) {
          if (instances.hasOwnProperty(key)) {
            var match = base_key_regex.exec(key);
            if (match) {
              sorted.push([key, instances[key], match[1] + '_' + instances[key].Base.TypeName]);
              parents[match[1] + '_' + instances[key].Base.TypeName] = 1;
            }
            else{
              sorted.push([key, instances[key]]);
            }
          }
        }
      }

      // returns the data instances sorted by type then name.
      sorted.sort(function(a,b) {
        var aType = a[1].Base.TypeName;
        var bType = b[1].Base.TypeName;
        // first see if we have the same type of instance
        if (aType === bType) {
          // same instance type, so sort by the instance name.
          if (a[0] > b[0]) return 1;
          if (a[0] < b[0]) return -1;
          return 0;
        } else {
          // sort by the type.
          if (aType < bType) return -1;
          if (aType > bType) return 1;
        }
        return 0;
      });


      // if onlyShowDefault is set, at this point show only those instances that 
      // are in our repo's default instance. Otherwise, simply show all in alphabetical order
      var hasDefaultInstances = defaultInstances.length > 0;

      for (var i = 0; i < sorted.length; i++) {
        var type = sorted[i][1].Base.TypeName;
        var isParent = parents[sorted[i][0] + '_' + type];
        var isDefaultInstance = false;
        if(hasDefaultInstances){
          isDefaultInstance = defaultInstances.includes(sorted[i][0]);
        }

        if (!this.state.showSub && sorted[i][2]) {
          // don't add the row as we don't want to draw it.
        } else if( !hasDefaultInstances || isDefaultInstance || !this.state.onlyShowDefault) {
            var dataInstance = <DataInstance key={sorted[i][0]} instance={sorted[i][1]} isParent={isParent} uuid={this.props.uuid} show={this.state.showSub}/>;
            tileRows.push(dataInstance);
        }
        
        if (hasDefaultInstances && !isDefaultInstance){
          nonDefaultCount++;
        }
      }

    }

    var toggleDefault = '';
    if(nonDefaultCount > 0){
      toggleDefault = (<div className="btn btn-default btn-xs" 
                            onClick={this.toggleShowDefault.bind(this)}>
                            Click to {this.state.onlyShowDefault? 'show': 'hide'} {nonDefaultCount} non-default data instances
                      </div>);
    }

    return (
      <div>
      <table className="datainstances">
        <thead>
          <tr>
            <td onClick={this.showHandler.bind(this)}> Data Instance [{toggleIcon}]</td>
            <td>Type</td>
            <td>Tile Source</td>
            <td>Label Source</td>
          </tr>
        </thead>
        <tbody>
          {tileRows}
        </tbody>
      </table>
        {toggleDefault}
      </div>
    );
  }
}

class DataInstance extends React.Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    var tile_input = '';
    var label_input = '';
    var type = this.props.instance.Base.TypeName;
    var label_class = 'label lbl-' + type;
    var name = this.props.instance.Base.Name;
    var name_url = '/api/node/' + this.props.uuid + '/' + name + '/';
    var info = 'information';
    var masterMarker = '';
    if (this.props.isParent) {
      name = name + '*';
    }

    if (type == 'keyvalue') {
      name_url += 'keys/0/z';
      info = 'keys';
    }
    else if (type == 'labels64') {
      name_url += 'metadata';
      info = 'metadata';
    }
    else if (type == 'roi') {
      name_url += 'roi';
      info = 'ROI coords';
    }
    else {
      name_url += 'info';
    }

    var name_tooltip = 'Display ' + info;
    var type_url = '/api/node/' + this.props.uuid + '/' + name + '/help';
    var type_tooltip = 'Display ' + type + ' help';

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' || type === 'googlevoxels')
      tile_input = <TileInput name={name}/>;
    else if (type === 'labels64' || type === 'labelblk' || type === 'googlevoxels')
      label_input = <LabelInput name={name}/>;

    return (
      <tr>
        <th>{masterMarker}<a href={name_url} target="_blank" data-toggle="tooltip" data-placement="right" title={name_tooltip}>{name}</a></th>
        <th><a href={type_url} target="_blank" data-toggle="tooltip" data-placement="right" title={type_tooltip}><span className={label_class}>{type}</span></a></th>
        <td>{tile_input}</td>
        <td>{label_input}</td>
      </tr>
    );
  }
}

class LabelInput extends React.Component {
  render() {
    return (
      <input type="radio" name="label_source" value={this.props.name}></input>
    );
  }
}

class TileInput extends React.Component {
  render() {
    return (
      <input type="radio" name="tile_source" value={this.props.name}></input>
    );
  }
}

class DataInstances extends React.Component {

  render() {
    return (
      <AltContainer stores={{ServerStore: ServerStore, InstanceStore: InstanceStore}}>
        <DataInstanceList uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};

module.exports = DataInstances;
