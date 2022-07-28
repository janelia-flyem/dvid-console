import { useQuery } from "react-query";
import RepoMeta from "./RepoMeta";
import RepoLog from "./RepoLog";
import RepoDAG from "./RepoDAG";
import DataInstances from "./DataInstances";
import { masterUUID } from "./lib/dvid";

export default function RepoMasterLoad({ repoId, repoInfo }) {
  const { isLoading, data } = useQuery(
    ["masterUUID", repoId],
    () => masterUUID(repoId),
    { retry: false }
  );

  if (isLoading) {
    return <p>Loading Master UUID</p>;
  }

  const masterId = data ? data[0] : null;

  return (
    <>
      <RepoMeta repo={repoInfo} currentUUID={repoId} />
      <RepoLog log={repoInfo.Log} uuid={repoId} />
      <RepoDAG uuid={repoId} dag={repoInfo.DAG} masterUUID={masterId} />
      <DataInstances
        uuid={repoId}
        instances={repoInfo.DataInstances}
        dag={repoInfo.DAG}
      />
    </>
  );
}
