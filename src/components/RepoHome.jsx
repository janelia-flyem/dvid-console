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
    const { repo, branch, commit, repoRestrictions } = this.props;
    return [
      <Grid key="repoData" item xs={12}>
        <RepoData commit={commit} branch={branch} repoDetail={repo} repoRestrictions={repoRestrictions} />
      </Grid>,
      <Grid key="readme" item xs={12}>
        <ReadMe id={repo.Root} />
      </Grid>
    ];
  }
}

RepoHome.propTypes = {
  repo: PropTypes.object.isRequired,
  commit: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
  repoRestrictions: PropTypes.array.isRequired
};

export default withStyles(styles)(RepoHome);
