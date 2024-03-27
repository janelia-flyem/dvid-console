import { useState, useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faMaximize,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import dagreD3 from "dagre-d3";
import * as d3 from "d3";
import DAGHelp from "./DAGHelp";
import RepoDAGBranchSelect from "./RepoDAGBranchSelect";

import "./RepoDAG.css";

const masterFill = "#8bc34a";
const masterStroke = "#689732";

const currentFill = "#fcf8e3";
const currentStroke = "#efd968";

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
  let nodeStyle = "fill: #fff; stroke: #333; stroke-width: 1.5px";

  if (node.Locked) {
    nodeclass += "type-locked";
  } else {
    nodeclass += "type-unlocked";
  }

  let note = node.Note ? node.Note : null;

  if (masterUUID && RegExp("^" + masterUUID).test(node.UUID)) {
    nodeclass = `${nodeclass} master`;
    nodeStyle = `fill: ${masterFill}; stroke: ${masterStroke}; stroke-width: 1.5px`;
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
    nodeStyle = `fill: ${currentFill}; stroke: ${currentStroke}; stroke-width: 1.5px`;
  }

  dagGraph.setNode(version, {
    label: `${version}: ${node.UUID.substr(0, 11)}`,
    class: nodeclass,
    rx: 5,
    ry: 5,
    log: log,
    note: note,
    style: nodeStyle,
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
    dagGraph.setEdge(node.VersionID, child, {
      style:
        "stroke: #333; stroke-width: 1.5px; stroke-opacity:1; fill:none; fill-opacity:1",
    });
  });
}

function drawEdgeBackToRoot(currentNode, dagGraph, dag) {
  if (currentNode && currentNode.Parents && currentNode.Parents.length > 0) {
    var parent = currentNode.Parents[0];
    dagGraph.setEdge(parent, currentNode.VersionID);
    drawEdgeBackToRoot(getNodeByVersion(dag, parent), dagGraph, dag);
  }
}

