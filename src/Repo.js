import { useParams } from "react-router-dom";

export default function Repo() {
  const { repoId } = useParams();
  return <p>Repo: {repoId}</p>;
}
