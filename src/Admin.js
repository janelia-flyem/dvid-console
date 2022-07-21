import Typography from "@mui/material/Typography";
import ServerStats from "./ServerStats";
import ServerTypes from "./ServerTypes";

export default function Admin() {
  return (
    <div style={{ padding: "1em" }}>
      <Typography variant="h4">Server Stats</Typography>
      <ServerStats/>
      <ServerTypes/>
    </div>
  );
}
