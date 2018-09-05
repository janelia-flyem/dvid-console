import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
  },
});

class ServerTypes extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.loadTypes();
  }

  render() {
    const { classes, types } = this.props;

    const typeList = [];

    Object.keys(types).forEach((key) => {
      const type = types[key];
      typeList.push(<li key={key}><b>{key}</b>: {type}</li>);
    });

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Installed Data Types"
              />
              <CardContent>
                <ul>
                  {typeList}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

ServerTypes.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired,
};

export default withStyles(styles)(ServerTypes);
