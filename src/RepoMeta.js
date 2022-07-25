import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

export default function RepoMeta({ repo, currentUUID }) {

  return (
    <>
      <Grid item xs={6}>
        <h3>{repo.Alias || "<Nameless Repo>"}</h3>
        <p>{repo.Description}</p>
        <p>
          <b>UUID: </b>
          <Link to={`/repo/${currentUUID}`}>{currentUUID}</Link>
        </p>
      </Grid>
      <Grid item xs={6}>
        <p>
          <b>Root UUID:</b>{" "}
          <Link to={`/repo/${repo.Root}`}>
            {repo.Root}
          </Link>
        </p>
        <p>
          <b>Created:</b>{" "}
          {format(new Date(repo.Created), "MMM do yyyy, h:mm:ss a")}
        </p>
        <p>
          <b>Updated:</b>{" "}
          {format(new Date(repo.Updated), "MMM do yyyy, h:mm:ss a")}
        </p>
      </Grid>
    </>
  );
}
