import React from 'react';
import Router from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';


class LogEntry extends React.Component {
  render(){
    var entry = this.props.entry.split(/\s(.+)/);
    return (
      <tr>
        <td className="timestamp">{moment(entry[0]).format("MMM Do YYYY, h:mm:ss a")}</td>
        <td>{entry[1]}</td>
      </tr>
    );
  }
}


class RepoLog extends React.Component {

  render(){
    return (
      <div className="log">
        <table>
          <tbody>
            {this.props.log.map(function(entry, i) {
              return <LogEntry key={i} entry={entry}/>
            })}
          </tbody>
        </table>
      </div>
    );
  }

}

class RepoDetails extends React.Component {
  render() {
    if (this.props.repos && this.props.repos.hasOwnProperty(this.props.uuid)) {
      var repo = this.props.repos[this.props.uuid];
      return (
        <div>
          <h3>{repo.Root}</h3>
          <p>Created: {moment(repo.Created).format("MMM Do YYYY, h:mm:ss a")}</p>
          <p>Updated: {moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</p>
          <p>Log:</p>

          <RepoLog log={repo.Log}/>

          <div className="dag">
          </div>
        </div>
      );
    }

    return (
      <div></div>
    );
  }
}


class Repo extends React.Component {
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    return (
      <div>
        <h2>Repo</h2>
        <AltContainer store={ServerStore} >
          <RepoDetails uuid={this.props.params.uuid}/>
        </AltContainer>
      </div>
    );
  }
}

module.exports = Repo;
