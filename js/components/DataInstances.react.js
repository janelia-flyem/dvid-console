import React from 'react';
import ServerStore from '../stores/ServerStore';
import InstanceStore from '../stores/InstanceStore';
import AltContainer from 'alt-container';

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

    if (this.props.ServerStore.uuid && this.props.ServerStore.repo.DataInstances) {
      var [sorted, parents] = InstanceStore.dataInstancesForInstance(this.props.ServerStore, this.props.InstanceStore.nodeRestrict);


      // if onlyShowDefault is set, at this point show only those instances that 
      // are in our repo's default instance. Otherwise, simply show all in alphabetical order
      var hasDefaultInstances = defaultInstances.length > 0;

      for (var i = 0; i < sorted.length; i++) {
        var type = sorted[i][1].Base.TypeName;
        var isParent = parents[sorted[i][0] + '_' + type];
        var isDefaultInstance = false;
        if(hasDefaultInstances){
          isDefaultInstance = defaultInstances.includes(sorted[i][0]) || (sorted[i][2] && defaultInstances.includes(sorted[i][0].split('_')[0]))
        }


        var isChild = !!sorted[i][2] ;
        var defaultOrShowDefault = !hasDefaultInstances || isDefaultInstance || !this.state.onlyShowDefault;
        if(  ((isChild  && this.state.showSub) || !isChild) && defaultOrShowDefault ) {
            var dataInstance = <DataInstance key={sorted[i][0]} instance={sorted[i][1]} isParent={isParent} uuid={this.props.ServerStore.uuid} show={this.state.showSub}/>;
            tileRows.push(dataInstance);
        }
        
        if (hasDefaultInstances && !isDefaultInstance){
          nonDefaultCount++;
        }
      }

    }

    var toggleIcon = '+';

    if (this.state.showSub) {
        toggleIcon = '-';
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
        <DataInstanceList/>
      </AltContainer>
    );
  }
};

module.exports = DataInstances;
