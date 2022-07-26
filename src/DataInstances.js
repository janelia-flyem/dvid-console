import { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import DataInstanceList from "./DataInstanceList";

export default function DataInstances({ uuid, instances, dag }) {
  const [nodeRestrict, setNodeRestrict] = useState(true);
  const [imageSource, setImageSource] = useState();
  const [labelSource, setLabelSource] = useState();

  function restrictionHandler() {
    setNodeRestrict((prevState) => !prevState);
  }

	function handleImageSelect(event) {
		setImageSource(event.target.value);
	}

	function handleLabelSelect(event) {
		setLabelSource(event.target.value);
	}

  function handleNeuroglancer(event) {
    let segLayer = "";
    // grab image source selection
    if (!imageSource) {
      // throw error stating 'Please select a image source from the table below.');
      return;
    }

    const cleanedImageSource = imageSource.replace("*", "");

    // grab label source selection
    if (labelSource) {
      const cleanedLabelSource = labelSource.replace("*", "");
      segLayer =
        "_%27" +
        cleanedLabelSource +
        "%27:{%27type%27:%27segmentation%27_%27source%27:%27dvid://" +
        window.location.hostname +
        "/" +
        uuid +
        "/" +
        cleanedLabelSource +
        "%27}";
    }

    // generate a new url with the choices made and ...
    // redirect the browser
    const imageLayer =
      "%27" +
      cleanedImageSource +
      "%27:{%27type%27:%27image%27_%27source%27:%27dvid://" +
      window.location.hostname +
      "/" +
      uuid +
      "/" +
      cleanedImageSource +
      "%27}";

    var perspective =
      "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";

    const glancerUrl =
      "/neuroglancer/#!{%27layers%27:{" +
      imageLayer +
      segLayer +
      "}_" +
      perspective +
      "}";

    window.location.href = glancerUrl;
  }

  return (
    <>
      <Grid item xs={12} sm={9}>
        <Typography variant="h5">Data Instances</Typography>
      </Grid>
      <Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
        <Button variant="outlined" size="small">
          Add Data Instance
        </Button>
      </Grid>
      <Grid item xs={12} md={3}>
        <p>
          {nodeRestrict
            ? "Showing data instances created on this node or its ancestors."
            : "Showing all data instances."}
        </p>{" "}
        <Button size="small" variant="outlined" onClick={restrictionHandler}>
          {nodeRestrict
            ? "Show all data instances"
            : "Show select datainstances"}
        </Button>
        <hr />
        <p>
          Select an image source and optionally a label source, then open
          neuroglancer to preview your data.
        </p>
        <Button variant="outlined" size="small" onClick={handleNeuroglancer}>
          Open Neuroglancer
        </Button>
      </Grid>
      <Grid item xs={12} md={9}>
        <DataInstanceList
          uuid={uuid}
          instances={instances}
          dag={dag}
          nodeRestrict={nodeRestrict}
					onImageSelect={handleImageSelect}
					onLabelSelect={handleLabelSelect}
        />
      </Grid>
    </>
  );
}
