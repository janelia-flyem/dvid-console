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
    if (dag.graph().width > dag.graph().height) {
        useWidth = true;
    }
    // figure out the scale ratio that will be used to resize the graph.
    var scale = 1;
    if (useWidth) {
        scale = $("svg").width() / dag.graph().width;
    } else {
        scale = $("svg").height() / dag.graph().height;
    }
    //decrease the scale by a bit so the dag doesn't hit the edge of the svg container
    scale -= 0.01;
    // work out the offsets needed to center the graph
    var xCenterOffset = Math.abs(((dag.graph().width * scale) - $("svg").width()) / 2);
    var yCenterOffset = Math.abs(((dag.graph().height * scale) - $("svg").height()) / 2);
    // apply the scale and translation in one go.
    elementHolderLayer.attr("transform", "matrix(" + scale + ", 0, 0, " + scale + ", " + xCenterOffset + "," + yCenterOffset + ")");
    // Set up zoom support
    var zoom = d3.behavior.zoom()
        .on("zoom", function () {
        elementHolderLayer.attr("transform", "translate(" + d3.event.translate + ")" +
            "scale(" + d3.event.scale + ")");
    })
    //prevents graph from being zoomed in super close or smaller than the container
    .scaleExtent([scale, 1.5]);
    svgBackground.call(zoom);
    //scale and translate zoom so that it lines up with the graph
    zoom.scale(scale);
    zoom.translate([xCenterOffset, yCenterOffset]);
  },

            $("#nodelogtext").text("Node Log for " + dag.node(v).fullname);
        });

    var nodeDrag = d3.behavior.drag()
        .on("drag", function (d) {
        var node = d3.select(this),
            selectedNode = dag.node(d);
        var prevX = selectedNode.x,
            prevY = selectedNode.y;

        selectedNode.x += d3.event.dx;
        selectedNode.y += d3.event.dy;

        node.attr('transform', 'translate(' + selectedNode.x + ',' + selectedNode.y + ')');

        var dx = selectedNode.x - prevX,
            dy = selectedNode.y - prevY;

        $.each(dag.nodeEdges(d), function (i, e) {
            translateEdge(dag.edge(e.v, e.w), dx, dy);
            $('#' + dag.edge(e.v, e.w).id + " .path").attr('d', calcPoints(e));
        });
    });

    var edgeDrag = d3.behavior.drag()
        .on('drag', function (d) {
        translateEdge(dag.edge(d.v, d.w), d3.event.dx, d3.event.dy);
        $('#' + dag.edge(d.v, d.w).id + " .path").attr('d', calcPoints(d));
    });

    nodeDrag.call(elementHolderLayer.selectAll("g.node"));
    edgeDrag.call(elementHolderLayer.selectAll("g.edgePath"));
  },

  render: function() {
    var smallStyle = { fontSize: '10pt' };
    return (
      <div>
      <h4>Version DAG <span style={smallStyle}> (nodes in red are locked)</span></h4>
      Mouse over a node to view the log
      <div className="dag"><svg width="1000" height="500" ref="DAGimage"><g/></svg></div>
      </div>
    );
  }
});

module.exports = RepoDAG;

function translateEdge(e, dx, dy) {
    e.points.forEach(function (p) {
        p.x = p.x + dx;
        p.y = p.y + dy;
    });
}

//taken from dagre-d3 source code (not the exact same)
function calcPoints(e) {
    var edge = dag.edge(e.v, e.w),
        tail = dag.node(e.v),
        head = dag.node(e.w);
    var points = edge.points.slice(1, edge.points.length - 1);
    var afterslice = edge.points.slice(1, edge.points.length - 1);
    points.unshift(intersectRect(tail, points[0]));
    points.push(intersectRect(head, points[points.length - 1]));
    return d3.svg.line()
        .x(function (d) {
        return d.x;
    })
        .y(function (d) {
        return d.y;
    })
        .interpolate("basis")
    (points);
}

//taken from dagre-d3 source code (not the exact same)
function intersectRect(node, point) {
    var x = node.x;
    var y = node.y;
    var dx = point.x - x;
    var dy = point.y - y;
    var w = $("#" + node.id + " rect").attr('width') / 2;
    var h = $("#" + node.id + " rect").attr('height') / 2;
    var sx = 0,
        sy = 0;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
        // Intersection is top or bottom of rect.
        if (dy < 0) {
            h = -h;
        }
        sx = dy === 0 ? 0 : h * dx / dy;
        sy = h;
    } else {
        // Intersection is left or right of rect.
        if (dx < 0) {
            w = -w;
        }
        sx = w;
        sy = dx === 0 ? 0 : w * dy / dx;
    }
    return {
        x: x + sx,
        y: y + sy
    };
}
