import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import dvid from 'dvid';
import { getHostName, getPort, getProtocol } from '../settings';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  cardHeader: {
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    padding: '0.5em 2em',
  },
});


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
        host: getHostName(),
        port: getPort(),
        protocol: getProtocol(),
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
    const { classes } = this.props;
    let content = 'loading...';
    if (readme) {
      content = <ReactMarkdown children={readme} />;
    } else if (error) {
      content = "You don't have a readme yet. Create one and upload to the .files keyvalue.";
    }

    const title = <Typography variant="title"><Icon className={classNames('fas fa-file-alt')} style={{ fontSize: 16 }} /> README.md</Typography>;

    return (
      <Card>
        <CardHeader title={title} className={classes.cardHeader} />
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }
}

ReadMe.propTypes = {
  id: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

ReadMe.defaultProps = {
  id: null,
};

export default withStyles(styles)(ReadMe);
