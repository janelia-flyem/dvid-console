import React from 'react';
import moment from 'moment';
import {Modal, Table, Button} from 'react-bootstrap';
import LogStore from '../stores/LogStore';
import LogActions from '../actions/LogActions';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import ErrorActions from '../actions/ErrorActions';

class LogEntry extends React.Component {
  render(){
    var entry = this.props.entry.split(/\s(.+)/);
    var log_text = entry[1];
    if (log_text.length > 100) {
      log_text = log_text.substring(0,100) + '...';
    }

    return (
      <tr>
        <td className="timestamp">{moment(entry[0]).format("MMM Do YYYY, h:mm:ss a")}</td>
        <td>{log_text}</td>
      </tr>
    );
  }
}

class LogTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogModal: false
    };
  }

  handleLogRestore(e) {
    LogActions.revert();
    e.preventDefault();
  }

  openLogModal(e) {
    e.preventDefault();
    this.setState({showLogModal: true});
  }

  closeLogModal(e) {
    e.preventDefault();
    this.setState({showLogModal: false});
  }

  saveLogEntry(e) {
    var self = this;
    e.preventDefault();

    var isRepo = self.props.uuid ? false : true;
    var uuid = self.props.uuid || self.props.repo_uuid;

    // get the new log entry out of the form
    var logEntry = React.findDOMNode(this.refs.newLog).value;
    // call method on the dvid api to save the log
    // trigger a re-render of the table.
    ServerActions.addLog({
      entry: logEntry,
      uuid: uuid,
      isRepo: isRepo,
      callback: function(data) {
        if (isRepo) {
          LogActions.init({log: data.Log, uuid: uuid});
        } else {
          LogActions.update({log: data.DAG.Nodes[self.props.uuid].Log, uuid: self.props.uuid});
        }
        ErrorActions.clear();
        // close the modal dialogue
        self.setState({showLogModal: false});
      },
      error: function(err) {
        self.setState({showLogModal: false});
        if (/locked node/.test(err)) {
          ErrorActions.update(new Error('You can not add a log entry to a locked node.'));
        } else {
          ErrorActions.update(err);
        }
      }
    });
  }


  render() {

    var log = [];

    if (this.props.current) {
      log = this.props.current;
    }

    var span = null,
      restore = null,
      title = <span><b>Repo Log:</b></span>,
      modalTitle = <Modal.Title>Add a new entry to the repo log</Modal.Title>;

    if (log.length > 1) {
      var oldest = moment(log[0].split(' ', 1)[0]);
      var newest = moment(log[log.length -1].split(' ', 1)[0]);
      var span = 'covering ' + moment.duration(newest.diff(oldest)).humanize();
    }

    if (this.props.current[0] !== this.props.orig[0] ) {
      title = <span><b id="nodelogtext">Node Log for {this.props.uuid}: </b> <a className="" href="" onClick={this.handleLogRestore}><small>restore repo log</small></a></span>;
      modalTitle = <Modal.Title>Add a log entry for node {this.props.uuid}</Modal.Title>;
    }

    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            {title}
            <span className="pull-right">{log.length} {log.length == 1 ? ' entry' : ' entries'} {span} <a className="btn btn-xs btn-default" href="" onClick={this.openLogModal.bind(this)}>Add entry</a></span>
          </div>
          <div className="panel-body log">
          <Table striped>
            <tbody>
              {log.map(function(entry, i) {
                return <LogEntry key={i} entry={entry}/>
              })}
            </tbody>
          </Table>
          </div>
        </div>
        <Modal show={this.state.showLogModal} onHide={this.closeLogModal.bind(this)}>
          <Modal.Header closeButton>
          {modalTitle}
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <input className="form-control" type="text" ref="newLog" name="new_log" id="new_log" placeholder="Enter your new log message"/>
            </div>
            <div className="form-group">
              <button onClick={this.saveLogEntry.bind(this)} className="btn btn-primary">Add</button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}


class RepoLog extends React.Component {
  componentDidMount() {
    LogActions.init({log: this.props.log, uuid: this.props.uuid});
  }

  render(){
    return (
      <AltContainer store={LogStore}>
        <LogTable/>
      </AltContainer>
    );
  }
}

module.exports = RepoLog;
