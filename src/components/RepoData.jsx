import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import RepoFiles from './RepoFiles';
import RepoArrays from './RepoArrays';
import RepoDAG from './RepoDAG';

const styles = theme => ({
  cardHeader: {
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    padding: '0.5em 2em',
  },
});


class RepoData extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <Card>
        <CardHeader title="Data" className={classes.cardHeader} />
        <CardContent>
          <Grid container spacing={24}>
            <Grid item sm={6}>
              <Grid item sm={12}>
                <RepoArrays />
              </Grid>
              <Grid item sm={12}>
                <RepoFiles />
              </Grid>
            </Grid>
            <Grid item sm={6}>
              <RepoDAG />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

RepoData.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoData);
