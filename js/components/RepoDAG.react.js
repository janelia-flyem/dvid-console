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

      render(inner, g);

      svg.attr('width', 700);
      svg.attr('height', 300);

      // determine which dimension is hte biggest and use that
      // to scale the graph to fit the window.
      var useWidth = null;
      if ( g.graph().width > g.graph().height) {
        useWidth = true;
      }

      // figure out the scale ratio that will be used to resize the graph.
      var scale = 1;
      if (useWidth) {
        scale = svg.attr("width") / g.graph().width;
      } else {
        scale = svg.attr("height") / g.graph().height ;
      }

      // work out the offset needed to center the graph
      var xCenterOffset = Math.abs(((g.graph().width * scale) - svg.attr("width")) / 2);

      // apply the scale and translation in one go.
      inner.attr("transform", "matrix(" + scale + ", 0, 0, " + scale + ", " + xCenterOffset + ", 0)");

      inner.selectAll("g.node")
        .attr("title", function(v) { return g.node(v).fullname })
        .on("mouseenter", function(v) { if (g.node(v).log.length > 0) { LogActions.update(g.node(v).log); }})
        .on("click", function(v) {
          self.transitionTo( 'repo', { uuid: g.node(v).uuid } );
        });

      // Set up zoom support
      function zoomed() {
        inner.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }

      var zoom = d3.behavior.zoom()
        .translate([xCenterOffset, 0])
        .scale(scale)
        //stop the graphic from being zoomed in super close.
        .scaleExtent([0,1])
        .on("zoom", zoomed);

      svg.call(zoom);
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
