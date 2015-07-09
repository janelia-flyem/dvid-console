import React from 'react';
import {Router, Link} from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';

class RepoList extends React.Component {
  render() {
    if (this.props.repos.length) {
      return (
        <ul>
          {this.props.repos.map((repo, i) => {
            return (
              <li key={i}><Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link> - {repo.Updated}</li>
            );
          })}
        </ul>
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
