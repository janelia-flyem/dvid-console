import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ServerStats from '../containers/ServerStats';
import ServerStatus from '../containers/ServerStatus';
import ServerTypes from './ServerTypes';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
});

class Admin extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <h1>Server Stats</h1>
        <ServerStats />
        <ServerStatus />
        <ServerTypes />
      </div>
    );
  }
}

Admin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Admin);
