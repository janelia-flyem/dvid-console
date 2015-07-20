import React from 'react';
import Router from 'react-router';
import {OverlayTrigger} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';
import LogActions from '../actions/LogActions';

// Dagre graph
var RepoDAG  = React.createClass({
  mixins: [Router.Navigation],

  componentDidMount: function() {
    this.drawGraph(this.props);
  },

  componentWillUpdate: function(props) {
    this.drawGraph(props);
  },

  drawGraph: function(props) {

    if (props.repo.DAG.Nodes.hasOwnProperty(props.uuid)) {
      var self = this;
      var svg = d3.select("svg");
      // clear out the existing data.
      svg.selectAll("*").remove();

      var g = new dagreD3.graphlib.Graph().setGraph({});
      $.each(props.repo.DAG.Nodes,function (name,n) {
        var version = n.VersionID;
        var log = '';
        if (n.Log.length)
          log = (n.Log);
        var nodeclass = "";
        if (n.Locked)
          nodeclass = "type-locked";
        g.setNode(version,{
          label: version + ': ' + name.substr(0,5),
          class: nodeclass,
          rx: 5, ry: 5,
          log: log,
          fullname: version + ': ' + name,
          uuid: name
        });
        $.each(n.Children,function (c) {
          g.setEdge(version,n.Children[c],{ lineInterpolate: 'basis', arrowheadStyle: "fill: #000"});
        });
      });
      var render = new dagreD3.render();
      var inner = svg.append("g");
      // Set up zoom support
      var zoom = d3.behavior.zoom().on("zoom", function() {
        inner.attr("transform", "translate(" + d3.event.translate + ")" +
                  "scale(" + d3.event.scale + ")");
      });
      svg.call(zoom);
      render(inner, g);
      inner.selectAll("g.node")
        .attr("title", function(v) { return g.node(v).fullname })
        .on("mouseenter", function(v) { if (g.node(v).log.length > 0) { LogActions.update(g.node(v).log); }})
        .on("click", function(v) {
          self.transitionTo( 'repo', { uuid: g.node(v).uuid } );
        });
      // Center the graph
  //    var initialScale = 0.55;
  //    zoom
  //      .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
  //      .scale(initialScale)
  //      .event(svg);
  //    svg.attr('height', g.graph().height * initialScale + 40);
      svg.attr('width', g.graph().width * 1);
      svg.attr('height', g.graph().height * 1);
    }
  },

  render: function() {
    var smallStyle = { fontSize: '10pt' };
    return (
      <div>
      <h4>Version DAG <span style={smallStyle}> (nodes in red are locked)</span></h4>
      Mouse over a node to view the log
      <div className="dag"><svg width="100%" ref="DAGimage"><g/></svg></div>
      </div>
    );
  }
});


module.exports = RepoDAG;
