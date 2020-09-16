import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import format from 'date-fns/format';

const styles = theme => ({
  commit: {
    marginBottom: theme.spacing.unit,
    padding: theme.spacing.unit,
  },
  uuid: {
    color: theme.palette.primary.main,
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    display: 'inline',
    padding: theme.spacing.unit,
  },
  idContainer: {
    marginTop: theme.spacing.unit * 3,
  },
});

function getAncestorsForNode(node, nodeLookup, classes, ancestors = []) {
  // take node and push it onto ancestors list
  ancestors.push((
    <Paper key={node.UUID} className={classes.commit} elevation={1}>
      <Grid container spacing={2}>
        <Grid item sm={12} md={10}>
          <Typography variant="title">
            {!node.Locked
              && <span className="far fa-lock-open" />
            }
            {node.Note}
          </Typography>
          <Tooltip title={distanceInWordsToNow(node.Created, { addSuffix: true })} placement="top-start">
            <Typography>Created: {format(node.Created, 'MMM M, YYYY, h:m a')}</Typography>
          </Tooltip>
          <Tooltip title={distanceInWordsToNow(node.Updated, { addSuffix: true })} placement="top-start">
            <Typography>Updated: {format(node.Updated, 'MMM M, YYYY, h:m a')}</Typography>
          </Tooltip>
        </Grid>
        <Grid item sm={12} md={2} className={classes.idContainer}>
          <Typography className={classes.uuid}>{node.UUID.slice(0, 9)}</Typography>
        </Grid>
      </Grid>
    </Paper>
  ));
  // grab the parents array
  // foreach item run getAncestorsForNode
  node.Parents.forEach((parentId) => {
    getAncestorsForNode(nodeLookup[parentId], nodeLookup, classes, ancestors);
  });
  return ancestors;
}

class CommitList extends React.Component {
  commits() {
    const { nodes, classes } = this.props;
    let { branch } = this.props;

    if (branch === 'Master') {
      branch = '';
    }

    const nodesByVersionID = {};
    let mostRecentNodeOnBranch = {};

    // loop over all nodes sorted by version id
    Object.values(nodes).sort((a, b) => {
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
      if (node.Branch === branch) {
        mostRecentNodeOnBranch = node;
      }
    });

    // use that to get all parent nodes back to root. That is our list of nodes.
    if ('Branch' in mostRecentNodeOnBranch) {
      const branchNodeList = getAncestorsForNode(mostRecentNodeOnBranch, nodesByVersionID, classes);
      return branchNodeList;
    }
    return (
      <tr><td>No records found.</td></tr>
    );
  }

  render() {
    const commits = this.commits();
    return commits;
  }
}

CommitList.propTypes = {
  nodes: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  branch: PropTypes.string.isRequired,
};

export default withStyles(styles)(CommitList);
