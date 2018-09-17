import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
import queryString from 'qs';
import d3 from 'd3';
import $ from 'jquery';
import stringify from 'json-stable-stringify';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import DownloadIcon from '@material-ui/icons/SaveAlt';
import CenterIcon from '@material-ui/icons/CenterFocusStrong';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import dagreD3 from 'dagre-d3';
import RepoDAGHelpModal from './RepoDAGHelpModal';
// import ServerActions from '../actions/ServerActions';
// import InstanceActions from '../actions/InstanceActions';
// import BranchSelect from '../components/BranchSelect.react.js';

import './RepoDAG.css';

let dag;
let elementHolderLayer;
let svgBackground;

const dagControl = {};

dagControl.oddNodes = [];

function setZoom(center, scale) {
  const zoom = d3.behavior.zoom()
    .on('zoom', () => {
      elementHolderLayer.attr('transform', `translate(${d3.event.translate})`
            + `scale(${d3.event.scale})`);
    })
  // prevents graph from being zoomed in super close or smaller than the container
    .scaleExtent([0, 1.5]);
  svgBackground.call(zoom);
  // //scale and translate zoom so that it lines up with the graph
  zoom.scale(scale);
  zoom.translate(center);
}

function translateEdge(e, dx, dy) {
  e.points.forEach((p) => {
    p.x += dx;
    p.y += dy;
  });
}

// taken from dagre-d3 source code (not the exact same)
function intersectRect(node, point) {
  const { x, y } = node;
  const dx = point.x - x;
  const dy = point.y - y;
  let w = $(`#${node.id} rect`).attr('width') / 2;
  let h = $(`#${node.id} rect`).attr('height') / 2;
  let sx = 0;
  let sy = 0;
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
    y: y + sy,
  };
}


// taken from dagre-d3 source code (not the exact same)
function calcPoints(e, currentDag) {
  const edge = currentDag.edge(e.v, e.w);
  const tail = currentDag.node(e.v);
  const head = currentDag.node(e.w);
  const points = edge.points.slice(1, edge.points.length - 1);
  edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectRect(tail, points[0]));
  points.push(intersectRect(head, points[points.length - 1]));
  return d3.svg.line()
    .x(d => d.x)
    .y(d => d.y)
    .interpolate('basis')(points);
}

// recursively expands subgraph of parent
function expand(parent, collapsedChildren) {
  for (const child in collapsedChildren) {
    dag.setNode(child, collapsedChildren[child]);
    // test, if parent/child combination is in the list of oddNodes
    if (dagControl.oddNodes && dagControl.oddNodes.indexOf(`${parent}-${child}`) === -1) {
      dag.setEdge(parent, child, {
        lineInterpolate: 'basis',
        id: `${parent}-${child}`,
        style: 'stroke: black',
        arrowheadStyle: 'fill: black; stroke: black',
      });
    } else {
      dag.setEdge(parent, child, {
        lineInterpolate: 'basis',
        id: `${parent}-${child}`,
        style: 'stroke: #DDD',
        arrowheadStyle: 'fill: #DDD; stroke: #DDD',
      });
    }

    // NOT a typo! only the parent's immediate collapsed children are expanded.
    // the parent's children's expanded children (not collapsed children) are expanded for the rest of the graph.
    expand(child, collapsedChildren[child].expandedChildren);
  }
}

// recursively collapses subgraph of parent
function collapse(expandedChildren) {
  for (const child in expandedChildren) {
    dag.removeNode(child);
    collapse(expandedChildren[child].expandedChildren);
  }
}

function collapseChildren(parent) {
  dag.node(parent).class = dag.node(parent).class.replace('expanded', '');
  dag.node(parent).class = `${dag.node(parent).class} collapsed`;
  collapse(dag.node(parent).expandedChildren);
  dag.node(parent).collapsedChildren = dag.node(parent).expandedChildren;
  dag.node(parent).expandedChildren = null;
}

function expandChildren(parent) {
  dag.node(parent).class = dag.node(parent).class.replace('collapsed', '');
  dag.node(parent).class = `${dag.node(parent).class} expanded`;
  expand(parent, dag.node(parent).collapsedChildren);
  dag.node(parent).expandedChildren = dag.node(parent).collapsedChildren;
  dag.node(parent).collapsedChildren = null;
}

