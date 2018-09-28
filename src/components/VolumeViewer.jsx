import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import qs from 'qs';
import Neuroglancer from 'neuroglancer-react';
import './VolumeViewer.css';
import { baseurl } from '../settings';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  right: {
    textAlign: 'right',
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

    const url = `/repo/${match.params.name}/${match.params.branch}/${match.params.commit}`;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <Typography variant="title"><Link to={url} className={classes.cardTitle}>{match.params.name}</Link></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Branch: {match.params.branch}, Commit: {match.params.commit}</Typography>
          </Grid>
          <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
        </Grid>
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
