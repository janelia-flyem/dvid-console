import { useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import LoadingButton from '@mui/lab/LoadingButton';
import { useQuery, useMutation, useQueryClient } from "react-query";
import { repoInfo, serverCompiledTypes } from "./lib/dvid";

export default function DataInstanceAdd({ uuid, dag }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // properties used to create the new data instance
  const [versioned, setVersioned] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const { isLoading, isError, data, error } = useQuery(
    "serverCompiledTypes",
    serverCompiledTypes
  );

  const instanceMutation = useMutation(payload => {
    return repoInfo({
      uuid,
      endpoint: "instance",
      method: "post",
      data: payload,
    });
  }, {
    onSuccess:() => {
      queryClient.invalidateQueries('repoInfo');
      handleClose();
    }
  });

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return <p>Error Loading: {error.message}</p>;
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const nodeLocked = dag.Nodes[uuid] && dag.Nodes[uuid].Locked;

  const typeOptions = Object.keys(data).map((type) => {
    return (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    );
  });

  const handleVersionedChange = (event) => {
    setVersioned(event.target.checked);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleSubmit = () => {
    const payload = {
      typename: type,
      dataname: name,
      versioned: versioned ? "1" : "0",
    };

    instanceMutation.mutate(payload);
  };

  return (
    <>
      <Tooltip
        placement="left"
        title={
          nodeLocked
            ? "It is not possible to add a data instance to a locked node. Please select an unlocked node from the DAG above."
            : ""
        }
      >
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled={nodeLocked}
            onClick={handleOpen}
          >
            Add Data Instance
          </Button>
        </span>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Data Instance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a unique name, type and versioned status for the new
            instance.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Instance Name"
              type="name"
              fullWidth
              variant="standard"
              value={name}
              onChange={handleNameChange}
            />

            <FormControl fullWidth>
              <InputLabel id="instanceTypeLabel">Type</InputLabel>
              <Select
                labelId="instanceTypeLabel"
                id="instanceType"
                label="Type"
                value={type}
                onChange={handleTypeChange}
              >
                {typeOptions}
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={versioned}
                    onChange={handleVersionedChange}
                  />
                }
                label="Versioned"
              />
            </FormGroup>
          </Stack>
          {instanceMutation.isError ? <Alert severity="error">{instanceMutation?.error?.response.data || instanceMutation.error.message}</Alert> : ""}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton loading={instanceMutation.isLoading} variant="contained" onClick={handleSubmit}>
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
