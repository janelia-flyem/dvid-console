import React from 'react';
import PropTypes from 'prop-types';
import FolderIcon from '@material-ui/icons/Folder';
import StorageIcon from '@material-ui/icons/Storage';
import TagIcon from '@material-ui/icons/Share';
import TimerIcon from '@material-ui/icons/Schedule';
import BookmarkIcon from '@material-ui/icons/Bookmark';
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
  render() {
    const { classes } = this.props;

    const versionNodes = 0;
    const dvidVersion = 'unknown';
    const gitLink = 'https://github.com/janelia-flyem/dvid/';
    const usedCores = 0;
    const maxCores = 0;
    const repoCount = 0;
    const serverUptime = 0;
    const storageBackends = 'unknown';
    const datastoreVersion = 0;
    const consoleVersion = 0;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="DVID CPU Cores"
                avatar={
                  <StorageIcon />
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
                  <FolderIcon />
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
                  <TimerIcon />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
                  {serverUptime}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Version Nodes"
                avatar={
                  <TagIcon />
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
                  <BookmarkIcon />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
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
                  <StorageIcon />
                }
              />
              <CardContent className={classes.content}>
                <Typography variant="display1">
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
                  <BookmarkIcon />
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
                  <BookmarkIcon />
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
};

export default withStyles(styles)(ServerStats);
