import { useQuery } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import Grid from "@mui/material/Grid";
import StatsCard from "./StatsCard";
import { serverInfo } from "./lib/dvid";

export default function ServerStats({ repos }) {
  const { isLoading, isError, data, error } = useQuery(
    "serverInfo",
    serverInfo
  );

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return <p>Error Loading: {error}</p>;
  }

  const gitLink = "https://github.com/janelia-flyem/dvid/";

  let serverUptime = 0;
  if (data["Server uptime"]) {
    serverUptime = data["Server uptime"].split(".", 1);
  }

  let versionNodes = 0;

  Object.keys(repos).forEach((key) => {
    const repo = repos[key];
    if (repo && repo.DAG) {
      versionNodes += Object.keys(repo.DAG.Nodes).length;
    }
  });

  const stats = [
    {
      name: "DVID CPU CORES",
      value: `${data.Cores || 0} out of ${data["Maximum Cores"] || 0}`,
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "Repositories",
      value: Object.keys(repos).length,
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "Server Uptime",
      value: `${serverUptime}s`,
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "Version Nodes",
      value: versionNodes,
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "DVID Version",
      value: (
        <a href={`${gitLink}/releases/tag/${data["DVID Version"]}`}>
          {data["DVID Version"] || "unknown"}
        </a>
      ),
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "Storage Backend",
      value: data["Storage backend"] || "unknown",
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "DataStore Version",
      value: data["Datastore Version"] || "0.0.0",
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
    {
      name: "Console Version",
      value: process.env.REACT_APP_VERSION,
      icon: <FontAwesomeIcon icon={faGear} size="xl" />,
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((data) => (
        <StatsCard key={data.name} data={data} />
      ))}
    </Grid>
  );
}
