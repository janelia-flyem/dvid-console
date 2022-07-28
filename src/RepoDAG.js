import { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import dagreD3 from "dagre-d3";
import * as d3 from "d3";

import "./RepoDAG.css";

// get the actual node with all information from the original DAG
function getNodeByVersion(dag, id) {
  const nodes = dag.Nodes;
  const filtered = Object.values(nodes).filter((node) => node.VersionID === id);
  return filtered[0];
}

// find the root node, branch is ""
function findRoot(dag) {
  const nodes = dag.Nodes;
  const rootNodes = Object.values(nodes).filter(
    (node) => node.Parents.length === 0
  );
  return rootNodes[0];
}

function createNode(node, dagGraph, uuid, masterUUID) {
  const version = node.VersionID;
  const log = node.Log.length ? node.Log : [];
  let nodeclass = "";

  if (node.Locked) {
    nodeclass += "type-locked";
  } else {
    nodeclass += "type-unlocked";
  }

  let note = node.Note ? node.Note : null;

  if (masterUUID && RegExp("^" + masterUUID).test(node.UUID)) {
    nodeclass = `${nodeclass} master`;
  }

  /* else if (props.repoMasterBranchHist) {
    props.repoMasterBranchHist.slice(1).forEach(
      function (masterBranchUuid) {
        if (RegExp("^" + masterBranchUuid).test(node.UUID)) {
          nodeclass += " master_branch";
        }
      }.bind(this)
    );
  }
  */
  if (node.UUID === uuid) {
    nodeclass = `${nodeclass} current`;
  }

  dagGraph.setNode(version, {
    label: version + ": " + node.UUID.substr(0, 5),
    class: nodeclass,
    rx: 5,
    ry: 5,
    log: log,
    note: note,
    fullname: version + ": " + node.UUID,
    uuid: node.UUID,
    id: "node" + version,
    expandedChildren: null,
    collapsedChildren: null,
    isMerge: false,
    isCollapsible: true,
  });
}

function createEdges(node, dagGraph) {
  node.Children.forEach((child) => {
    dagGraph.setEdge(node.VersionID, child);
  });
}

function drawEdgeBackToRoot(currentNode, dagGraph, dag) {
  if (currentNode && currentNode.Parents && currentNode.Parents.length > 0) {
    var parent = currentNode.Parents[0];
    dagGraph.setEdge(parent, currentNode.VersionID);
    drawEdgeBackToRoot(getNodeByVersion(dag, parent), dagGraph, dag);
  }
}

function attachEvents(nodes, tooltipRef, dag) {
  nodes
    .on("mouseenter", (id) => {
      const note = Object.values(dag.Nodes).filter(
        (node) => node.VersionID === parseInt(id)
      )[0].Note;
      d3.select(tooltipRef)
        .html(note)
        .style("left", d3.event.pageX + 30 + "px")
        .style("top", d3.event.pageY - 30 + "px")
        .style("opacity", 1);
    })
    .on("mousemove", () => {
      d3.select(tooltipRef)
        .style("left", d3.event.pageX + 30 + "px")
        .style("top", d3.event.pageY - 30 + "px");
    })
    .on("mouseleave", (id) => {
      d3.select(tooltipRef).html("").style("opacity", 0);
    })
    .on("click", (id) => {
      const node = Object.values(dag.Nodes).filter(
        (node) => node.VersionID === parseInt(id)
      )[0];
      window.location.href = `/#/repo/${node.UUID}`;
    });
}

function setZoom(center, scale, transformGroup, container) {
  const zoom = d3.zoom().on("zoom", (e) => {
    transformGroup.attr("transform", d3.event.transform);
  });
  d3.select(container).call(zoom);
  // zoom.scale(scale);
  // zoom.translateTo(transformGroup, center);
}

function scrollToNode(nodeSelector, transformGroup, container, zoom) {
  // figure out the scale ratio that will be used to resize the graph.
  var node = d3.select(nodeSelector);
  if (!node.empty()) {
    const coords = node.node().getBoundingClientRect();
    //create a translation that will center this node on the display
    var newT = {
      x: container.clientWidth / 2 - coords.x,
      // y: container.clientHeight / 2 - coords.y,
      y: container.clientHeight / 2 + 500 - coords.y,
    };
    d3.select(container).select('svg')
      .call(zoom.transform, d3.zoomIdentity.translate(newT.x, newT.y).scale(1))

    // transformGroup
    //  .transition()
    //  .duration(300)
    //  .attr("transform", "translate(" + newT.x + ", " + newT.y + ")");
    // pass scale=1, since we're using the initial element size
    // setZoom([newT.x, newT.y], 1, transformGroup, container);
    return true;
  } else {
    return false;
  }
}

function initGraph(ref, dag, uuid, masterUUID, tooltipRef) {
  // Create the DAG graph
  var g = new dagreD3.graphlib.Graph({
    compound: true,
    multigraph: true,
  })
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });

  const nodes = dag.Nodes;

  Object.values(nodes).forEach((node) => {
    createNode(node, g, uuid, masterUUID);
  });

  Object.values(nodes).forEach((node) => {
    createEdges(node, g);
  });

  drawEdgeBackToRoot(Object.values(nodes)[0], g, dag);

  // Create the renderer
  var render = new dagreD3.render();

  const container = d3.select(ref);
  // clear out the previous nodes from any previous renders
  container.selectAll("*").remove();

  // generate the main svg image
  var svg = container
    .append("svg")
    .attr("width", ref.clientWidth)
    .attr("height", 500);
  // attach a group object for managing the graph.
  const transformGroup = svg.append("g")
    .on("mouseenter", (id) => {
      d3.select(tooltipRef).html("").style("opacity", 0);
    });

  // & attach pan / zoom functionality
  const zoom = d3.zoom().on("zoom", () => {
    transformGroup.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  // render the DAG nodes to the transformable group.
  render(transformGroup, g);

  attachEvents(transformGroup.selectAll("g.node"), tooltipRef, dag);

  // center the DAG on current selected node, master node or most
  // recently created node.
  scrollToNode(".node.current", transformGroup, ref, zoom);
}

export default function RepoDAG({ dag, uuid, masterUUID }) {
  const DAGImage = useRef(null);
  const DAGTooltip = useRef(null);

  useEffect(() => {
    initGraph(DAGImage.current, dag, uuid, masterUUID, DAGTooltip.current);
  }, [dag, uuid, DAGImage, masterUUID]);

  const handleClick = () => {
    console.log("handleclick");
  };

  return (
    <Grid item xs={12}>
      <button onClick={handleClick}>ScrollTo</button>
      <Typography variant="h5">Version History</Typography>
      <Card variant="outlined" ref={DAGImage}></Card>
      <div ref={DAGTooltip} className="dagTooltip"></div>
    </Grid>
  );
}
