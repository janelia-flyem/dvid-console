import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import AboutIcon from '@material-ui/icons/Info';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

const AdminLink = props => <Link to="/admin" {...props} />;
const AboutLink = props => <Link to="/about" {...props} />;
const HomeLink = props => <Link to="/" {...props} />;

class Navigation extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <AppBar position="sticky" key="appbar">
        <Toolbar>
          <Button component={HomeLink} className={classes.flex} color="inherit">
            <Typography variant="title" color="inherit" className={classes.flex}>
              DVID
            </Typography>
          </Button>
          <IconButton
            component={AdminLink}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            component={AboutLink}
            color="inherit"
          >
            <AboutIcon />
          </IconButton>

        </Toolbar>
      </AppBar>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navigation);
