import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { useInterval } from "./hooks";
import { serverLoad } from "./lib/dvid";

const totalPoints = 300;
const loadInterval = 1000;

// Determine the scale for each type of monitoring on y-axis.
const datasetYScale = {
  "key bytes read": {
    scale: 1000000,
    units: "MB/sec",
  },
  "key bytes written": {
    scale: 1000000,
    units: "MB/sec",
  },
  "value bytes read": {
    scale: 1000000,
    units: "MB/sec",
  },
  "value bytes written": {
    scale: 1000000,
    units: "MB/sec",
  },
  "file bytes read": {
    scale: 1000000,
    units: "MB/sec",
  },
  "file bytes written": {
    scale: 1000000,
    units: "MB/sec",
  },
  "handlers active": {
    scale: 1,
    units: "%",
  },
};

// set up the initial array that will be used to plot the status.
// If it isn't prepopulated with empty data, it won't update the
// chart correctly.
let loadData = [];
for (let i = 0; i < totalPoints; i++) {
  loadData[i] = {};
}

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

export default function ServerStatus() {
  const [data, setData] = useState([]);
  useInterval(() => {
    // get load information from server
    serverLoad().then((data) => {
      // convert it to correct format
      const converted = convertStatus(data);
      // save it to state.
      setData(converted);
    });
  }, loadInterval);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card raised>
          <CardHeader title="Monitoring" />
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
                <YAxis ticks={[25, 50, 75, 100]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="key bytes read"
                  stroke="#8884d8"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="key bytes written"
                  stroke="#8856a7"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value bytes read"
                  stroke="#43a2ca"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value bytes written"
                  stroke="#a8ddb5"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="file bytes read"
                  stroke="#f03b20"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="file bytes written"
                  stroke="#feb24c"
                  isAnimationActive={false}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="handlers active"
                  stroke="#cccccc"
                  isAnimationActive={false}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
