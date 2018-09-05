import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import dvid from 'dvid';
import settings from '../settings.json';

class ReadMe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readme: null,
      error: null,
    };
  }

  componentDidMount() {
    this.loadReadMe();
  }

  componentDidUpdate(prevProps) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.loadReadMe();
    }
  }

  loadReadMe() {
    const { id } = this.props;
    if (id) {
      const api = dvid.connect({
        host: settings.dvid.host,
        port: settings.dvid.port,
        username: 'dvidconsole',
        application: 'dvidconsole',
      });

      api.node({
        uuid: id,
        endpoint: '.files/key/README.md',
        callback: data => this.setState({ readme: data }),
        error: err => this.setState({ error: err }),
      });
    }
  }

  render() {
    const { readme, error } = this.state;
    let content = 'loading...';
    if (readme) {
      content = <Markdown source={readme} />;
    } else if (error) {
      content = "You don't have a readme yet. Create one and upload to the .files keyvalue.";
    }
    return (
      <Card>
        <CardHeader title="README.md" />
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }
}

ReadMe.propTypes = {
  id: PropTypes.string,
};

ReadMe.defaultProps = {
  id: null,
};

export default ReadMe;
