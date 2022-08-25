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

    if (!imageSource) {
      // open the error alert
      setOpen(true);
      return;
    }
    const cleanedImageSource = imageSource.replace("*", "");

    // need to make sure the protocol is in the format 'https?', so strip trailing ':'.
    const protocol = process.env.REACT_APP_PROTOCOL || window.location.protocol.replace(':','');
    // generate a new url with the choices made and ...
    // redirect the browser
    const imageLayer = {
      type: "image",
      source: `dvid://${protocol}://${process.env.REACT_APP_HOSTNAME || window.location.hostname}/${uuid}/${cleanedImageSource}`,
      name: cleanedImageSource
    };

    const layerObj = {layers: [imageLayer]};

    // grab label source selection
    if (labelSource) {
      const cleanedLabelSource = labelSource.replace("*", "");
      segLayer = {
        type: "segmentation",
        source: `dvid://${process.env.REACT_APP_PROTOCOL || window.location.protocol}://${process.env.REACT_APP_HOSTNAME || window.location.hostname}/${uuid}/${cleanedLabelSource}`,
        name: cleanedLabelSource
      }
      layerObj.layers.push(segLayer);
    }

    const urlParams = encodeURIComponent(JSON.stringify(layerObj));

    const glancerUrl = `https://clio-ng.janelia.org/#!${urlParams}`;

    window.open(glancerUrl, '_blank').focus();
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
