import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useQuery } from "react-query";
import { getRepos } from "./lib/dvid";
import ServerStats from "./ServerStats";
import ServerTypes from "./ServerTypes";
import ServerStatus from "./ServerStatus";

export default function Admin() {
  const { isLoading, isError, data, error } = useQuery("repoList", getRepos);
  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return <p>Error Loading: {error}</p>;
  }


  return (
    <div style={{ padding: "1em" }}>
      <Typography variant="h4">Server Stats</Typography>
    	<Grid container spacing={2}>
				<ServerStats repos={data}/>
				<ServerStatus/>
				<ServerTypes/>
			</Grid>
    </div>
  );
}
