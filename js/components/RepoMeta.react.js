import React from 'react';
import moment from 'moment';
import {Router, Link} from 'react-router';

class RepoMeta extends React.Component {
  render () {
    var repo = this.props.repo;

    if (repo.DAG.Nodes.hasOwnProperty(this.props.uuid)) {
      return (
        <div className="repometa row">
          <div className="col-sm-6">
            <h3>{repo.Alias || "<Nameless Repo>"}</h3>
            <p>{repo.Description}</p>
            <p><b>UUID:</b> <Link to="repo" params={{uuid: this.props.uuid}}>{this.props.uuid}</Link></p>
          </div>
          <div className="col-sm-6 text-right">
            <p><b>Root UUID:</b> <Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link></p>
            <p><b>Created:</b> {moment(repo.Created).format("MMM Do YYYY, h:mm:ss a")}</p>
            <p><b>Updated:</b> {moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</p>
          </div>
        </div>
      );

    }
    else {
      return (
        <div className="repometa row">
          <div className="col-sm-6">
            <h3>Loading...</h3>
            <p>...</p>
            <p><b>UUID:</b> </p>
          </div>
          <div className="col-sm-6 text-right">
            <p><b>Root UUID:</b></p>
            <p><b>Created:</b> </p>
            <p><b>Updated:</b> </p>
          </div>
        </div>
      );

    }
  }
}

module.exports = RepoMeta;
