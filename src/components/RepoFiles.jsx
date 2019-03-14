import React from 'react';
import PropTypes from 'prop-types';
import dvid from 'dvid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import { getHostName, getPort, getProtocol } from '../settings';

const styles = theme => ({
  list: {
    listStyle: 'none',
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
  title: {
    lineHeight: '32px',
  },
});


class RepoFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: null,
      error: null,
      loaded: false,
    };
  }

  componentDidUpdate() {
    const { repo } = this.props;
    const { loaded } = this.state;

    if (repo.Root === '' || loaded) {
      return;
    }

    const api = dvid.connect({
      host: getHostName(),
      port: getPort(),
      protocol: getProtocol(),
      username: 'dvidconsole',
      application: 'dvidconsole',
    });

    api.node({
      uuid: repo.Root,
      endpoint: '.files/keys',
      callback: data => this.setState({ files: data, loaded: true }),
      error: err => this.setState({ error: err, loaded: true }),
    });
  }

  render() {
    const { files, error, loaded } = this.state;
    const { repo, classes } = this.props;
    let content = 'loading';

    if (loaded) {
      content = 'No files found.';
      if (files) {
        content = files.map((file) => {
          const url = `/api/node/${repo.Root}/.files/key/${file}`;
          const link = <a href={url}>{file}</a>;
          return <li key={file}><Typography><span className="far fa-file-alt" /> {link}</Typography></li>;
        });
      }

      if (error) {
        content = <p>Failed to load files list</p>;
      }
    }

    return (
      <div>
        <Typography className={classes.title}><span className="fas fa-folder-open" /> Files</Typography>
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
