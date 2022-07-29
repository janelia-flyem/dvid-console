import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function DAGHelp({ isEditable }) {
  const [open, setOpen] = useState(false);

  const handleHelp = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Graph Help">
        <IconButton onClick={handleHelp}>
          <FontAwesomeIcon icon={faCircleQuestion} size="sm" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Version Graph Help</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The version graph lets you navigate your repo history and see what
            data is associated with each node. If the data is editable, you can
            also commit and branch nodes using this interface.
            <h4>Graph key</h4>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td className="text-center">
                    <span className="fa fa-lock"></span>
                  </td>
                  <td>
                    Indicates node is locked, which means changes cannot be made
                    to the data on this node.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <span className="fa fa-unlock"></span>
                  </td>
                  <td>
                    Indicates node is unlocked, which means changes can be made
                    to the data on this node. If the data is editable, clicking
                    this icon will lock the node.
                  </td>
                </tr>
                {isEditable && (
                  <tr>
                    <td className="text-center">
                      <span className="fa fa-code-fork"></span>
                    </td>
                    <td>
                      Node can be branched. Clicking this icon will branch the
                      node, which creates a direct descendant node.
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="text-center">
                    <span className="label label-default">hover</span>
                  </td>
                  <td>
                    Hovering over a node will reveal the commit message that was
                    used to lock the node, if locked.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <p>
                      <span className="label label-default">click</span>
                    </p>
                  </td>
                  <td>
                    Click a node to navigate to that node and see its associated
                    files and arrays.
                  </td>
                </tr>
              </tbody>
            </table>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
