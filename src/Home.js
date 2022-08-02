import Typography from "@mui/material/Typography";
import { useQuery } from "react-query";
import { format } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import { getRepos } from "./lib/dvid";
import MasterLink from "./MasterLink";
import CreateRepo from "./CreateRepo";

import "./Home.css";

export default function Home() {
  const [searchParams] = useSearchParams();
  const { isLoading, isError, data, error } = useQuery("repoList", getRepos);

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return (
      <p>
        Error Loading repo info from the server @ /repos/info: {error.message}
      </p>
    );
  }

  const showCreateButton =
    searchParams.get("admin") || Object.keys(data).length < 1;

  return (
    <Grid container spacing={2} style={{ padding: "1em" }}>
      <Grid item xs={12} sm={9}>
        <Typography variant="h3" sx={{ flexGrow: 1 }}>
          Repositories
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
        {showCreateButton ? <CreateRepo /> : ""}
      </Grid>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alias</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Root UUID</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Neuroglancer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(data)
              .sort((a, b) =>
                a.Alias.localeCompare(b.Alias, "en", { numeric: true })
              )
              .map((repo) => (
                <TableRow key={repo.Root}>
                  <TableCell>
                    <MasterLink rootUUID={repo.Root} alias={repo.Alias} />
                  </TableCell>
                  <TableCell>{repo.Description}</TableCell>
                  <TableCell>
                    <Link to={`/repo/${repo.Root}`}>{repo.Root}</Link>
                  </TableCell>
                  <TableCell>
                    {format(new Date(repo.Updated), "MMM do y, h:mm:ss aaaa")}
                  </TableCell>
                  <TableCell>
                    <a href="">View volumetric data</a>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}
