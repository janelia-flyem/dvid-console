import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import { Switch, Route } from 'react-router-dom';
import VolumeViewer from './VolumeViewer';
import RepoHome from './RepoHome';

function getAncestorsForNode(node, nodeLookup, ancestors = []) {
  // take node and push it onto ancestors list
  ancestors.push({
    value: node.UUID,
    label: `${node.UUID.slice(0, 9)} - ${node.Note}`,
  });
  // grab the parents array
  // foreach item run getAncestorsForNode
  node.Parents.forEach((parentId) => {
    getAncestorsForNode(nodeLookup[parentId], nodeLookup, ancestors);
  });
  return ancestors;
}

class CommitSelection extends React.Component {
  handleBranchChange = (selectedBranch) => {
    const { history, match } = this.props;
    history.push(`/repo/${match.params.name}/${selectedBranch.label}`);
  }

  handleCommitChange = (selectedCommit) => {
    const { history, match } = this.props;
    history.push(`/repo/${match.params.name}/${match.params.branch}/${selectedCommit.value}`);
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
        if (!branchName || branchName === '') {
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
        if (!branchName || branchName === '') {
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

  createCommitOptions(selectedBranch) {
    const { repoDetail } = this.props;
    const nodesByVersionID = {};
    let options = [];
    let mostRecentNodeOnBranch = null;

    const nodes = Object.values(repoDetail.DAG.Nodes);
    // loop over all nodes sorted by version id
    nodes.sort((a, b) => {
      if (a.VersionID < b.VersionID) {
        return -1;
      }
      if (a.VersionID > b.VersionID) {
        return 1;
      }
      return 0;
    }).forEach((node) => {
      nodesByVersionID[node.VersionID] = node;
      // keep replacing the most recent node if it is on the current branch.
      // we are relying on the fact that the nodes are sorted by version number
      // to make sure we get the most recent last.
      let branchName = node.Branch;
      if (!branchName || branchName === '') {
        branchName = 'Master';
      }
      if (branchName === selectedBranch) {
        mostRecentNodeOnBranch = node;
      }
    });

    if (mostRecentNodeOnBranch) {
      options = getAncestorsForNode(mostRecentNodeOnBranch, nodesByVersionID);
    }

    return options;
  }

  fetchSelectedCommit(selectedBranch, commitUUID) {
    const { repoDetail } = this.props;
    if (commitUUID) {
      // loop over the DAG, grab out the node with the same UUID.
      const selectedNode = repoDetail.DAG.Nodes[commitUUID];
      if (selectedNode) {
        return {
          value: selectedNode.UUID,
          label: `${selectedNode.UUID.slice(0, 9)} - ${selectedNode.Note}`,
        };
      }
    }

    // else find most recent commit as the default.
    const nodeList = Object.values(repoDetail.DAG.Nodes);
    const sorted = nodeList.filter((node) => {
      let branchName = node.Branch;
      if (!branchName || branchName === '') {
        branchName = 'Master';
      }
      if (branchName === selectedBranch) {
        return true;
      }
      return false;
    }).sort((a, b) => {
      if (a.VersionID < b.VersionID) {
        return -1;
      }
      if (a.VersionID > b.VersionID) {
        return 1;
      }
      return 0;
    });

    const mostRecentCommit = sorted[sorted.length - 1];
    if (mostRecentCommit) {
      return {
        value: mostRecentCommit.UUID,
        label: `${mostRecentCommit.UUID.slice(0, 9)} - ${mostRecentCommit.Note}`,
      };
    }
    return { value: '' };
  }


  render() {
    const {
      classes,
      match,
      repoDetail,
    } = this.props;

    const branchOptions = this.createBranchOptions();
    const selectedBranch = this.fetchSelected(match.params.branch);

    const commitOptions = this.createCommitOptions(selectedBranch.label);
    const selectedCommit = this.fetchSelectedCommit(selectedBranch.label, match.params.commit);

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item sm={6}>
            Branch
            <Select
              value={selectedBranch}
              onChange={this.handleBranchChange}
              options={branchOptions}
            />
          </Grid>
          <Grid item sm={6}>
            Commit
            <Select
              value={selectedCommit}
              onChange={this.handleCommitChange}
              options={commitOptions}
            />
          </Grid>
          <Switch>
            <Route
              path="/repo/:name/:branch:/:commit/neuroglancer/"
              render={props => <VolumeViewer {...props} repo={repoDetail} />}
            />
            <Route
              path="*"
              render={props => <RepoHome {...props} repo={repoDetail} branch={selectedBranch.label} commit={selectedCommit.value} />}
            />
          </Switch>
        </Grid>
      </div>
    );
  }
}

CommitSelection.propTypes = {
  classes: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default CommitSelection;
