import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
  },
});


class ServerStats extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.loadStats();
    actions.loadRepos();
  }

  render() {
    const { classes, stats, repos } = this.props;

    let versionNodes = 0;

    Object.keys(repos).forEach((key) => {
      const repo = repos[key];
      if (repo && repo.DAG) {
        versionNodes += Object.keys(repo.DAG.Nodes).length;
      }
    });

    const dvidVersion = stats['DVID Version'] || 'unknown';
    const gitLink = 'https://github.com/janelia-flyem/dvid/';
    const usedCores = stats.Cores || 0;
    const maxCores = stats['Maximum Cores'] || 0;
    const repoCount = Object.keys(repos).length;
    const storageBackends = stats['Storage backend'] || 'unknown';
    const datastoreVersion = stats['Datastore Version'] || 0;
    const consoleVersion = process.env.REACT_APP_VERSION;

    let serverUptime = 0;
    if (stats['Server uptime']) {
      serverUptime = stats['Server uptime'].split('.', 1);
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="DVID CPU Cores"
                avatar={
                  <span className="far fa-microchip" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {usedCores} <small>out of {maxCores}</small>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Respositories"
                avatar={
                  <span className="far fa-folder-open" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {repoCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Server Uptime"
                avatar={
                  <span className="fa fa-clock" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {serverUptime}s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Version Nodes"
                avatar={
                  <span className="far fa-code-branch" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {versionNodes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="DVID Version"
                avatar={
                  <span className="far fa-bookmark" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="body2">
                  <a href={gitLink}>{dvidVersion}</a>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Storage Backend"
                avatar={
                  <span className="far fa-hdd" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="body2">
                  {storageBackends}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Datastore Version"
                avatar={
                  <span className="far fa-bookmark" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {datastoreVersion}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Console Version"
                avatar={
                  <span className="far fa-bookmark" />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {consoleVersion}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

ServerStats.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired,
  repos: PropTypes.object.isRequired,
};

export default withStyles(styles)(ServerStats);
