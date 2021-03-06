import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CommitSelection from './CommitSelection';
import NotFound from './NotFound';

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


class Repo extends React.Component {
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
    const { classes, repoDetail, loaded } = this.props;
    if (loaded && !repoDetail.Alias) {
      return <NotFound />
    }
    const url = `/${repoDetail.Alias}`;
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <Typography variant="title"><Link to={url} className={classes.cardTitle}>{repoDetail.Alias}</Link></Typography>
          </Grid>
          <Grid item sm={6} className={classes.right}>
            <Typography>{repoDetail.Description}</Typography>
          </Grid>
          <CommitSelection {...this.props} repoDetail={repoDetail} />
        </Grid>
      </div>
    );
  }
}

Repo.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
  loaded: PropTypes.bool.isRequired,
};


export default withStyles(styles)(Repo);
