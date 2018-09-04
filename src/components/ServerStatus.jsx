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
  ResponsiveContainer,
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

// Determine the scale for each type of monitoring on y-axis.
const datasetYScale = {
  'key bytes read': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'key bytes written': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'value bytes read': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'value bytes written': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'file bytes read': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'file bytes written': {
    scale: 1000000,
    units: 'MB/sec',
  },
  'handlers active': {
    scale: 1,
    units: '%',
  },
};

const totalPoints = 300;
const loadInterval = 1000;

// set up the initial array that will be used to plot the status.
// If it isn't prepopulated with empty data, it won't update the
// chart correctly.
let loadData = [];
for (let i = 0; i < totalPoints; i++) {
  loadData[i] = {};
}

let updateTimeout = null;

function formatData(dataset, value) {
  const yscale = datasetYScale[dataset];
  let scaled = value / yscale.scale;

  if (scaled < 0) {
    scaled = 0;
  }
  if (scaled > 100) {
    scaled = 100;
  }
  return scaled;
}


function convertStatus(status) {
  const dataPoint = {};
  Object.keys(status).forEach((dataset) => {
    if (dataset in datasetYScale) {
      dataPoint[dataset] = formatData(dataset, status[dataset]);
      dataPoint.name = new Date();
    }
  });
  loadData.push(dataPoint);
  // trim the first item off
  loadData = loadData.slice(1);

  return loadData;
}

class ServerStatus extends React.Component {
  componentDidMount() {
    this.updateLoadStats();
  }

  componentWillUnmount() {
    // this stops the plot from updating while no one is looking at the page.
    window.clearTimeout(updateTimeout);
  }

  updateLoadStats() {
    const { actions } = this.props;
    actions.loadStatus();
    updateTimeout = setTimeout(this.updateLoadStats.bind(this), loadInterval);
  }

  render() {
    const { classes, status } = this.props;

    const data = convertStatus(status);

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
                <ResponsiveContainer width="90%" height={300}>
                  <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis
                      ticks={[25, 50, 75, 100]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="key bytes read" stroke="#8884d8" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="key bytes written" stroke="#8856a7" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="value bytes read" stroke="#43a2ca" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="value bytes written" stroke="#a8ddb5" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="file bytes read" stroke="#f03b20" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="file bytes written" stroke="#feb24c" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="handlers active" stroke="#cccccc" isAnimationActive={false} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
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
  status: PropTypes.object.isRequired,
};

export default withStyles(styles)(ServerStatus);
