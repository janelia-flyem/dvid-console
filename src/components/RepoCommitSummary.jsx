import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit,
  },
});

class RepoCommitSummary extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div>
        <Typography><span className="far fa-code-branch" /> Latest Commit</Typography>
        <Card>
          <CardContent>
            <p>Commit message, user, date and uuid here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

RepoCommitSummary.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoCommitSummary);
