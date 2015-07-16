import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';
import LogActions from '../actions/LogActions';

class RepoDAG extends React.Component {
  // Dagre graph
  componentDidMount() {
    var g = new dagreD3.graphlib.Graph().setGraph({});
    $.each(this.props.repo.DAG.Nodes,function (name,n) {
      var version = n.VersionID;
      var log = '';
      if (n.Log.length)
        log = (n.Log);
      var nodeclass = "";
      if (n.Locked)
        nodeclass = "type-locked";
      g.setNode(version,{ label: version + ': ' + name.substr(0,5),
                          class: nodeclass,
                          rx: 5, ry: 5,
                          log: log,
                          fullname: version + ': ' + name});
      $.each(n.Children,function (c) {
        g.setEdge(version,n.Children[c],{ lineInterpolate: 'basis', arrowheadStyle: "fill: #000"});
      });
    });
    var render = new dagreD3.render();
    var svg = d3.select("svg"),
        inner = svg.append("g");
    // Set up zoom support
    var zoom = d3.behavior.zoom().on("zoom", function() {
      inner.attr("transform", "translate(" + d3.event.translate + ")" +
                 "scale(" + d3.event.scale + ")");
    });
    svg.call(zoom);
    render(inner, g);
    inner.selectAll("g.node")
      .attr("title", function(v) { return g.node(v).fullname })
      .on("mouseenter", function(v) { LogActions.update(g.node(v).log); })
      .on("mouseleave", function(v) { LogActions.revert() });
    // Center the graph
//    var initialScale = 0.55;
//    zoom
//      .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
//      .scale(initialScale)
//      .event(svg);
//    svg.attr('height', g.graph().height * initialScale + 40);
    svg.attr('width', g.graph().width * .75);
    svg.attr('height', g.graph().height * .75);
  }

  render() {
    return (
      <div>
      <h4>Version DAG</h4>
      <div className="dag"><svg width="100%"><g/></svg></div>
      </div>
    );
  }
}


module.exports = RepoDAG;
