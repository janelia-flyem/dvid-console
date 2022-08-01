import { useState, forwardRef } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import DataInstanceList from "./DataInstanceList";
import DataInstanceAdd from "./DataInstanceAdd";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function DataInstances({ uuid, instances, dag }) {
  const [nodeRestrict, setNodeRestrict] = useState(true);
  const [open, setOpen] = useState(false);
  const [imageSource, setImageSource] = useState();
  const [labelSource, setLabelSource] = useState();

  const handleClose = () => {
    setOpen(false);
  };

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
      setOpen(true);
      // throw error stating 'Please select an image source from the table below.');
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
        (process.env.REACT_APP_PROTOCOL || window.location.protocol) +
        "://" +
        (process.env.REACT_APP_HOSTNAME || window.location.hostname) +
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
      (process.env.REACT_APP_PROTOCOL || window.location.protocol) +
      "://" +
      (process.env.REACT_APP_HOSTNAME || window.location.hostname) +
      "/" +
      uuid +
      "/" +
      cleanedImageSource +
      "%27}";

    var perspective =
      "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";

    const glancerUrl =
      "https://clio-ng.janelia.org/#!{%27layers%27:{" +
      imageLayer +
      segLayer +
      "}_" +
      perspective +
      "}";

    console.log(glancerUrl);

    // window.location.href = glancerUrl;
  }

  return (
    <>
      <Grid item xs={12} sm={9}>
        <Typography variant="h5">Data Instances</Typography>
      </Grid>
      <Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
        <DataInstanceAdd uuid={uuid} dag={dag} />
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
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Please select an image source to enable neuroglancer.
        </Alert>
      </Snackbar>
    </>
  );
}
