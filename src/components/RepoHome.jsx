import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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
  componentDidMount() {
    this.loadRepoInfo();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const prevMatch = prevProps.match;

    if (match.params.name !== prevMatch.params.name) {
      this.loadRepoInfo();
    }
  }

  loadRepoInfo() {
    const { match, actions } = this.props;
    const repoName = match.params.name;
    actions.loadRepoInfoFromAlias(repoName);
  }

  render() {
    const { classes, repoDetail } = this.props;
    const url = `/repo/${repoDetail.Alias}`;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <Typography variant="title"><Link to={url} className={classes.cardTitle}>{repoDetail.Alias}</Link></Typography>
          </Grid>
          <Grid item xs={6} className={classes.right}>
            <Typography>{repoDetail.Description}</Typography>
          </Grid>
          <Grid item xs={12}>
            <RepoData repoDetail={repoDetail} />
          </Grid>
          <Grid item xs={12}>
            <ReadMe id={repoDetail.Root} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

RepoHome.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoHome);
