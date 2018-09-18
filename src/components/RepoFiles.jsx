import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dvid from 'dvid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import settings from '../settings.json';

const styles = theme => ({
  list: {
    listStyle: 'none',
  },
  link: {
    color: theme.palette.primary.main,
  },
});


class RepoFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: null,
      error: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { repo } = this.props;

    if (prevProps.repo.Root === repo.Root) {
      return;
    }

    const api = dvid.connect({
      host: settings.dvid.host,
      port: settings.dvid.port,
      username: 'dvidconsole',
      application: 'dvidconsole',
    });

    api.node({
      uuid: repo.Root,
      endpoint: '.files/keys',
      callback: data => this.setState({ files: data }),
      error: err => this.setState({ error: err }),
    });
  }

  render() {
    const { files, error } = this.state;
    const { repo, classes } = this.props;
    let content = 'loading';

    if (files) {
      content = files.map((file) => {
        const url = `http://${window.location.hostname}/api/node/${repo.Root}/.files/key/${file}`;
        const link = <Link className={classes.link} to={url}>{file}</Link>;
        return <li key={file}><span className="far fa-file-alt" /> {link}</li>;
      });
    }

    if (error) {
      content = <p>Failed to load files list</p>;
    }

    return (
      <div>
        <Typography><span className="fas fa-folder-open" /> Files</Typography>
        <Card>
          <CardContent>
            <ul className={classes.list}>
              {content}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }
}

RepoFiles.propTypes = {
  repo: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

RepoFiles.defaultProps = {
  repo: {},
};

export default withStyles(styles)(RepoFiles);
