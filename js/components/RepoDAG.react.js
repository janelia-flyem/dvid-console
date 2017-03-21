import React from 'react';
import Router from 'react-router';
import {OverlayTrigger} from 'react-bootstrap';
import {Modal, Tooltip} from 'react-bootstrap';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';
import LogActions from '../actions/LogActions';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import ErrorActions from '../actions/ErrorActions';
import moment from 'moment';

var dag, elementHolderLayer, svgBackground;

// Dagre graph
var RepoDAGDisplay  = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function() {
    return {showCommitModal: false};
  },

  componentDidMount: function() {
    this.drawGraph(this.props);
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    //avoid over-aggressive rendering of component that was causing perf issues
    //note that we will need to update this when adding further props to the component
    return  nextProps.types !== this.props.types ||
            nextProps.repoMasterSeg !== this.props.repoMasterSeg ||
            nextProps.repoMasterUuuid !== this.props.repoMasterUuuid ||
            nextProps.uuid !== this.props.uuid ||
            nextState.showCommitModal !== this.state.showCommitModal;
  },

  componentWillUpdate: function(props) {
    this.drawGraph(props);
  },

  drawGraph: function(props) {
    if (props.repo.DAG.Nodes.hasOwnProperty(props.uuid)) {
      this.initDag(this, props);
    }
  },

  initDag: function(t, props){
    //initialize svg for D3
    var svg = d3.select("svg");
        // .attr("width", width)
        // .attr("height", height);
    // clear out the existing data.
    svg.selectAll("*").remove();
    //adds background to differentiate from graph elements
    svgBackground = svg.append("rect")
        .attr("id", "svgBackground")
        .attr("fill", "transparent")
        .attr("width", $("svg").width())
        .attr("height", $("svg").height());
    //creates a group that will hold all the svg elements for the graph
    elementHolderLayer = svg.append("g")
        .attr("id", "elementHolderLayer");
    //defines a shadow for the entire svg for use when hovering over nodes
    var shadow = svg.append("defs")
            .append("filter")
            .attr("id", "drop-shadow")
            .attr('x', "-40%")
            .attr('y', "-40%")
            .attr('height', "200%")
            .attr('width', "200%");
        shadow.append("feOffset")
            .attr('result', "offOut")
            .attr('in', "SourceAlpha")
            .attr('dx', "0")
            .attr('dy', "0");
        shadow.append("feGaussianBlur")
            .attr('result', "blurOut")
            .attr('in', "offOut")
            .attr('stdDeviation', "8");
        shadow.append("feBlend")
            .attr('in', "SourceGraphic")
            .attr('in2', "blurOut")
            .attr('mode', "normal");

    //creates new dagreD3 object
    dag = new dagreD3.graphlib.Graph({
        compound: true,
        multigraph: true
    })
        .setGraph({})
        .setDefaultEdgeLabel(function () {
        return {};
    });

    //adds nodes and edges from the JSON dag data
    $.each(props.repo.DAG.Nodes, function (name, n) {
        var version = n.VersionID;
        var log = '';
        if (n.Log.length) log = (n.Log);
        var nodeclass = "";
        if (n.Locked) nodeclass = "type-locked";
        var note = null;
        if (n.Note) note = n.Note;

        if(props.repoMasterUuuid && RegExp('^' + props.repoMasterUuuid).test(n.UUID)){
          nodeclass = nodeclass + " " + "master";

        }
        else if(props.repoMasterBranchHist){
          props.repoMasterBranchHist.slice(1).forEach(function(masterBranchUuid){
            if(RegExp('^' + masterBranchUuid).test(n.UUID)){
              nodeclass += " master_branch";
            }
          }.bind(this))
        }

        if (n.UUID === props.uuid) {
          nodeclass = nodeclass + " " + "current";
        }

        dag.setNode(version, {
            label: version + ': ' + name.substr(0, 5),
            class: nodeclass,
            rx: 5,
            ry: 5,
            log: log,
            note: note,
            fullname: version + ': ' + name,
            uuid: name,
            id: "node" + version,
            expandedChildren: null,
            collapsedChildren: null,
            isMerge: false,
            isCollapsible: true
        });
        $.each(n.Children, function (c) {
            dag.setEdge(version, n.Children[c], {
                lineInterpolate: 'basis',
                arrowheadStyle: "fill: #111",
                id: version + "-" + n.Children[c]
            });
        });
    });

    //returns a list of all predecessors of a parent node
    function findAllPredecessors(node, predecessorsList) {
        predecessorsList = predecessorsList || [];
        dag.predecessors(node).forEach(function (n) {
            //some nodes can be visited more than once so this removes them
            if (predecessorsList.indexOf(n) == -1) {
                predecessorsList.push(n);
            }
            findAllPredecessors(n, predecessorsList);
        });
        return predecessorsList;
    }

    //sets merges and all their predecessors to be uncollapsible
    //gives merges a "merge" class
    dag.nodes().forEach(function (n) {
        if (dag.predecessors(n).length > 1) {
            dag.node(n).isMerge = true;
            dag.node(n).class = dag.node(n).class + " " + "merge";
            dag.node(n).isCollapsible = false;
            findAllPredecessors(n).forEach(function (p) {
                dag.node(p).isCollapsible = false;
            });
        }
    });

    //gives parents a variable to access their collapsible children
    dag.nodes().forEach(function (n) {
        //collapsibleChildren will be a dictionary with key being the node name (that you can call dag.node() with) and the value being properties of that node
        var collapsibleChildren = {};
        dag.successors(n).forEach(function (c) {
            if (dag.node(c).isCollapsible) {
                //adds the node properties to collapsibleChildren so that it can be used to add the node back later
                collapsibleChildren[c] = dag.node(c);
            }
        });
        // only give it expandedChildren if it has collapsible children. otherwise it is kept null (and not set to {})
        if (Object.getOwnPropertyNames(collapsibleChildren).length !== 0) {
            dag.node(n).expandedChildren = collapsibleChildren;
            dag.node(n).class = dag.node(n).class + " " + "expanded";
        }
    });

    this.update();
    //kludge for fixing edge crossings created by the initial dagre render
    this.collapseGraph();
    this.expandGraph();
    //set transition for future collapsing and expanding
    dag.graph().transition = function (selection) {
    return selection.transition().duration(300);
    };
    this.scrollToCurrent();
  },

  update: function(){
    var self = this;
    //renders the dag
    var dagreRenderer = new dagreD3.render();
    // Add a custom arrow
    dagreRenderer.arrows().normal = function normal(parent, id, edge, type) {
        var marker = parent.append("marker")
            .attr("id", id)
            .attr("viewBox", "-1 2 12 10")
            .attr("refX", 11)
            .attr("refY", 5)
            .attr("markerWidth", 8)
            .attr("markerHeight", 14)
            .attr("markerUnits", "strokeWidth")
            .attr("orient", "auto");

        var path = marker.append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10")
            .style("stroke-width", 1.5)
            .style("stroke", "black")
            .style("stroke-linejoin", "round");
        dagreD3.util.applyStyle(path, edge[type + "Style"]);
    };
    dagreRenderer(elementHolderLayer, dag);

    d3.select(".dag_note").remove();

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "dag_note")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text("a simple tooltip");

    //add lock icons
    elementHolderLayer.selectAll("g.node.type-locked")
      .append("svg:foreignObject")
      .attr("width", 20)
      .attr("height", 20)
      .attr("y", "-25px")
      .attr("x", "-45px")
      .append("xhtml:span")
      .attr("class", "lock glyphicon glyphicon-lock");

    //add element to hold expand/collapse icon
    elementHolderLayer.selectAll("g.node.collapsed, g.node.expanded")
      .append("svg:foreignObject")
      .attr("width", 20)
      .attr("height", 20)
      .attr("y", "2px")
      .attr("x", "-10px")
      .append("xhtml:span")
      .attr("class", "toggle-expand-icon");

    elementHolderLayer.selectAll("g.node")
      .on("mouseenter", function (v) {
        if (dag.node(v).note) {
          tooltip.style("visibility", "visible");
          tooltip.text(dag.node(v).note);
        }
        LogActions.update({log: dag.node(v).log, uuid: dag.node(v).uuid});
        $('#' + this.id).css("filter", "url(#drop-shadow)");
      })
      .on("mouseleave", function (v) {
        tooltip.style("visibility", "hidden");
        $('#' + this.id).css("filter", "");
      })
      .on("mousemove", function() {
        tooltip.style("top", (d3.event.pageY-30)+"px").style("left",(d3.event.pageX+30)+"px")
      })
      .on("click", function (v) {
        // prevents a drag from being registered as a click
        if (d3.event.defaultPrevented) return;
        if (d3.event.shiftKey) {
          self.toggleChildren(v);
        }else{
          //loads the node's data into page (updates tile viewer link)
          self.transitionTo('repo', {
              uuid: dag.node(v).uuid
          });
/*          var nextUuid = dag.node(v).uuid;
          ServerActions.fetch({
            uuid: nextUuid,
            callback: function(data){
              self.transitionTo('repo', {
                uuid: nextUuid
              });
            }//need to bind?
          });
*/

        }
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
    //add lock icons
    nodeDrag.call(elementHolderLayer.selectAll("g.node"));
    edgeDrag.call(elementHolderLayer.selectAll("g.edgePath"));
  },
  scrollToCurrent: function(){
    ErrorActions.clear()
    this.expandGraph()

    var success = this.scrollToNode(".node.current");
    if(!success){
      ErrorActions.update('Can\'t find current node');
    }
    
  },
  scrollToMaster: function(){
    ErrorActions.clear()
    this.expandGraph();
    var success = this.scrollToNode(".node.master");
    if(!success){
      this.fitDAG();
      ErrorActions.update('Repo does not have a master node');
    }
  },
  scrollToNode: function(nodeSelector){
    // figure out the scale ratio that will be used to resize the graph.

    var node = elementHolderLayer.select(nodeSelector);
    if(!node.empty()){
      //get the current transform applied to the node
      var mTransform = d3.transform(node.attr('transform'));
      var masterT = {x:mTransform.translate[0], y:mTransform.translate[1]};
      //create a translation that will center this node on the display
      var newT = {
        x: $("svg").width()/2 - masterT.x,
        y: $("svg").height()/2 - masterT.y,
      }
      // apply with a basic transition
      elementHolderLayer.transition().duration(300).attr("transform", "translate(" + newT.x + ", " + newT.y + ")");
      //pass scale=1, since we're using the initial element size
      this.setZoom([newT.x, newT.y], 1);
      return true;
    }
    else{
      return false;
    }

  },

  setZoom: function(center, scale){
    var zoom = d3.behavior.zoom()
        .on("zoom", function () {
        elementHolderLayer.attr("transform", "translate(" + d3.event.translate + ")" +
            "scale(" + d3.event.scale + ")");
    })
    //prevents graph from being zoomed in super close or smaller than the container
    .scaleExtent([0, 1.5]);
    svgBackground.call(zoom);
    // //scale and translate zoom so that it lines up with the graph
    zoom.scale(scale);
    zoom.translate(center);
  },

  fitDAG: function(){
    // figure out the scale ratio that will be used to resize the graph.
    var scale = Math.min($("svg").width()  / dag.graph().width, $("svg").height() / dag.graph().height )
    //only scale the graph if it's larger than the container. otherwise, keep original size
    scale = scale > 1 ? 1 : scale -=0.01;
    // work out the offsets needed to center the graph
    var xCenterOffset = Math.abs(((dag.graph().width * scale) - $("svg").width()) / 2);
    var yCenterOffset = Math.abs(((dag.graph().height * scale) - $("svg").height()) / 2);
    // apply the scale and translation in one go.
    elementHolderLayer.attr("transform", "matrix(" + scale + ", 0, 0, " + scale + ", " + xCenterOffset + "," + yCenterOffset + ")");
    // Set up zoom support
    this.setZoom([xCenterOffset, yCenterOffset], scale)

  },

  //toggles collapsing and expanding of a parent node
  toggleChildren: function (parent) {
    if (dag.node(parent) && dag.node(parent).expandedChildren) {
        collapseChildren(parent)
    } else if (dag.node(parent).collapsedChildren) {
        expandChildren(parent)
    }
    this.update();
    this.scrollToNode('#node' + parent)
  },

  //fully expands entire DAG
  expandGraph: function () {
      //keep track of number of nodes expanded so that recursion can be terminated
      var nodesExpanded = 0;
      dag.nodes().forEach(function (n) {
          if (dag.node(n).collapsedChildren) {
              nodesExpanded += 1;
              expandChildren(n);
          }
      });
      if (nodesExpanded) {
          this.expandGraph();
      } else {
          //if no nodes were expanded, it means the graph has been completely expanded.
          //clean up old graph elements before redraw 
          var svg = d3.select("svg > g");
          svg.selectAll("*").remove();
          this.update();
      }
  },

  //fully collapses entire DAG
  collapseGraph: function () {
    //need to go in reverse order so that parent nodes won't be collapsed until all of their children are collapsed
    dag.nodes().reverse().forEach(function (n) {
      if (dag.node(n) && dag.node(n).expandedChildren) {
          collapseChildren(n)
      }
    });
    this.update();
  },

  expandAndScale: function(){
    ErrorActions.clear()
    this.expandGraph();
    this.fitDAG();

  },

  collapseAndScale: function(){
    ErrorActions.clear()
    this.collapseGraph();
    this.fitDAG();    
  },
  downloadSVGHandler: function(event) {
    this.fitDAG();
    var e = document.createElement('script');
    e.setAttribute('src', "/js/vendor/svg-crowbar.js");
    e.setAttribute('class', 'svg-crowbar');
    document.body.appendChild(e);
  },

  branchNode: function(event) {
    ServerActions.branchNode({
      uuid: this.props.uuid
    });
  },

  openCommitModal: function(e) {
    e.preventDefault();
    this.setState({showCommitModal: true});
  },

  closeCommitModal: function(e) {
    e.preventDefault();
    this.setState({showCommitModal: false});
  },

  commitNode: function(event) {
    var self = this;
    event.preventDefault();

    var logEntry = React.findDOMNode(this.refs.commitLog).value;

    //update the log with the new log message.
    var currentLog = self.props.repo.DAG.Nodes[self.props.uuid].Log;
    // need a timestamp. It will be close to the server one, but off by a little
    // until the page reloads and fetches the data from the server. Important?
    var now = moment();
    currentLog.unshift(now.format() + '  ' + logEntry);

    ServerActions.commitNode({
      uuid: this.props.uuid,
      entry: logEntry,
      callback: function(data) {
        self.setState({showCommitModal: false});
          LogActions.update({log: currentLog, uuid: self.props.uuid});
      },
      error: function(err) {
        self.setState({showCommitModal: false});
        if (/locked node/.test(err)) {
          ErrorActions.update(new Error('You can not lock a node that is locked already.'));
        } else {
          ErrorActions.update(err);
        }
      }
    });
  },

  render: function() {
    var admin = this.context.router.getCurrentQuery().admin;
    var branchButton = '';
    var commitButton = '';
    var scrollToMasterBtn = '';
    if (admin) {
      branchButton = <button className="btn btn-default" onClick={this.branchNode}>Branch</button>
      commitButton = <button className="btn btn-default" onClick={this.openCommitModal}>Commit</button>
    }
    if (this.props.repoMasterUuuid){
      scrollToMasterBtn = <button className="btn btn-default master" onClick={this.scrollToMaster}>Scroll to master</button>;
    }
    var modalTitle = <Modal.Title>Commit (lock) node {this.props.uuid}.</Modal.Title>;

    return (
      <div>
        <h4>Version DAG <small> (Nodes with thick borders are locked.)</small></h4>
        <p>Mouse over a node to view the log. <kbd>Shift</kbd> + Click on <span className="collapsed toggle-expand-icon"></span>/<span className="expanded toggle-expand-icon"></span> nodes to expand/collapse. Click nodes to navigate to repo.</p>
        <div>
          <button className="btn btn-default" onClick={this.downloadSVGHandler}>Download DAG as SVG</button>
          <button className="btn btn-default" onClick={this.fitDAG}>Fit graph to window</button>
          <button className="btn btn-default" onClick={this.expandAndScale}>Expand graph</button>
          <button className="btn btn-default" onClick={this.collapseAndScale}>Collapse graph</button>
          {scrollToMasterBtn}
          <button className="btn btn-default current" onClick={this.scrollToCurrent}>Scroll to current</button>

          {branchButton}
          {commitButton}

          <Modal show={this.state.showCommitModal} onHide={this.closeCommitModal}>
            <Modal.Header closeButton>
            {modalTitle}
            </Modal.Header>
            <Modal.Body>
              <div className="form-group">
                <input className="form-control" type="text" ref="commitLog" name="commit_log" id="commit_log" placeholder="Enter your new log message"/>
              </div>
              <div className="form-group">
                <button onClick={this.commitNode} className="btn btn-primary">Commit</button>
              </div>
            </Modal.Body>
          </Modal>


        </div>
        <div className="dag">
          <div>
            <svg width="100%" height="500" ref="DAGimage"><g/></svg>
          </div>
        </div>
      </div>
    );
  }
});


