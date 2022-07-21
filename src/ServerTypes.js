import { useQuery } from "react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { serverCompiledTypes } from "./lib/dvid";

export default function ServerTypes() {
  const { isLoading, isError, data, error } = useQuery(
    "serverCompiledTypes",
    serverCompiledTypes
  );

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return <p>Error Loading: {error}</p>;
  }

  const typeList = [];
  Object.keys(data).forEach((key) => {
    const type = data[key];
    typeList.push(
      <li key={key}>
        <b>{key}</b>: {type}
      </li>
    );
  });

  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader title="Installed Data Types" />
        <CardContent>
          <ul>{typeList}</ul>
        </CardContent>
      </Card>
    </Grid>
  );
}
