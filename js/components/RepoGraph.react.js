import React from 'react';
import Router from 'react-router';
import LogActions from '../actions/LogActions';
import moment from 'moment';

var RepoGraph  = React.createClass({
  mixins: [Router.Navigation],

  componentWillMount: function() {
    this.parseCommits(this.props);
  },

  componentDidMount: function(){
    this.drawGraph();
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.parseCommits(nextProps);
  },

  componentDidUpdate: function(){
    this.drawGraph();
  },

  parseCommits: function(props){

    var entries = [];
    if (props.repo.DAG.Nodes.hasOwnProperty(props.uuid)) {
      var nodes = props.repo.DAG.Nodes;
      var id_lookup = {};
      // convert the data structure into an array for sorting.
      for (var commit in nodes) {
        if ( nodes.hasOwnProperty(commit) ) {
          entries.push(nodes[commit]);
          id_lookup[nodes[commit].VersionID] = nodes[commit].UUID;
        }
      }

      // sort the entries by VersionID in descending order.
      entries.sort(function(a,b) {
        return b.VersionID - a.VersionID;
      });

      // build the data structure required for the graph drawing code.
      this.commits = [];
      for (var i = 0; i < entries.length; i++) {
        var commit = {
          sha: entries[i].UUID,
          parents: [],
          created: entries[i].Created,
          note: entries[i].Note,
          log: entries[i].Log,
          locked: entries[i].Locked,
          id: entries[i].VersionID
        };
        for (var j = 0; j < entries[i].Parents.length; j++) {
          commit.parents.push(id_lookup[entries[i].Parents[j]]);
        }
        this.commits.push(commit);
      }

    }
  },

  drawGraph: function() {
      var converted = generate_graph(this.commits);

      $('.commit-graph').commits({data: converted});
  },

  render: function () {
    var rows = [];
    if (this.commits) {
      for (var i = 0; i < this.commits.length; i++) {
        rows.push(<Commit key={i} data={this.commits[i]}/>);
      }
    }

    return (
      <div>
        <h4>Version Graph</h4>
        <div className="row">
          <div className="col-sm-2">
            <div className="commit-graph"></div>
          </div>
          <div className="col-sm-10">
            <ul className="graph_list">{rows}</ul>
          </div>
        </div>
      </div>
    );

  }

});

module.exports = RepoGraph;

class Commit extends React.Component {
  componentDidMount() {

  }

  render() {

    var locked = <i className="lockStatus"></i>;
    if (this.props.data.locked) {
      locked = <i className="fa fa-lock lockStatus"></i>;
    }

    return (
      <li>
        {locked} <span className="uuid">{this.props.data.sha.substr(0,8)} ({this.props.data.id})</span>
        <span className="commitCreated">{moment(this.props.data.created).format("MMM Do YYYY, h:mm:ss a")}</span>
        {this.props.data.note}
      </li>
    );
  }
}

function generate_graph(commits) {
  var nodes = [];
  var branch_idx = [0];
  var reserve = [];
  var branches = {};


  function get_branch(sha) {
    if (!branches.hasOwnProperty(sha) ) {
      branches[sha] = branch_idx[0];
      reserve.push(branch_idx[0]);
      branch_idx[0] += 1;
    }
    return branches[sha];
  }


  function make_node(sha, offset, branch, routes) {
    return [sha, [offset, branch], routes];
  }

  for (var i = 0; i < commits.length; i++) {
    var commit    = commits[i];
    var branch    = get_branch(commit['sha']);
    var n_parents = commit.parents.length;
    var offset    = reserve.indexOf(branch);
    var routes    = [];

    if (n_parents === 1) {
      if (typeof branches[commit.parents[0]] != 'undefined') {
        // create a branch
        var after = reserve.slice(offset + 1);
        for (var j = 0; j < after.length; j++) {
          routes.push([j + offset + 1, j + offset + 1 - 1, after[j]]);
        }
        var before = reserve.slice(0, offset);
        for (var m = 0; m < before.length; m++) {
          routes.push([m,m,before[m]])
        }
        reserve.splice(offset, 1);
        routes.push([offset, reserve.indexOf(branches[commit.parents[0]]), branch]);
      } else {
        // straight line
        for (var l = 0; l < reserve.length; l++) {
          routes.push([l,l,reserve[l]])
        }
        branches[commit.parents[0]] = branch;
      }
    } else if (n_parents === 2) {
      // merge a branch
      branches[commit.parents[0]] = branch;
      for (var m = 0; m < reserve.length; m++) { routes.push([m,m,reserve[m]]) }
      var other_branch = get_branch(commit.parents[1]);
      routes.push([offset, reserve.indexOf(other_branch), other_branch]);
    }

    var node = make_node(commit.sha, offset, branch, routes);
    nodes.push(node);
  }
  return nodes;
}
