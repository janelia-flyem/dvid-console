import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormControl from '@material-ui/core/FormControl';

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
  select: {
    color: 'rgba(255,255,255,0.5)',
  },
};

const AdminLink = props => <Link to="/admin" {...props} />;
const AboutLink = props => <Link to="/about" {...props} />;
const HomeLink = props => <Link to="/" {...props} />;

class Navigation extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.loadRepos();
  }

  handleChange = (event) => {
    const { history } = this.props;
    history.push(`/${event.target.value}`);
  }

  render() {
    const { classes, repos, match } = this.props;

    const options = Object.values(repos).map((repo) => {
      const name = repo.Alias;
      return (<option key={name} value={name}>{name}</option>);
    });

    return (
      <div>
        <AppBar position="sticky" key="appbar">
          <Toolbar>
            <Button component={HomeLink} color="inherit">
              <Typography color="inherit">
                DVID
              </Typography>
            </Button>
            <FormControl className={classes.flex}>
              <NativeSelect
                className={classes.select}
                value={match.params.name}
                onChange={this.handleChange}
              >
                <option value="">Select a repository</option>
                {options}
              </NativeSelect>
            </FormControl>
            <IconButton
              component={AdminLink}
              color="inherit"
            >
              <span className="fas fa-cogs" />
            </IconButton>
            <IconButton
              component={AboutLink}
              color="inherit"
            >
              <span className="far fa-info-circle" />
            </IconButton>

          </Toolbar>
        </AppBar>
        {this.props.children}
      </div>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  repos: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Navigation));
