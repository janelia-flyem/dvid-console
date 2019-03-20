import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import parse from 'date-fns/parse';
import format from 'date-fns/format';

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit,
  },
});

class RepoCommitSummary extends React.Component {
  getMostRecentCommit() {
    const { repo } = this.props;
    const nodeList = Object.values(repo.DAG.Nodes);
    const sorted = nodeList.sort((a, b) => {
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
      let branch = mostRecentCommit.Branch;
      const date = parse(repo.Updated);
      if (!branch || branch === '') {
        branch = 'Master';
      }
      return [
        <Typography key="branch">Branch: {branch}</Typography>,
        <Typography key="id">{mostRecentCommit.UUID.slice(0, 9)} - {mostRecentCommit.Note}</Typography>,
        <Typography key="date" variant="caption">{format(date, 'MM/DD/YYYY - HH:mm:ss')}</Typography>
      ];
    }

    return (
      <p>Commit message, user, date and uuid here.</p>
    );
  }

  render() {
    const mostRecentCommit = this.getMostRecentCommit();
    return (
      <div>
        <Typography>
          <span className="far fa-code-branch" /> Latest Commit
        </Typography>
        <Card>
          <CardContent>
            {mostRecentCommit}
          </CardContent>
        </Card>
      </div>
    );
  }
}

RepoCommitSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  repo: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoCommitSummary);
