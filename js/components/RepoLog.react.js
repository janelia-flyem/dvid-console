import React from 'react';
import moment from 'moment';
import {Table} from 'react-bootstrap';
import LogStore from '../stores/LogStore';
import LogActions from '../actions/LogActions';
import AltContainer from 'alt/AltContainer';

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

  render() {

    if (this.props.current) {
      var log = this.props.current;
      var span = null;

      if (log.length > 1) {
        var oldest = moment(log[0].split(' ', 1)[0]);
        var newest = moment(log[log.length -1].split(' ', 1)[0]);
        var span = 'covering ' + moment.duration(newest.diff(oldest)).humanize();
      }
      return (
        <div>
          <div className="row">
            <div className="col-sm-6">
              <p><b>Log:</b></p>
            </div>
            <div className="col-sm-6 text-right">
              <p>{log.length} {log.length > 1 ? 'entries':' entry'} {span}</p>
            </div>
          </div>
          <div className="log">
            <Table striped>
              <tbody>
                {log.map(function(entry, i) {
                  return <LogEntry key={i} entry={entry}/>
                })}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }
  }
}


class RepoLog extends React.Component {
  componentDidMount() {
    this.props.log.reverse();
    LogActions.init(this.props.log);
  }

  render(){
    return (
      <AltContainer store={LogStore}>
        <LogTable />
      </AltContainer>
    );
  }
}

module.exports = RepoLog;
