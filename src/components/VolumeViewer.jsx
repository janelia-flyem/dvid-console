import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import qs from 'qs';
import './VolumeViewer.css';
import { baseurl } from '../settings';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));
const gl = document.createElement('canvas').getContext('webgl2');

const styles = theme => ({
  root: {
    overflow: 'hidden',
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
  },
  right: {
    textAlign: 'right',
  },
  heading: {
    padding: theme.spacing.unit * 1,
  },
  cardTitle: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
});

class VolumeViewer extends React.Component {
  render() {
    const { match, location, classes } = this.props;

    const viewerState = {
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8,
      },
      layers: {},
    };

    const layers = Object.values(qs.parse(location.search, { ignoreQueryPrefix: true }));

    layers.forEach((layer) => {
      const source = `dvid://${baseurl()}/${match.params.commit}/${layer.name}`;
      viewerState.layers[layer.name] = {
        type: layer.type,
        source,
      };
    });

    const url = `/${match.params.name}/${match.params.branch}/${match.params.commit}`;

    let viewer = <h3 className="not_supported">Neuroglancer is not supported in this browser. Please use a browser that <a href="https://caniuse.com/#feat=webgl2">supports webGL 2.</a></h3>;

    if (gl) {
      viewer = (
        <Suspense fallback={<div>Loading...</div>}>
          <Neuroglancer perspectiveZoom={80} viewerState={viewerState} brainMapsClientId="NOT_A_VALID_ID" />
        </Suspense>
      );
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography className={classes.heading} variant="title"><Link to={url} className={classes.cardTitle}>{match.params.name}</Link></Typography>
          </Grid>
          <Grid item xs={6} className={classes.right}>
            <Typography className={classes.heading}>Branch: {match.params.branch}, Commit: {match.params.commit}</Typography>
          </Grid>
        </Grid>
        {viewer}
      </div>
    );
  }
}

VolumeViewer.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VolumeViewer);
