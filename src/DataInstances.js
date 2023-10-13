import { useState, forwardRef } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import DataInstanceList from "./DataInstanceList";
import { neuroglancerUrl } from "./lib/neuroglancer";

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
    if (!imageSource) {
      // open the error alert
      setOpen(true);
      return;
    }
    const glancerUrl = neuroglancerUrl(uuid, imageSource, labelSource);
    window.open(glancerUrl, '_blank').focus();
  }

  return (
    <>
      <Grid item xs={12} sm={12}>
        <Typography variant="h5">Data Instances</Typography>
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
