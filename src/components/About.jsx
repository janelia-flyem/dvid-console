// @format
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  github: {
    position: 'absolute',
    top: '63px',
    right: 0,
    border: 0,
  },
});

class About extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <a href="https://github.com/janelia-flyem/dvid">
          <img
            className={classes.github}
            src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"
            alt="Fork me on GitHub"
          />
        </a>
        <h3>Welcome to DVID</h3>

        <p>
          DVID documentation can be found on <a href="https://github.com/janelia-flyem/dvid">github</a> as well as the
          automatically updated <a href="https://godoc.org/github.com/janelia-flyem/dvid">Go Doc documentation</a>.
        </p>
        <p>
          DICED documentation can also be found on <a href="https://github.com/janelia-flyem/diced">github</a>.
        </p>

        <h4>HTTP API</h4>

        <p>
          Each data type within DVID exposes commands and an HTTP API allowing clients like this browser to retrieve and
          store data. Command-line and HTTP API documentation is currently distributed over a variety of data types.
          Visit the <a href="/api/help">/api/help HTTP endpoint</a> to review this server&apos;s current API.
        </p>

        <h3>Licensing</h3>
        <p>
          DVID is released under the{' '}
          <a href="http://janelia-flyem.github.com/janelia_farm_license.html">Janelia Farm license</a>, a
          <a href="http://en.wikipedia.org/wiki/BSD_license#3-clause_license_.28.22New_BSD_License.22_or_.22Modified_BSD_License.22.29">
            {' '}
            3-clause BSD license
          </a>
          .
        </p>
      </div>
    );
  }
}

About.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(About);
