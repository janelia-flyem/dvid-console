import React from 'react';

class DataInstances extends React.Component {
  render() {
    console.log(this.props.repo);

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
    var url = ''//config.datatypeInfoUrl(this.props.uuid, this.props.name);

    var tile_input = '';
    var label_input = '';
    var type = this.props.instance.Base.TypeName;
    var label_class = 'label lbl-' + type;
    var name = this.props.instance.Base.Name;

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' ) {
      tile_input = <TileInput name={name}/>;
    }

    if (type === 'labels64' || type === 'labelblk') {
      label_input = <LabelInput name={name}/>;
    }

    return (
      <tr>
        <td><a href={url}>{name}</a></td>
        <td><span className={label_class}>{type}</span></td>
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
