import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import RepoList from './RepoList';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
});

class Home extends React.Component {
  componentDidMount() {
    // do nothing here, but rely on the Navigation component to
    // load the repo list and save the values in the redux store.
  }

  render() {
    const { classes, repos } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h2">Repositories</Typography>
          </Grid>
          <Grid item sm={12} md={6}>
            <RepoList repos={repos} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
  repos: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
