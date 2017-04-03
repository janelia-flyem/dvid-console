import React from 'react';
import ReactDOM from 'react-dom';
import AltContainer from 'alt-container';
import {Modal} from 'react-bootstrap';
import ModalStore from '../stores/ModalStore';
import {ModalTypes} from '../stores/ModalStore';
import ModalActions from '../actions/ModalActions';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore'
import ErrorActions from '../actions/ServerActions';
import LogActions from '../actions/LogActions';
import moment from 'moment';

class DAGmodals extends React.Component {

  branchNode() {
    ServerActions.branchNode({
      uuid: this.props.uuid,
      callback: ModalActions.closeModal
    });
  }


  commitNode(event) {
    var self = this;
    event.preventDefault();

    var logEntry = ReactDOM.findDOMNode(this.refs.commitLog).value;

    //update the log with the new log message.
    var currentLog = ServerStore.state.repo.DAG.Nodes[self.props.uuid].Log;
    // need a timestamp. It will be close to the server one, but off by a little
    // until the page reloads and fetches the data from the server. Important?
    var now = moment();
    currentLog.unshift(now.format() + '  ' + logEntry);

    ServerActions.commitNode({
      uuid: this.props.uuid,
      entry: logEntry,
      callback: function(data) {
          ModalActions.closeModal();
          LogActions.update({log: currentLog, uuid: self.props.uuid});
      },
      error: function(err) {
        ModalActions.closeModal();

        self.setState({showCommitModal: false});
        if (/locked node/.test(err)) {
          ErrorActions.update(new Error('You can not lock a node that is locked already.'));
        } else {
          ErrorActions.update(err);
        }
      }
    });
  }

  render(){
    return (
        <div>
          <Modal show={this.props.currentModal === ModalTypes.COMMIT_MODAL} onHide={ModalActions.closeModal}>
            <Modal.Header closeButton>
            <Modal.Title>Commit (lock) node {this.props.uuid}.</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="form-group">
                <input className="form-control" type="text" ref="commitLog" name="commit_log" id="commit_log" placeholder="Enter your new log message"/>
              </div>
              <div className="form-group">
                <button onClick={this.commitNode.bind(this)} className="btn btn-primary">Commit</button>
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={this.props.currentModal === ModalTypes.BRANCH_MODAL} onHide={ModalActions.closeModal}>
            <Modal.Header closeButton>
            <Modal.Title>Branch node {this.props.uuid}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p> Are you sure you want to branch this node? This will create a new unlocked child node.</p>
              <div className="form-group">
                <button onClick={this.branchNode.bind(this)} className="btn btn-primary">Branch</button>
              </div>
            </Modal.Body>
          </Modal>

            <Modal show={this.props.currentModal === ModalTypes.DAGINFO_MODAL} onHide={ModalActions.closeModal}>
            <Modal.Header closeButton>
            <Modal.Title>Version Graph Help</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p> The version graph lets you navigate your repo history and see what data is associated with each node.
              You can also commit and branch nodes using the version graph.
              </p>
              <h4>Graph key</h4>
              <table  className="table table-condensed">
              <tbody>
                <tr>
                  <td className="text-center">
                    <span className="fa fa-lock"></span>
                  </td>
                  <td>
                    Indicates node is locked, which means no more changes can be made to the data on this node.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <span className="fa fa-unlock"></span>
                  </td>
                  <td>
                    Indicates node is unlocked, which means changes can be made to the data on this node. 
                    Click this icon to lock the node.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <span className="fa fa-code-fork"></span>
                  </td>
                  <td>
                    Node can be branched. Clicking this icon will branch the node, which creates a direct descendant node.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <span className="label label-default">hover</span>
                  </td>
                  <td>
                    Hovering over a node will reveal the commit message that was used to lock the node, if locked.
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <p><span className="label label-default">click</span></p>
                  </td>
                  <td>
                    Click a node to navigate to that node and see its associated files and arrays.
                  </td>
                </tr>
              </tbody>
              </table>


            </Modal.Body>
          </Modal>
        </div>
    );
  }

}


class ConnectedDAGmodals extends React.Component {

  render() {
    return (
      <AltContainer store={ModalStore}>
        <DAGmodals lite={this.props.lite}/>
      </AltContainer>
    );
  }
};

module.exports = ConnectedDAGmodals;
