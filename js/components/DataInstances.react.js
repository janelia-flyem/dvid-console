import React from 'react';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';

class DataInstanceList extends React.Component {
  render() {
    var rows = [];

    if (this.props && this.props.repo.DataInstances) {
      var instances = this.props.repo.DataInstances;
      for (var key in instances) {
        if (instances.hasOwnProperty(key)) {
          var instance = instances[key];
          var type = instance.Base.TypeName;
          if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' || type === 'labels64' || type === 'labelblk') {
            rows.unshift(<DataInstance key={key} instance={instance} uuid={this.props.uuid}/>);
          } else {
            rows.push(<DataInstance key={key} instance={instance} uuid={this.props.uuid}/>);
          }
        }
      }
    }

    return (
      <table className="datainstances">
        <thead>
          <tr>
            <td>Data Instance</td>
            <td>Type</td>
            <td>Tile Source</td>
            <td>Label Source</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
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

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' )
      tile_input = <TileInput name={name}/>;
    else if (type === 'labels64' || type === 'labelblk')
      label_input = <LabelInput name={name}/>;

    return (
      <tr>
        <th><a href={name_url} target="_blank" data-toggle="tooltip" data-placement="right" title={name_tooltip}>{name}</a></th>
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
      <AltContainer store={ServerStore}>
        <DataInstanceList uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};

module.exports = DataInstances;