function scrollToNode(nodeSelector) {
  // figure out the scale ratio that will be used to resize the graph.
  const node = elementHolderLayer.select(nodeSelector);
  if (!node.empty()) {
    // get the current transform applied to the node
    const mTransform = d3.transform(node.attr('transform'));
    const masterT = { x: mTransform.translate[0], y: mTransform.translate[1] };
    // create a translation that will center this node on the display
    const newT = {
      x: $('#DAGimage').width() / 2 - masterT.x,
      y: $('#DAGimage').height() / 2 - masterT.y,
    };
    // apply with a basic transition
    elementHolderLayer.transition().duration(300).attr('transform', `translate(${newT.x}, ${newT.y})`);
    // pass scale=1, since we're using the initial element size
    setZoom([newT.x, newT.y], 1);
    return true;
  }

  return false;
}

function fitDAG() {
  // figure out the scale ratio that will be used to resize the graph.
  let scale = Math.min($('#DAGimage').width() / dag.graph().width, $('#DAGimage').height() / dag.graph().height);
  // only scale the graph if it's larger than the container. otherwise, keep original size
  scale = scale > 1 ? 1 : scale -= 0.05;
  // work out the offsets needed to center the graph
  const xCenterOffset = Math.abs(((dag.graph().width * scale) - $('#DAGimage').width()) / 2);
  let yCenterOffset = Math.abs(((dag.graph().height * scale) - $('#DAGimage').height()) / 2);
  // nudge the y down a bit
  yCenterOffset += 5;
  // apply the scale and translation in one go.
  elementHolderLayer.attr('transform', `matrix(${scale}, 0, 0, ${scale}, ${xCenterOffset},${yCenterOffset})`);
  // Set up zoom support
  setZoom([xCenterOffset, yCenterOffset], scale);
}

function clear() {
  const svg = d3.select('svg > g');
  svg.selectAll('*').remove();
}

function downloadSVGHandler() {
  fitDAG();
  const e = document.createElement('script');
  e.setAttribute('src', '/svg-crowbar.js');
  e.setAttribute('class', 'svg-crowbar');
  document.body.appendChild(e);
}


