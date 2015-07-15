import React from 'react';
import {Router, Link} from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';
import {Table} from 'react-bootstrap';

class RepoList extends React.Component {
  render() {
    if (this.props.repos) {
      var repo_list = [];
      for (var key in this.props.repos) {
        if (this.props.repos.hasOwnProperty(key)) {
          repo_list.push(this.props.repos[key]);
        }
      }

      return (
        <Table striped bordered condensed>
          <thead>
            <tr>
            <th>Alias</th>
            <th>Description</th>
            <th>Root UUID</th>
            <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
          {repo_list.map((repo, i) => {
            return (
              <tr key={i}>
                <td>{repo.Alias}</td>
                <td>{repo.Description}</td>
                <td><Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link></td>
                <td>{moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      );
    }

    return (
      <div><p>loading...</p></div>
    );
  }
}


class Home extends React.Component {

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <h1>Repositories</h1>
        <RepoList/>
      </AltContainer>
    );
  }
}

module.exports = Home;
