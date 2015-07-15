import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';

class DataInstances extends React.Component {
  // Dagre graph
  componentDidMount() {
    var g = new dagreD3.graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(function() { return {}; });
    g.setNode(0, { label: "Tasty",   class: "" });
    g.setNode(1, { label: "Cow",     class: "" });
    g.setNode(2, { label: "Burgers", class: "type-locked" });
    g.setNode(3, { label: "Steak",   class: "type-locked" });
    g.setNode(4, { label: "Ribs",    class: "type-locked" });
    g.setNode(5, { label: "Pig",     class: "" });
    g.setNode(6, { label: "Ham",     class: "type-locked" });
    g.setNode(7, { label: "Bacon",   class: "type-locked" });
    g.nodes().forEach(function(v) {
      var node = g.node(v);
      node.rx = node.ry = 5;
    });
    g.setEdge(0, 1)
    g.setEdge(0, 5)
    g.setEdge(1, 2);
    g.setEdge(1, 3);
    g.setEdge(1, 4);
    g.setEdge(5, 6);
    g.setEdge(5, 7);
    g.setEdge(5, 4);
    g.edges().forEach(function(v) {
      g.setEdge(v,{lineInterpolate: 'basis',
                   arrowheadStyle: "fill: #000"});
    });
    var render = new dagreD3.render();
    var svg = d3.select("svg"),
    svgGroup = svg.append("g");
    render(d3.select("svg g"), g);
    var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svg.attr("height", g.graph().height + 40);
  }

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
      <div>
      <div><svg width="100%"><g/></svg></div>
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
      </div>
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

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' ) {
      tile_input = <TileInput name={name}/>;
    }

    if (type === 'labels64' || type === 'labelblk') {
      label_input = <LabelInput name={name}/>;
    }

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
