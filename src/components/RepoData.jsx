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
import RepoDAG from './RepoDAG';
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
    const {
      classes,
      repoDetail,
      commit,
      branch,
      repoRestrictions
    } = this.props;

    const title = <Typography variant="title"><Icon className={classNames('fa fa-database')} style={{ fontSize: 16 }} /> Data</Typography>;

    return (
      <Card>
        <CardHeader title={title} className={classes.cardHeader} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RepoArrays
                restrictions={repoRestrictions}
                repoName={repoDetail.Alias}
                nodes={repoDetail.DAG.Nodes}
                dataInstances={repoDetail.DataInstances}
                commit={commit}
                branch={branch}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RepoFiles repo={repoDetail} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <RepoCommitSummary repo={repoDetail} >
              <RepoDAG repo={repoDetail} lite={true} uuid={commit} repoMasterUuid="" repoMasterBranchHist={[]} serverInfo={{}} />
            </RepoCommitSummary>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

RepoData.propTypes = {
  classes: PropTypes.object.isRequired,
  repoDetail: PropTypes.object.isRequired,
  commit: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
  repoRestrictions: PropTypes.array.isRequired
};

export default withStyles(styles)(RepoData);
