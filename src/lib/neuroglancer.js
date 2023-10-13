export function neuroglancerUrl(uuid, imageSource, labelSource) {
  const cleanedImageSource = imageSource.replace("*", "");

  // need to make sure the protocol is in the format 'https?', so strip trailing ':'.
  const protocol = process.env.REACT_APP_PROTOCOL || window.location.protocol.replace(":", "");
  // generate a new url with the choices made and ...
  // redirect the browser
  const portNumber = process.env.REACT_APP_PORT || window.location.port || null;
  const port = portNumber ? `:${portNumber}` : "";
  const imageLayer = {
    type: "image",
    source: `dvid://${protocol}://${
      process.env.REACT_APP_HOSTNAME || window.location.hostname
    }${port}/${uuid}/${cleanedImageSource}`,
    name: cleanedImageSource,
  };

  const layerObj = { layers: [imageLayer] };

  // grab label source selection
  if (labelSource) {
    const cleanedLabelSource = labelSource.replace("*", "");
    const segLayer = {
      type: "segmentation",
      source: `dvid://${protocol}://${
        process.env.REACT_APP_HOSTNAME || window.location.hostname
      }${port}/${uuid}/${cleanedLabelSource}`,
      name: cleanedLabelSource,
    };
    layerObj.layers.push(segLayer);
  }

  const urlParams = encodeURIComponent(JSON.stringify(layerObj));
  const glancerUrl = `${protocol}://clio-ng.janelia.org/#!${urlParams}`;

  return glancerUrl;
}
