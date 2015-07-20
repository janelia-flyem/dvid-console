import React from 'react';
import Router from 'react-router';
import {Input, ButtonInput} from 'react-bootstrap';
import ServerStore from '../stores/ServerStore';
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
      ServerStore.state.api.createRepo({
        alias: this.state.alias,
        description: this.state.desc,
        callback: function(res){
          console.log(res);
          self.transitionTo('repo', {
            uuid : res.Root,
          });
        },
        error: function(err) {
          ErrorActions.update(err.message);
        }
      })
    }
  },

  render: function() {
    return (
        <div>
          <h3>Create a New Repository</h3>
          <form onSubmit={this.handleRepoCreate}>
            <Input type="text" value={this.state.alias} label="Alias" ref="alias" onChange={this.handleAliasChange}/>
            <Input type="text" value={this.state.desc} label="Description" ref="desc" onChange={this.handleDescChange}/>
            <ButtonInput type='submit' value='Create' bsStyle='primary' />
          </form>
        </div>
    );
  }
});

module.exports = NewRepo;