// Dagre graph
class RepoDAG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdmin: false,
    };
    this.DAGimage = React.createRef();
  }

  componentDidMount() {
    this.drawGraph();
  }

  componentWillReceiveProps() {
    const { isAdmin } = this.state;
    const { location } = this.props;
    const params = queryString.parse(location.search);
    if (isAdmin !== 'admin' in params) {
      this.setState({
        isAdmin: !isAdmin,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isAdmin } = this.state;
    const { uuid, repo } = this.props;
    const repoUpdated = stringify(nextProps.repo.DAG) !== stringify(repo.DAG);

    if (nextProps.uuid !== uuid || repoUpdated || isAdmin !== nextState.isAdmin) {
      return true;
    }

    return false;
  }

  componentDidUpdate() {
    this.drawGraph();
  }

  // get the actual node with all information from the original DAG
  getNodeByVersion(id) {
    const { repo } = this.props;
    const nodes = repo.DAG.Nodes;
    const keys = Object.keys(nodes);

    for (let k = 0; k < keys.length; k++) {
      if (nodes[keys[k]].VersionID === id) {
        return nodes[keys[k]];
      }
    }
    return null;
  }



  // collect the nodes all the way to the top
  collectNodesBackToRoot(currentNode, branchObject) {
    if (currentNode && currentNode.Parents && currentNode.Parents.length > 0) {
      for (let j = 0; j < currentNode.Parents.length; j++) {
        const tNode = this.getNodeByVersion(currentNode.Parents[j]);
        branchObject[tNode.UUID] = tNode;
        dagControl.oddNodes.push(`${tNode.VersionID}-${currentNode.VersionID}`);
        this.collectNodesBackToRoot(tNode, branchObject);
      }
    }
  }

  drawEdgedBackToRoot(currentNode) {
    if (currentNode && currentNode.Parents && currentNode.Parents.length > 0) {
      const parent = currentNode.Parents[0];
      dag.setEdge(
        parent,
        currentNode.VersionID,
      );
      this.drawEdgedBackToRoot(this.getNodeByVersion(parent));
    }
  }

  initDag(selectedBranch, nodes) {
    const {
      repo,
      repoMasterUuid,
      repoMasterBranchHist,
      uuid,
    } = this.props;
    // initialize svg for D3

    const svg = d3.select(this.DAGimage.current);
    // clear out the existing data.
    svg.selectAll('*').remove();

    // adds background to differentiate from graph elements
    svgBackground = svg.append('rect')
      .attr('id', 'svgBackground')
      .attr('fill', 'transparent')
      .attr('width', $(this.DAGimage.current).width())
      .attr('height', $(this.DAGimage.current).height());

    // creates a group that will hold all the svg elements for the graph
    elementHolderLayer = svg.append('g')
      .attr('id', 'elementHolderLayer');

    // defines a shadow for the entire svg for use when hovering over nodes
    const shadow = svg.append('defs')
      .append('filter')
      .attr('id', 'drop-shadow')
      .attr('x', '-40%')
      .attr('y', '-40%')
      .attr('height', '200%')
      .attr('width', '200%');
    shadow.append('feOffset')
      .attr('result', 'offOut')
      .attr('in', 'SourceAlpha')
      .attr('dx', '0')
      .attr('dy', '0');
    shadow.append('feGaussianBlur')
      .attr('result', 'blurOut')
      .attr('in', 'offOut')
      .attr('stdDeviation', '8');
    shadow.append('feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blurOut')
      .attr('mode', 'normal');

    // create new dagreD3 object
    dag = new dagreD3.graphlib.Graph({
      compound: true,
      multigraph: true,
    })
      .setGraph({})
      .setDefaultEdgeLabel(() => ({}));

    // check, if we initialize the full tree or just a sub branch
    if (!nodes) {
      nodes = repo.DAG.Nodes;
    }

    // add nodes and edges from the JSON dag data
    $.each(nodes, (name, n) => {
      const version = n.VersionID;
      let log = '';
      if (n.Log.length) log = (n.Log);
      let nodeclass = '';

      if ((selectedBranch !== null) && (selectedBranch !== n.Branch)) {
        nodeclass += ' node-hint';
      } else if (n.Locked) {
        nodeclass += 'type-locked';
      } else {
        nodeclass += 'type-unlocked';
      }
      let note = null;
      if (n.Note) note = n.Note;

      if (repoMasterUuid && RegExp(`^${repoMasterUuid}`).test(n.UUID)) {
        nodeclass = `${nodeclass} master`;
      } else if (repoMasterBranchHist) {
        repoMasterBranchHist.slice(1).forEach((masterBranchUuid) => {
          if (RegExp(`^${masterBranchUuid}`).test(n.UUID)) {
            nodeclass += ' master_branch';
          }
        });
      }

      if (n.UUID === uuid) {
        nodeclass += ' current ';
      }

      dag.setNode(version, {
        label: `${version}: ${name.substr(0, 5)}`,
        class: nodeclass,
        rx: 5,
        ry: 5,
        log,
        note,
        fullname: `${version}: ${name}`,
        uuid: name,
        id: `node${version}`,
        expandedChildren: null,
        collapsedChildren: null,
        isMerge: false,
        isCollapsible: true,
      });
    });

    $.each(nodes, (name, n) => {
      $.each(n.Children, (c) => {
        if ((selectedBranch === null) || n.Branch === selectedBranch) {
          dag.setEdge(
            n.VersionID,
            n.Children[c],
          );
        }
      });
    });

    this.drawEdgedBackToRoot(nodes[Object.keys(nodes)[0]]);

    // return a list of all predecessors of a parent node
    function findAllPredecessors(node, predecessorsList = []) {
      dag.predecessors(node).forEach((n) => {
        // some nodes can be visited more than once so this removes them
        if (predecessorsList.indexOf(n) === -1) {
          predecessorsList.push(n);
        }
        findAllPredecessors(n, predecessorsList);
      });
      return predecessorsList;
    }

    // sets merges and all their predecessors to be uncollapsible
    // give merges a "merge" class
    dag.nodes().forEach((n) => {
      if (dag.predecessors(n).length > 1) {
        dag.node(n).isMerge = true;
        dag.node(n).class = `${dag.node(n).class} merge`;
        dag.node(n).isCollapsible = false;
        findAllPredecessors(n).forEach((p) => {
          dag.node(p).isCollapsible = false;
        });
      }
    });

    // give parents a variable to access their collapsible children
    dag.nodes().forEach((n) => {
      // collapsibleChildren will be a dictionary with key being the node name (that you can call dag.node() with) and the value being properties of that node
      const collapsibleChildren = {};
      dag.successors(n).forEach((c) => {
        if (dag.node(c) && dag.node(c).isCollapsible) {
          // add the node properties to collapsibleChildren so that it can be used to add the node back later
          collapsibleChildren[c] = dag.node(c);
        }
      });

      // only give it expandedChildren if it has collapsible children. otherwise it is kept null (and not set to {})
      if (Object.getOwnPropertyNames(collapsibleChildren).length !== 0) {
        dag.node(n).expandedChildren = collapsibleChildren;
        dag.node(n).class = `${dag.node(n).class} expanded`;
      }
    });

    // kludge for fixing edge crossings created by the initial dagre render:
    // collapse, then expand
    this.collapseGraph();
    this.scrollToCurrent();

    // set transition for future collapsing and expanding
    dag.graph().transition = function (selection) {
      return selection.transition().duration(300);
    };
  }


  update(currentDag) {
    // renders the dag
    const dagreRenderer = new dagreD3.render();
    // Add a custom arrow
    dagreRenderer.arrows().normal = function normal(parent, id, edge, type) {
      const marker = parent.append('marker')
        .attr('id', id)
        .attr('viewBox', '-1 2 12 10')
        .attr('refX', 11)
        .attr('refY', 5)
        .attr('markerWidth', 8)
        .attr('markerHeight', 14)
        .attr('markerUnits', 'strokeWidth')
        .attr('orient', 'auto');

      const path = marker.append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10')
        .style('stroke-width', 1.5)
        .style('stroke', 'black')
        .style('stroke-linejoin', 'round');
      dagreD3.util.applyStyle(path, edge[`${type}Style`]);
    };

    dagreRenderer(elementHolderLayer, currentDag);

    d3.select('.dag_note').remove();

    let forbiddenToggle = '';
    if (!this.isEditable()) {
      forbiddenToggle = ' forbidden';
    }

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'dag_note')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .text('a simple tooltip');

    // add lock icons
    elementHolderLayer.selectAll('g.node.type-locked')
      .append('svg:foreignObject')
      .attr('width', 20)
      .attr('height', 20)
      .attr('y', '-34px')
      .attr('x', '-35px')
      .append('xhtml:span')
      .attr('class', 'lock fas fa-lock-alt');

    if (this.isEditable()) {
      // add branch icons
      elementHolderLayer.selectAll('g.node.type-locked')
        .append('svg:foreignObject')
        .attr('width', 20)
        .attr('height', 20)
        .attr('y', '-34px')
        .attr('x', '-45px')
        .append('xhtml:span')
        .attr('class', 'branch fa fa-code-fork');
    }

    // add unlocked icon
    elementHolderLayer.selectAll('g.node.type-unlocked')
      .append('svg:foreignObject')
      .attr('width', 20)
      .attr('height', 20)
      .attr('y', '-34px')
      .attr('x', '-40px')
      .append('xhtml:span')
      .attr('class', `unlocked fas fa-lock-open-alt ${forbiddenToggle}`);

    // // add class for hint nodes
    // elementHolderLayer.selectAll("g.node.type-hint")
    //               .attr("class", `node-hint`);

    // add navigation listener - antje's code
    elementHolderLayer.selectAll('g.node rect')
      .on('mouseenter', (v) => {
        if (currentDag.node(v).note) {
          tooltip.style('visibility', 'visible');
          tooltip.text(currentDag.node(v).note);
        }
        $(`#${this.id}`).css('filter', 'url(#drop-shadow)');
      })
      .on('mouseleave', () => {
        tooltip.style('visibility', 'hidden');
        $(`#${this.id}`).css('filter', '');
      })
      .on('mousemove', () => {
        tooltip.style('top', `${d3.event.pageY - 30}px`).style('left', `${d3.event.pageX + 30}px`);
      })
      .on('click', (v) => {
        // prevents a drag from being registered as a click
        if (d3.event.defaultPrevented) return;
        if (d3.event.shiftKey) {
          this.toggleChildren(v);
        } else {
          // loads the node's data into page (updates viewer link)
          this.navigateDAG(dag.node(v).uuid);
        }
      });

    // add commit and branch actions
    if (this.isEditable()) {
      elementHolderLayer.selectAll('g.node foreignObject span')
      // want to add tooltips?
        .on('mouseenter', () => {
        })
        .on('mouseleave', () => {
        })
        .on('mousemove', () => {
        })
        .on('click', (v) => {
          // prevents a drag from being registered as a click
          if (d3.event.defaultPrevented) return;

          // loads the node's data into page
          const { uuid } = currentDag.node(v);
          // const classList = d3.event.path[0].classList;

          // figure out what action to take based on the icon class
          let action = null;
          /*
          if (classList.contains('unlocked')) {
            action = ModalActions.openModal.bind({},
              {
                MODAL_TYPE: ModalTypes.COMMIT_MODAL,
                uuid,
              });
          } else if (classList.contains('branch')) {
            action = ModalActions.openModal.bind({},
              {
                MODAL_TYPE: ModalTypes.BRANCH_MODAL,
                uuid,
              });
          }
          */

          // determine if a navigation is also needed
          if (this.uuid !== uuid) {
            // it's not the current node--navigate to the node
            this.navigateDAG(uuid, action);
          } else if (action) {
            action();
          }
        });
    }

    const nodeDrag = d3.behavior.drag()
      .on('drag', function (d) {
        const node = d3.select(this);

        const selectedNode = currentDag.node(d);
        const prevX = selectedNode.x;
        const prevY = selectedNode.y;

        selectedNode.x += d3.event.dx;
        selectedNode.y += d3.event.dy;

        node.attr('transform', `translate(${selectedNode.x},${selectedNode.y})`);

        const dx = selectedNode.x - prevX;


        const dy = selectedNode.y - prevY;

        $.each(currentDag.nodeEdges(d), (i, e) => {
          translateEdge(currentDag.edge(e.v, e.w), dx, dy);
          $(`#${currentDag.edge(e.v, e.w).id} .path`).attr('d', calcPoints(e, currentDag));
        });
      });

    const edgeDrag = d3.behavior.drag()
      .on('drag', (d) => {
        translateEdge(currentDag.edge(d.v, d.w), d3.event.dx, d3.event.dy);
        $(`#${currentDag.edge(d.v, d.w).id} .path`).attr('d', calcPoints(d));
      });
    // add lock icons
    nodeDrag.call(elementHolderLayer.selectAll('g.node'));
    edgeDrag.call(elementHolderLayer.selectAll('g.edgePath'));
  }

  navigateDAG(newUuid, callback) {
    const { uuid } = this.props;
    if (newUuid !== uuid) {
      // InstanceActions.clearMeta();
      // ServerActions.fetch({ newUuid });
    }
    if (callback) {
      setTimeout(() => {
        callback();
      }, 0);
    }
  }

  scrollToCurrent() {
    this.expandGraph();

    const success = scrollToNode('.node.current');
    if (!success) {
      console.log('Can\'t find current node');
    }
  }

  scrollToMaster() {
    this.expandGraph();
    const success = scrollToNode('.node.master');
    if (!success) {
      fitDAG();
    }
  }

  // find the root node, branch is ""
  findRoot() {
    const { repo } = this.props;
    const { Nodes } = repo.DAG;
    const keys = Object.keys(Nodes);
    for (let i = 0; i < keys.length; i++) {
      if (Nodes[keys[i]].Parents.length === 0) {
        return Nodes[keys[i]];
      }
    }
    return null;
  }

  callbackBranches(selectedBranch) {
    const { repo, uuid } = this.props;
    if (selectedBranch === 'master') {
      selectedBranch = '';
    }

    clear();
    dagControl.oddNodes = [];
    if (selectedBranch === 'showall') {
      if (repo.DAG.Nodes.hasOwnProperty(uuid)) {
        this.initDag(null, null);
      }
    } else {
      // create new graph
      const partialDAG = new dagreD3.graphlib.Graph({
        compound: true,
        multigraph: true,
      }).setGraph({})
        .setDefaultEdgeLabel(
          () => ({}),
        );

      const branchObject = {};
      const root = this.findRoot();

      this.traverseTree(root, selectedBranch, branchObject, true);
      this.initDag(selectedBranch, branchObject);
      fitDAG(partialDAG);
    }
  }

  drawGraph() {
    const { repo, uuid } = this.props;
    if (repo.DAG) {
      if (repo.DAG.Nodes.hasOwnProperty(uuid)) {
        this.initDag(null, null);
      }
    }
  }

  isEditable() {
    const { serverInfo, lite } = this.props;
    const { isAdmin } = this.state;
    // for the full app, check if admin mode is enabled
    // for the lite app, check if the serverInfo mode is set to 'read only'
    return isAdmin
      || (lite && (serverInfo && serverInfo.Mode ? serverInfo.Mode !== 'read only' : true));
  }

  // toggles collapsing and expanding of a parent node
  toggleChildren(parent) {
    if (dag.node(parent) && dag.node(parent).expandedChildren) {
      collapseChildren(parent);
    } else if (dag.node(parent).collapsedChildren) {
      expandChildren(parent);
    }
    this.update(dag);
    scrollToNode(`#node${parent}`);
  }

  // fully expands entire DAG
  expandGraph(someExpanded = false) {
    // skip expansion if no nodes are hidden

    // keep track of number of nodes expanded so that recursion can be terminated
    let nodesExpanded = 0;
    dag.nodes().forEach((n) => {
      if (dag.node(n).collapsedChildren) {
        nodesExpanded += 1;
        expandChildren(n);
      }
    });
    someExpanded = someExpanded || nodesExpanded > 0;
    if (nodesExpanded) {
      this.expandGraph(someExpanded);
    } else {
      // if no nodes were expanded, it means the graph has been completely expanded.
      // clean up old graph elements before redraw
      if (someExpanded) { // no need to redraw if no nodes were ever expanded
        const svg = d3.select('svg > g');
        svg.selectAll('*').remove();
        this.update(dag);
      }
    }
  }

  // fully collapses entire DAG
  collapseGraph() {
    // need to go in reverse order so that parent nodes won't be collapsed until all of their children are collapsed
    dag.nodes().reverse().forEach((n) => {
      if (dag.node(n) && dag.node(n).expandedChildren) {
        collapseChildren(n);
      }
    });
    this.update(dag);
  }

  expandAndScale() {
    this.expandGraph();
    fitDAG();
  }

  collapseAndScale() {
    this.collapseGraph();
    fitDAG();
  }

  handleScrollClick = () => {
    this.scrollToCurrent();
  }

  // find nodes belonging to the partial graph
  traverseTree(node, selectedBranch, branchObject, first) {
    // if we have a node, which belongs to our branch, add this node to the list
    if (node.Branch === selectedBranch) {
      branchObject[node.UUID] = node;
      if (first) {
        first = false;
        this.collectNodesBackToRoot(node, branchObject);
      }
    }
    // traverse through children of node to find more nodes to the branch
    const children = node.Children;
    for (let c = 0; c < children.length; c++) {
      const childNode = this.getNodeByVersion(children[c]);

      // find those children, where the node is in the current branch, but the child is not
      if (node.Branch === selectedBranch && childNode.Branch !== selectedBranch) {
        branchObject[childNode.UUID] = childNode;
        dagControl.oddNodes.push(`${node.VersionID}-${childNode.VersionID}`);
      }
      this.traverseTree(childNode, selectedBranch, branchObject, first);
    }
  }

  render() {
    const { repoMasterUuid } = this.props;
    let scrollToMasterBtn = '';

    if (repoMasterUuid) {
      scrollToMasterBtn = (
        <button
          className="btn btn-default master pull-right"
          data-container="body"
          data-toggle="tooltip"
          data-placement="bottom"
          title="scroll to master node"
          onClick={this.scrollToMaster}
        ><span className="fa fa-crosshairs" />
        </button>
      );
    }

    const dagHeight = '400';
    const headline = <Typography>Version History</Typography>;

    return (
      <div>
        {headline}
        <div className="dag">
          <div>
            <div className="dag-dropdown no-border">
              {/* <BranchSelect myNodes={repo.DAG.Nodes} callbackFromParent={this.callbackBranches} /> */}
            </div>
            <div className="dag-tools">
              <RepoDAGHelpModal />
              <Tooltip title="fit graph to window">
                <IconButton color="primary" onClick={fitDAG}>
                  <FullScreenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="scroll to current node">
                <IconButton color="primary" onClick={this.handleScrollClick}>
                  <CenterIcon />
                </IconButton>
              </Tooltip>
              {scrollToMasterBtn}
              <Tooltip title="download version history as svg">
                <IconButton color="primary" onClick={downloadSVGHandler}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </div>
            <svg width="100%" height={dagHeight} ref={this.DAGimage} id="DAGimage">
              <g />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

RepoDAG.propTypes = {
  repo: PropTypes.object.isRequired,
  lite: PropTypes.bool.isRequired,
  repoMasterUuid: PropTypes.string.isRequired,
  repoMasterBranchHist: PropTypes.object.isRequired,
  uuid: PropTypes.string.isRequired,
  serverInfo: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(RepoDAG);
