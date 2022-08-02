import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useMutation, useQueryClient } from "react-query";
import { createRepo } from "./lib/dvid";

export default function CreateRepo() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const repoMutation = useMutation(() => {
    return createRepo({
      alias: name,
      description
    });
  }, {
    onSuccess:() => {
      queryClient.invalidateQueries('repoList');
      handleClose();
    }
  });

  const handleSubmit = () => {
    repoMutation.mutate();
  };

  return (
    <>
    <Button variant="contained" onClick={handleOpen}>Create Repo</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create a New Repository</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a unique name and useful description.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Repository Name"
              type="name"
              fullWidth
              variant="standard"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Description"
              type="name"
              fullWidth
              variant="standard"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            </Stack>


        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            // loading={instanceMutation.isLoading}
            variant="contained"
            onClick={handleSubmit}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
