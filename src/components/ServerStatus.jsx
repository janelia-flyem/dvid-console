import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
  },
});

const loadInterval = 1000;
let updateTimeout = null;

class ServerStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {
    const { actions } = this.props;
    actions.loadStatus();
  }

  componentWillUnmount() {
    // this stops the plot from updating while no one is looking at the page.
    window.clearTimeout(updateTimeout);
  }

  updateLoadStats() {
    this.setState({ data: [] });
    updateTimeout = setTimeout(this.updateLoadStats.bind(this), loadInterval);
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Monitoring"
              />
              <CardContent>
                <div className="usageChart" />
                <LineChart
                  width={730}
                  height={250}
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fbr" stroke="#8884d8" />
                  <Line type="monotone" dataKey="fbw" stroke="#82ca9d" />
                </LineChart>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

ServerStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default withStyles(styles)(ServerStatus);
