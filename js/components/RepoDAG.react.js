import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';

class RepoDAG extends React.Component {
  // Dagre graph
  componentDidMount() {
    var g = new dagreD3.graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(function() { return {}; });
    $.each(this.props.repo.DAG.Nodes,function (name,n) {
      var version = n.VersionID;
      var nc = "";
      if (n.Locked)
        nc = "type-locked";
      g.setNode(version,{ label: version + ': ' + name.substr(0,5), class: nc});
      $.each(n.Children,function (c) {
        g.setEdge(version,n.Children[c]);
      });
    });
    g.nodes().forEach(function(v) {
      var node = g.node(v);
      node.rx = node.ry = 5;
    });
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
    return (
      <div className="dag"><svg width="100%"><g/></svg></div>
    );
  }
}


module.exports = RepoDAG;
