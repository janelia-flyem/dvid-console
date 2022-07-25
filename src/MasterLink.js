import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { masterUUID } from "./lib/dvid";

export default function MasterLink({ rootUUID, alias }) {
  const { isLoading, isError, data, error } = useQuery(
    ["masterUUID", rootUUID],
    () => masterUUID(rootUUID),
    {retry: false}
  );

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return <Link to={`/repo/${rootUUID}`}>{alias}</Link>;
  }

  return <Link to={`/repo/${data[0]}`}>{alias}</Link>;
}
