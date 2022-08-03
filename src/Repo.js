import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import Grid from "@mui/material/Grid";
import { repoInfo } from "./lib/dvid";
import RepoMasterLoad from "./RepoMasterLoad";

function getFullUUIDinRepo(repo, shortuuid) {
  if (repo === null) {
    return shortuuid;
  }
  for (var id in repo.DAG.Nodes) {
    if (RegExp("^" + shortuuid).test(id)) {
      //no need to update repo--uuid is in current repo
      return id;
    }
  }
  return shortuuid;
}

export default function Repo() {
  const { repoId } = useParams();
  const [fullRepoId, setFullRepoId] = useState(null);
  const { isLoading, isError, data, error } = useQuery(
    ["repoInfo", repoId],
    () => repoInfo({ uuid: repoId, endpoint: "info" }),
    {
      placeholderData: {
        Alias: "loading",
        Description: "loading",
        Root: repoId,
        DataInstances: {},
        DAG: {
          Root: repoId,
          Nodes: {
            [repoId]: {
              Note: "loading",
              UUID: "Loading",
              Children: [],
              Log: [],
              Parents: [],
              VersionID: 1
            }
          }
        },
        Created: "1900-10-11",
        Updated: "1900-10-11",
        Log:[]
      },
    }
  );

  useEffect(() => {
    if (data) {
      setFullRepoId(getFullUUIDinRepo(data, repoId));
    }
  }, [repoId, data]);

  if (isLoading) {
    return <p>Loading Repo</p>;
  }

  if (isError) {
    return <p>Error Loading: {error.message}</p>;
  }

  if (!fullRepoId) {
    return <p>Loading Repo Id</p>;
  }

  return (
    <div style={{ padding: "1em" }}>
      <Grid container spacing={2}>
        <RepoMasterLoad repoId={fullRepoId} repoInfo={data} />
      </Grid>
    </div>
  );
}
