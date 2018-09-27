import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import Neuroglancer from 'neuroglancer-react';
import './VolumeViewer.css';
import { baseurl } from '../settings';

class VolumeViewer extends React.Component {
  render() {
    const { repo, location } = this.props;

    if (!('Root' in repo)) {
      return '';
    }

    const viewerState = {
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8,
      },
      layers: {},
    };

    const layers = Object.values(qs.parse(location.search, { ignoreQueryPrefix: true }));

    layers.forEach((layer) => {
      const source = `dvid://${baseurl()}/${repo.Root}/${layer}`;
      viewerState.layers[layer] = {
        type: 'image',
        source,
      };
    });

    return (
      <div>
        <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
        <p>Help docs here if needed.</p>
      </div>
    );
  }
}

VolumeViewer.propTypes = {
  repo: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default VolumeViewer;
