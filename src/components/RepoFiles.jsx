import React from 'react';
import PropTypes from 'prop-types';
import dvid from 'dvid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FileIcon from '@material-ui/icons/DescriptionOutlined';
import settings from '../settings.json';

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
    const { repo } = this.props;
    let content = 'loading';

    if (files) {
      content = files.map((file) => {
        const url = `http://${window.location.hostname}/api/node/${repo.Root}/.files/key/${file}`;
        const link = <a href={url}>{file}</a>;
        return <li key={file}><FileIcon />{link}</li>;
      });
    }

    if (error) {
      content = <p>Failed to load files list</p>;
    }

    return (
      <div>
        <Typography>Files</Typography>
        <Card>
          <CardContent>
            <ul>
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
};

RepoFiles.defaultProps = {
  repo: {},
};

export default RepoFiles;