function attachEvents(nodes, tooltipRef, dag, onNodeMouseOver) {
  nodes
    .on("mouseenter", (id) => {

      const node = Object.values(dag.Nodes).filter(
        (node) => node.VersionID === parseInt(id)
      )[0];

      if (node){
        onNodeMouseOver(node);
        const note = node.Note;
        d3.select(tooltipRef)
          .html(note)
          .style("left", d3.event.pageX + 30 + "px")
          .style("top", d3.event.pageY - 30 + "px")
          .style("opacity", 1);
      }
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

function fitGraphToWindow(container, zoom, dagGraph, svgRef, duration = 600) {
  // determine container dimensions
  const svgNode = d3.select(svgRef).node();
  // calculate scale to fit either height or width
  const scale = Math.min(
    svgNode.clientWidth / (dagGraph.graph().width + 100),
    svgNode.clientHeight / (dagGraph.graph().height + 100)
  );
  // only change scale if it is lager than the window. We don't want
  // to blow up a single node to fill the whole window.
  const fixedScale = scale > 1 ? 1 : scale;

  // calculate x & y offset to place scaled graph at display center
  const xOffset = Math.abs(
    (dagGraph.graph().width * scale - svgNode.clientWidth) / 2
  );
  const yOffset = Math.abs(
    (dagGraph.graph().height * scale - svgNode.clientHeight) / 2
  );

  d3.select(svgRef)
    .select("svg")
    .transition()
    .duration(duration)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(xOffset, yOffset).scale(fixedScale)
    );
}

function scrollToNode(
  nodeSelector,
  transformGroup,
  container,
  zoom,
  duration = 0
) {
  // figure out the scale ratio that will be used to resize the graph.
  var node = d3.select(nodeSelector);
  if (!node.empty()) {
    // const coords = node.node().getBoundingClientRect();
    const [, x, y] = node
      .attr("transform")
      .match(/translate\((-?\d+\.?\d+),(-?\d+\.?\d+)/);
    //create a translation that will center this node on the display
    var newT = {
      x: container.clientWidth / 2 - x,
      // y: container.clientHeight / 2 - coords.y,
      y: container.clientHeight / 2 - y,
    };
    d3.select(container)
      .select("svg")
      .transition()
      .duration(duration)
      .call(zoom.transform, d3.zoomIdentity.translate(newT.x, newT.y).scale(1));

    return true;
  } else {
    return false;
  }
}

function initGraph(ref, dag, uuid, masterUUID, tooltipRef, selectedBranch, onNodeMouseOver) {
  // Create the DAG graph
  var g = new dagreD3.graphlib.Graph({
    compound: true,
    multigraph: true,
  })
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });

  let nodes = dag.Nodes;
  /* if (selectedBranch !== "show_all") {
    nodes = Object.fromEntries(Object.entries(dag.Nodes).filter(([,value]) => value.Branch === selectedBranch));
  } */

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
    .attr("id", "dagGraph")
    .attr("width", ref.clientWidth)
    .attr("height", 500);
  // attach a group object for managing the graph.
  const transformGroup = svg.append("g").on("mouseenter", (id) => {
    d3.select(tooltipRef).html("").style("opacity", 0);
  });

  // & attach pan / zoom functionality
  const zoom = d3.zoom().on("zoom", () => {
    transformGroup.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  // render the DAG nodes to the transformable group.
  render(transformGroup, g);

  // add lock icon to all locked nodes.
  transformGroup
    .selectAll("g.node.type-locked")
    .append("path")
    // this path specifies the lock icon as taken from font awesome
    .attr(
      "d",
      "M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 99.82 144 144V192z"
    )
    .attr("transform", "scale(0.025) translate(-1500,-1400)");

  // add unlock icon to all unlocked nodes.
  transformGroup
    .selectAll("g.node.type-unlocked")
    .append("path")
    // this path specifies the unlock icon as taken from font awesome
    .attr(
      "d",
      "M352 192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H288V144C288 64.47 352.5 0 432 0C511.5 0 576 64.47 576 144V192C576 209.7 561.7 224 544 224C526.3 224 512 209.7 512 192V144C512 99.82 476.2 64 432 64C387.8 64 352 99.82 352 144V192z"
      // "M352 192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H304V128C304 57.31 361.3 0 432 0C502.7 0 560 57.31 560 128V200C560 213.3 549.3 224 536 224C522.7 224 512 213.3 512 200V128C512 83.82 476.2 48 432 48C387.8 48 352 83.82 352 128V192zM48 256V448C48 456.8 55.16 464 64 464H384C392.8 464 400 456.8 400 448V256C400 247.2 392.8 240 384 240H64C55.16 240 48 247.2 48 256z"
    )
    .attr("transform", "scale(0.025) translate(-1500,-1400)");

  attachEvents(transformGroup.selectAll("g.node"), tooltipRef, dag, onNodeMouseOver);

  // center the DAG on current selected node, master node or most
  // recently created node.
  scrollToNode(".node.current", transformGroup, ref, zoom);
  return [svg, transformGroup, zoom, g];
}

export default function RepoDAG({ dag, uuid, masterUUID, onNodeMouseOver }) {
  const [selectedBranch, setSelectedBranch] = useState("show_all");
  const DAGImage = useRef(null);
  const DAGTooltip = useRef(null);
  const graphData = useRef();

  useEffect(() => {
    const graph = initGraph(
      DAGImage.current,
      dag,
      uuid,
      masterUUID,
      DAGTooltip.current,
      selectedBranch,
      onNodeMouseOver
    );
    graphData.current = graph;
  }, [dag, uuid, DAGImage, masterUUID, selectedBranch]);

  const handleScrollToMaster = () => {
    scrollToNode(
      ".node.master",
      graphData.current[1],
      DAGImage.current,
      graphData.current[2],
      600
    );
  };

  const handleScrollToCurrent = () => {
    scrollToNode(
      ".node.current",
      graphData.current[1],
      DAGImage.current,
      graphData.current[2],
      600
    );
  };

  const handleFitGraph = () => {
    fitGraphToWindow(
      graphData.current[1],
      graphData.current[2],
      graphData.current[3],
      DAGImage.current
    );
  };

  const handleDownloadSVG = () => {
    var svgData = document.getElementById("dagGraph").outerHTML;
    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${uuid}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Grid item xs={12}>
      <Typography variant="h5">Version History</Typography>
      <Card variant="outlined" className="DAGContainer">
        {/* <RepoDAGBranchSelect
          nodes={dag.Nodes}
          branch={selectedBranch}
          onBranchChange={setSelectedBranch}
        /> */}
        <div className="DAGControls">
          <Tooltip title="Scroll to master node">
            <IconButton onClick={handleScrollToMaster}>
              <FontAwesomeIcon
                icon={faLocationCrosshairs}
                size="sm"
                style={{ color: masterFill }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Scroll to current node">
            <IconButton onClick={handleScrollToCurrent}>
              <FontAwesomeIcon
                icon={faLocationCrosshairs}
                size="sm"
                style={{ color: currentStroke }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit graph to window">
            <IconButton onClick={handleFitGraph}>
              <FontAwesomeIcon icon={faMaximize} size="sm" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Graph">
            <IconButton onClick={handleDownloadSVG}>
              <FontAwesomeIcon icon={faDownload} size="sm" />
            </IconButton>
          </Tooltip>
          <DAGHelp />
        </div>
        <div ref={DAGImage}></div>
      </Card>
      <div ref={DAGTooltip} className="dagTooltip"></div>
    </Grid>
  );
}
