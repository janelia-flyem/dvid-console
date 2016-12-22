import React from 'react';
import {Router, Link} from 'react-router';
import ServerActions from '../actions/ServerActions';
import ErrorActions from '../actions/ErrorActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';
import {Table, Button, Glyphicon} from 'react-bootstrap';
import config from '../utils/config';

class RepoList extends React.Component {

  neuroGlancerHandler(uuid, event) {
    var self = this;

    event.preventDefault();

    // display an error message if uuid is missing.
    if(!uuid) {
      ErrorActions.update('Unable to find master node');
      return;
    }

    //try to get master uuid if available.
    ServerActions.fetchMaster({
      uuid: uuid,
      callback: function(data) {
        self._redirectToNeuroGlancer(data[0], true);
      },
      error: function(e) {
        if (e.status == 400 || e.toString().includes('400') || e.toString().includes('404')) {
          // there was no branches repo, so just use the master uuid.
          self._redirectToNeuroGlancer(uuid, false);
        }
      }
    });
  }

  _redirectToNeuroGlancer(uuid, hasMaster) {

    if (uuid.length < 32) {
      // we dont have a full length uuid, so we need to get it
      var repo_list = [];
      var re = new RegExp("^" + uuid)

      for (var key in this.props.repos) {
        if (this.props.repos.hasOwnProperty(key)) {
          if (this.props.repos[key]) {
            if (this.props.repos[key].hasOwnProperty('DAG')) {
              for (var rkey in this.props.repos[key].DAG.Nodes) {
                if (re.test(rkey)) {
                  uuid = rkey;
                }
              }
            }
          }
        }
      }
    }

    ErrorActions.clear();
    //try to get the master segmentation
    if (!hasMaster){
      this._redirectGlancerNoLabel(uuid)
    }
    ServerActions.fetchDefaultInstances({
      uuid: uuid,
      callback: function(default_instances){
        if(default_instances.segmentation){
          var seg_layer = "_%27" + default_instances.segmentation + "%27:{%27type%27:%27segmentation%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ uuid + "/" + default_instances.segmentation + "%27}"
        }
        var img_layer = "%27grayscale%27:{%27type%27:%27image%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ uuid + "/grayscale%27}"
        var perspective = "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64"
        var glancer_url = "/neuroglancer/#!{%27layers%27:{" + img_layer + seg_layer + "}_" + perspective +"}"

        window.location.href = glancer_url
      },
      err: function(){
        this._redirectGlancerNoLabel(uuid)
      }.bind(this)
    })

  }

  _redirectGlancerNoLabel(uuid){
    // generate a new url with the choices made and ...
    // redirect the browser
    var glancer_url = "/neuroglancer/#!{%27layers%27:{%27grayscale%27:{%27type%27:%27image%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ uuid + "/grayscale%27}}}"
    window.location.href = glancer_url
  }



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
              <th>Neuroglancer</th>
              </tr>
            </thead>
            <tbody>
            {repo_list.map((repo, i) => {
              if (repo) {

                var port = window.location.port || "80"

                var host_string = window.location.hostname + ":" + port;

                var glancer_url = "/neuroglancer/#!{%27layers%27:{%27grayscale%27:{%27type%27:%27image%27_%27source%27:%27dvid://http://" + host_string + "/"+ repo.Root + "/grayscale%27}}}"
                var neuroClick = this.neuroGlancerHandler.bind(this, repo.Root)

                return (
                  <tr key={i}>
                    <td><Link to="repo" params={{uuid: repo.Root}}>{repo.Alias}</Link></td>
                    <td>{repo.Description}</td>
                    <td><Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link></td>
                    <td>{moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</td>
                    <td><a onClick={neuroClick}>View volumetric data</a></td>
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
