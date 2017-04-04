import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';
import {Input, ButtonInput, Button} from 'react-bootstrap';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import ErrorActions from '../actions/ErrorActions';

var NewRepo = React.createClass({
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    return {
      alias: '',
      desc: ''
    };
  },

  handleAliasChange: function() {
    this.setState({
      alias: this.refs.alias.getValue()
    });
  },

  handleDescChange: function() {
    this.setState({
      desc: this.refs.desc.getValue()
    });
  },

  handleRepoCreate: function(e) {
    var self = this;
    e.preventDefault();
    // validate the input
    if (/^$/.test(this.state.alias)  ) {
      ErrorActions.update('Please supply an alias for this repository');
    }
    else if (/^$/.test(this.state.desc)) {
      ErrorActions.update('Please supply a simple description for this repository');
    }
    else {
      let callback = function(res){
        self.transitionTo('repo', {
          uuid : res.root,
        });
      }

      if(window.DVID_LITE){
        //dvid lite needs to update the repos before navigating to the new repo
        callback = function(res){
          let repos_cb = function(root, repos){
              let alias = ServerStore.getRepoAliasFromRoot(repos, root);
              self.transitionTo('repo', {alias : alias})
          }.bind(self, res.root)
          ServerActions.fetch({callback: repos_cb})
        }

      }

      ServerStore.state.api.createRepo({
        alias: this.state.alias,
        description: this.state.desc,
        callback: callback,
        error: function(err) {
          ErrorActions.update(err.message);
        }
      })
    }
  },

  render: function() {
    return (
        <div className='container'>
          <div className="col-xs-3"></div>
          <div className="col-xs-6">
            <h3>Create a New Repository</h3>
            <form onSubmit={this.handleRepoCreate}>
              <Input type="text" value={this.state.alias} label="Alias" ref="alias" onChange={this.handleAliasChange}/>
              <Input type="text" value={this.state.desc} label="Description" ref="desc" onChange={this.handleDescChange}/>
              <Button type='submit' bsStyle='primary' >Create</Button>
              <Link to="consoleapp" className="btn btn-default" activeClassName="current">Cancel</Link>
            </form>
          </div>
          <div className="col-xs-3"></div>
        </div>
    );
  }
});

module.exports = NewRepo;
