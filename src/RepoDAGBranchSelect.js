import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import "./RepoDAGBranchSelect.css";

export default function RepoDAGBranchSelect({ nodes, branch="", onBranchChange }) {

  const handleChange = (event) => {
    onBranchChange(event.target.value);
  };

  const branches = [
    ...new Set(
      Object.values(nodes)
        .map((node) => node.Branch)
        .filter((node) => node !== "")
    ),
  ];
  const options = branches
    .sort()
    .map((branch) => <MenuItem value={branch}>{branch}</MenuItem>);

  // add master and show all options
  options.unshift(<MenuItem value="master">Master</MenuItem>);
  options.unshift(<MenuItem value="show_all">Show all</MenuItem>);

  return (
    <FormControl
      sx={{ m: 1, minWidth: 120 }}
      size="small"
      className="DAGBranchSelect"
    >
      <InputLabel id="demo-simple-select-label">Branch</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={branch}
        label="branch"
        onChange={handleChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}
