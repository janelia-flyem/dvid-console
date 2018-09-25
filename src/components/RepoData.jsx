import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import RepoFiles from './RepoFiles';
import RepoArrays from './RepoArrays';
import RepoCommitSummary from './RepoCommitSummary';

const styles = theme => ({
  cardHeader: {
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    padding: '0.5em 2em',
  },
});

class RepoData extends React.Component {
  render() {
    const { classes, repoDetail } = this.props;

    const title = <Typography variant="title"><Icon className={classNames('fa fa-database')} style={{ fontSize: 16 }} /> Data</Typography>;

    return (
      <Card>
        <CardHeader title={title} className={classes.cardHeader} />
        <CardContent>
          <Grid container spacing={24}>
            <Grid item sm={6}>
              <RepoArrays dataInstances={repoDetail.DataInstances} repoID={repoDetail.Root} repoName={repoDetail.Alias} />
            </Grid>
            <Grid item sm={6}>
              <RepoFiles repo={repoDetail} />
            </Grid>
          </Grid>
          <Grid item sm={12}>
            <RepoCommitSummary repo={repoDetail} />
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

RepoData.propTypes = {
  classes: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
};

export default withStyles(styles)(RepoData);
