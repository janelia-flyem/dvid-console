import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ReadMe from './ReadMe';
import RepoData from './RepoData';

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

class RepoHome extends React.Component {
  render() {
    const { classes, repo } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <RepoData repoDetail={repo} />
          </Grid>
          <Grid item xs={12}>
            <ReadMe id={repo.Root} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

RepoHome.propTypes = {
  classes: PropTypes.object.isRequired,
  repo: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoHome);
