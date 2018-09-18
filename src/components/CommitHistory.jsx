import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  right: {
    textAlign: 'right',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
});

class CommitHistory extends React.Component {
  componentDidUpdate(prevProps) {
    const { match, repoDetail } = this.props;
    const prevMatch = prevProps.match;

    if (match.params.name !== prevMatch.params.name) {
      this.loadRepoInfo();
    } else if (!('Root' in repoDetail)) {
      this.loadRepoInfo();
    }
  }

  loadRepoInfo() {
    const { match, actions } = this.props;
    const repoName = match.params.name;
    actions.loadRepoInfoFromAlias(repoName);
  }

  render() {
    const { match, classes, repoDetail } = this.props;
    const repoName = match.params.name;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <Typography variant="title">{repoDetail.Alias}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.right}>
            <Typography>{repoDetail.Description}</Typography>
          </Grid>
          <Grid item xs={12}>
            <p className={classes.button}>Show full commit history for {repoName}.</p>
            <p>Have option to swtich to another branch here. default is 'master'?</p>
          </Grid>
        </Grid>
      </div>
    );
  }
}

CommitHistory.propTypes = {
  classes: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
  repos: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default withStyles(styles)(CommitHistory);
