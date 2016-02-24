import React from 'react';
import {Router, Link} from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';
import {Table, Button, Glyphicon} from 'react-bootstrap';

class RepoList extends React.Component {
  render() {
    if (this.props.repos) {
      var repo_list = [];

      for (var key in this.props.repos) {
        if (this.props.repos.hasOwnProperty(key)) {
          if (this.props.repos[key]) {
            repo_list.push(this.props.repos[key]);
          }
        }
      }

      // sort the list so that the repositories with the most recent
      // changes are at the top.
      repo_list.sort(function(a,b){
        return new Date(b.Updated) - new Date(a.Updated);
      });

      var repoButtonText = <p>Please contact your server adminsitrator to have them create one.</p>;
      if (this.props.admin) {
        repoButtonText = <p>Use the "New Repository" button above to create one now.</p>;
      }

      if (repo_list.length === 0) {
        return (
          <div className="text-center empty">
            <h4>There have been no repositories created on this server.</h4>
            {repoButtonText}
          </div>
        );
      }
      else {
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
              if (repo) {
                return (
                  <tr key={i}>
                    <td><Link to="repo" params={{uuid: repo.Root}}>{repo.Alias}</Link></td>
                    <td>{repo.Description}</td>
                    <td><Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link></td>
                    <td>{moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</td>
                  </tr>
                );
              }
            })}
            </tbody>
          </Table>
        );
      }
    }

    return (
      <div><p>loading...</p></div>
    );
  }
}


class Home extends React.Component {

  constructor(props, context){
    super(props);
    context.router // will work
  }

  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    var admin = this.context.router.getCurrentQuery().admin;

    var newRepoBtn = '';
    if (admin) {
      var newRepoBtn = <Link to="newrepo" className="btn btn-default btn-sm"><Glyphicon glyph="plus"/> New Repository</Link>
    }

    return (
      <div className="homepage">
        <div className="row">
          <div className="col-sm-6">
            <h1>Repositories</h1>
          </div>
          <div className="col-sm-6 text-right newrepo">
            {newRepoBtn}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <AltContainer store={ServerStore}>
              <RepoList admin={admin}/>
            </AltContainer>
          </div>
        </div>
      </div>
    );
  }
}

Home.contextTypes = {
  router: React.PropTypes.func.isRequired
};

module.exports = Home;
