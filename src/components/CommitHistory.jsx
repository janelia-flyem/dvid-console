import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
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
  handleBranchChange = (selectedBranch) => {
    const { history, match } = this.props;
    history.push(`/repo/${match.params.name}/commits/${selectedBranch.label}`);
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
      match,
    } = this.props;
    const branchOptions = this.createBranchOptions();
    const selectedBranch = this.fetchSelected(match.params.branch);
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            Branch
            <Select
              value={selectedBranch}
              onChange={this.handleBranchChange}
              options={branchOptions}
            />
            <p className={classes.button}>Show full commit history for branch: {match.params.branch}.</p>
            {'DAG' in repoDetail
              && <CommitList branch={match.params.branch} nodes={repoDetail.DAG.Nodes} />
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
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(CommitHistory);
