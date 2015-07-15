import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';

class DataInstances extends React.Component {
  render() {
    var rows = [];
    if (this.props && this.props.repo.DataInstances) {
      var instances = this.props.repo.DataInstances;
      for (var key in instances) {
        if (instances.hasOwnProperty(key)) {
          var instance = instances[key];
          rows.push(<DataInstance key={key} instance={instance}/>);
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
  render() {
    var tile_input = '';
    var label_input = '';
    var type = this.props.instance.Base.TypeName;
    var label_class = 'label lbl-' + type;
    var name = this.props.instance.Base.Name;
    var name_url = '/api/node/' + this.props.instance.Base.RepoUUID + '/' + name + '/';
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
    else
      name_url += 'info';
    var name_tooltip = <Tooltip placement="right">Display {info}</Tooltip>;
    var type_url = '/api/node/' + this.props.instance.Base.RepoUUID + '/' + name + '/help';
    var type_tooltip = <Tooltip placement="right">Display {type} help</Tooltip>;

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' )
      tile_input = <TileInput name={name}/>;
    else if (type === 'labels64' || type === 'labelblk')
      label_input = <LabelInput name={name}/>;

    return (
      <tr>
        <th><OverlayTrigger delayShow={300} delayHide={150} overlay={name_tooltip}><a href={name_url} target="_blank">{name}</a></OverlayTrigger></th>
        <th><OverlayTrigger delayShow={300} delayHide={150} overlay={type_tooltip}><a href={type_url} target="_blank"><span className={label_class}>{type}</span></a></OverlayTrigger></th>
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

module.exports = DataInstances;
