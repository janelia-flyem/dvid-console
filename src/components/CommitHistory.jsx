import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import CommitList from './CommitList';

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
  cardTitle: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
});

class CommitHistory extends React.Component {
  componentDidUpdate() {
    const {
      match,
      repoDetail,
      repoInfoLoaded,
      repoInfoLoading,
    } = this.props;

    if (!repoInfoLoading) {
      if (!repoInfoLoaded || match.params.name !== repoDetail.Alias) {
        this.loadRepoInfo();
      }
    }
  }

  handleBranchChange = (selectedBranch) => {
    const { history, match } = this.props;
    history.push(`/repo/${match.params.name}/commits/${selectedBranch.label}`);
  }

  loadRepoInfo() {
    const { match, actions } = this.props;
    const repoName = match.params.name;
    actions.loadRepoInfoFromAlias(repoName);
  }

  fetchSelected(selectedBranch) {
    const { repoDetail } = this.props;
    let selected = {
      label: 'Master',
      value: '',
    };
    if ('DAG' in repoDetail) {
      Object.values(repoDetail.DAG.Nodes).forEach((node) => {
        let branchName = node.Branch;
        if (branchName === '') {
          branchName = 'Master';
        }
        if (selectedBranch === branchName) {
          selected = {
            label: branchName,
            value: node.Branch,
          };
        }
      });
    }
    return selected;
  }

  createBranchOptions() {
    const { repoDetail } = this.props;
    const options = {};
    if ('DAG' in repoDetail) {
      Object.values(repoDetail.DAG.Nodes).forEach((node) => {
        let branchName = node.Branch;
        if (branchName === '') {
          branchName = 'Master';
        }

        // check if the node is already in the options list.
        if (!(branchName in options)) {
          options[branchName] = {
            value: node.Branch,
            label: branchName,
          };
        }
      });
    }
    // sort options alpha by label?
    // move master to the top of the list?
    const sorted = Object.values(options).sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
    return sorted;
  }

  render() {
    const {
      classes,
      repoDetail,
      repoInfoLoaded,
      repoInfoLoading,
      match,
    } = this.props;
    const branchOptions = this.createBranchOptions();
    const selectedBranch = this.fetchSelected(match.params.branch);
    const repoUrl = `/repo/${repoDetail.Alias}`;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <Typography variant="title"><Link to={repoUrl} className={classes.cardTitle}>{repoDetail.Alias}</Link></Typography>
          </Grid>
          <Grid item xs={6} className={classes.right}>
            <Typography>{repoDetail.Description}</Typography>
          </Grid>
          <Grid item xs={12}>
            Branch
            <Select
              value={selectedBranch}
              onChange={this.handleBranchChange}
              options={branchOptions}
            />
            <p className={classes.button}>Show full commit history for branch: {match.params.branch}.</p>
            {'DAG' in repoDetail
              && <CommitList branch={match.params.branch} nodes={repoDetail.DAG.Nodes} loading={repoInfoLoading} loaded={repoInfoLoaded} />
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

CommitHistory.propTypes = {
  classes: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
  repoInfoLoaded: PropTypes.bool.isRequired,
  repoInfoLoading: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default withStyles(styles)(CommitHistory);
