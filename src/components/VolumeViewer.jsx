import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import Neuroglancer from 'neuroglancer-react';
import './VolumeViewer.css';
import { baseurl } from '../settings';

class VolumeViewer extends React.Component {
  render() {
    const { match, location } = this.props;
    console.log(match);

    const viewerState = {
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8,
      },
      layers: {},
    };

    const layers = Object.values(qs.parse(location.search, { ignoreQueryPrefix: true }));

    layers.forEach((layer) => {
      const source = `dvid://${baseurl()}/${match.params.commit}/${layer}`;
      console.log(source);
      viewerState.layers[layer] = {
        type: 'image',
        source,
      };
    });

    return (
      <div>
        <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
      </div>
    );
  }
}

VolumeViewer.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default VolumeViewer;
