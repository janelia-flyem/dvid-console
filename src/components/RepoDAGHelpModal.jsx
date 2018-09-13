import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import IconButton from '@material-ui/core/IconButton';
import QuestionIcon from '@material-ui/icons/HelpOutline';
import LockedIcon from '@material-ui/icons/Lock';
import UnlockedIcon from '@material-ui/icons/LockOpen';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';

import './RepoDAGHelpModal.css';

const styles = {
  centered: {
    textAlign: 'center',
  },
};

class ResponsiveDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { fullScreen, classes } = this.props;
    const { open } = this.state;

    return (
      <div className="dag-help">
        <Tooltip title="Help">
          <IconButton color="primary" onClick={this.handleClickOpen}>
            <QuestionIcon />
          </IconButton>
        </Tooltip>

        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Version Graph Help</DialogTitle>
          <DialogContent>
            <DialogContentText>
            The version graph lets you navigate your repo history and see what data is associated with each node.
                If the data is ediTable, you can also commit and branch nodes using this interface.
            </DialogContentText>
            <h4>Graph key</h4>
            <Table className="Table Table-condensed">
              <TableBody>
                <TableRow>
                  <TableCell className={classes.centered}>
                    <LockedIcon />
                  </TableCell>
                  <TableCell>
                    Indicates node is locked, which means changes cannot be made to the data on this node.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.centered}>
                    <UnlockedIcon />
                  </TableCell>
                  <TableCell>
                    Indicates node is unlocked, which means changes can be made to the data on this node.
                    If the data is ediTable, clicking this icon will lock the node.
                  </TableCell>
                </TableRow>
                {this.props.isEdiTable &&
                  (<TableRow>
                  <TableCell>
                    <span className="fa fa-code-fork"></span>
                  </TableCell>
                  <TableCell>
                    Node can be branched. Clicking this icon will branch the node, which creates a direct descendant node.
                  </TableCell>
                </TableRow>)}
                <TableRow>
                  <TableCell>
                     <Chip label="hover" />
                  </TableCell>
                  <TableCell className={classes.centered}>
                    Hovering over a node will reveal the commit message that was used to lock the node, if locked.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.centered}>
                     <Chip label="click" />
                  </TableCell>
                  <TableCell>
                    Click a node to navigate to that node and see its associated files and arrays.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Got It!
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ResponsiveDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withMobileDialog()(ResponsiveDialog));
