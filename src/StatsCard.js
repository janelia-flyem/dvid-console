import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";

import "./StatsCard.css";

export default function StatsCard({ data }) {
  return (
    <Grid item xs={3}>
      <Card className="statsCard">
        <CardHeader title={data.name} action={data.icon} />
        <CardContent>
          <p>{data.value}</p>
        </CardContent>
      </Card>
    </Grid>
  );
}
