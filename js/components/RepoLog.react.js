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
      return (
        <Table striped>
          <tbody>
            {this.props.current.map(function(entry, i) {
              return <LogEntry key={i} entry={entry}/>
            })}
          </tbody>
        </Table>
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
      <div className="log">
        <AltContainer store={LogStore}>
          <LogTable />
        </AltContainer>
      </div>
    );
  }
}

module.exports = RepoLog;