class RepoDAG extends React.Component {

  render() {
    return (
      <AltContainer store={ServerStore}>
        <RepoDAGDisplay uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};


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

function collapseChildren(parent){
  dag.node(parent).class = dag.node(parent).class.replace("expanded", '');
  dag.node(parent).class = dag.node(parent).class + " " + "collapsed";
  collapse(dag.node(parent).expandedChildren);
  dag.node(parent).collapsedChildren = dag.node(parent).expandedChildren;
  dag.node(parent).expandedChildren = null;
}

function expandChildren(parent){
  dag.node(parent).class = dag.node(parent).class.replace("collapsed", '');
  dag.node(parent).class = dag.node(parent).class + " " + "expanded";
  expand(parent, dag.node(parent).collapsedChildren);
  dag.node(parent).expandedChildren = dag.node(parent).collapsedChildren;
  dag.node(parent).collapsedChildren = null;
}

//recursively collapses subgraph of parent
function collapse(expandedChildren) {
    for (var child in expandedChildren) {
        dag.removeNode(child);
        collapse(expandedChildren[child].expandedChildren);
    }
}
//recursively expands subgraph of parent
function expand(parent, collapsedChildren) {
    for (var child in collapsedChildren) {
        dag.setNode(child, collapsedChildren[child]);
        dag.setEdge(parent, child, {
            lineInterpolate: 'basis',
            id: parent + "-" + child,
            arrowheadStyle: "fill: #111",
        });
        //NOT a typo! only the parent's immediate collapsed children are expanded.
        //the parent's children's expanded children (not collapsed children) are expanded for the rest of the graph.
        expand(child, collapsedChildren[child].expandedChildren);
    }
}
