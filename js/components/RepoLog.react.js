import React from 'react';
import moment from 'moment';
import {Table} from 'react-bootstrap';

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


class RepoLog extends React.Component {

  render(){
    this.props.log.reverse();
    return (
      <div className="log">
        <Table striped>
          <tbody>
            {this.props.log.map(function(entry, i) {
              return <LogEntry key={i} entry={entry}/>
            })}
          </tbody>
        </Table>
      </div>
    );
  }

}

module.exports = RepoLog;
