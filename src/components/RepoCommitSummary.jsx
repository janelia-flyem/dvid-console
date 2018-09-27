import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

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
      if (!branch || branch === '') {
        branch = 'Master';
      }
      return [
        <Typography key="branch">Branch: {branch}</Typography>,
        <Typography key="id">{mostRecentCommit.UUID.slice(0, 9)} - {mostRecentCommit.Note}</Typography>,
      ];
    }

    return (
      <p>Commit message, user, date and uuid here.</p>
    );
  }

  render() {
    const { classes, repo } = this.props;
    const commitUrl = `/repo/${repo.Alias}/commits/Master`;
    const historyLink = props => <Link to={commitUrl} {...props} />;
    const mostRecentCommit = this.getMostRecentCommit();
    return (
      <div>
        <Typography>
          <span className="far fa-code-branch" /> Latest Commit
          <Button component={historyLink} className={classes.button} size="small" color="primary">
            Show All
          </Button>
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
