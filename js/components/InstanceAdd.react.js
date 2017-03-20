import React from 'react';
import Router from 'react-router';
import ServerActions from '../actions/ServerActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';
import {Alert, Glyphicon, Button, Modal, Input} from 'react-bootstrap';


class InstanceAddButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDIModal: false,
      errorMsg: false
    };
  }

  componentDidMount() {
    $(React.findDOMNode(this)).popover({
      selector: '[data-toggle="popover"]'
    });
  }

  render() {


    if (this.props.types) {

      var types = [];

      for (var key in this.props.types) {
        if (this.props.types.hasOwnProperty(key)) {
          var type = this.props.types[key];
          types.push(<option key={key} value={key}>{key}</option>);
        }
      }

      var alertMsg = '';

      if (this.state.errorMsg) {
        alertMsg =  <Alert bsStyle="danger">{this.state.errorMsg}</Alert>;
      }

      var button = <Button bsSize="xsmall" bsStyle="default" onClick={this.openDataInstanceModal.bind(this)}>Add Data Instance</Button>;

      if (this.props.repo.DAG.Nodes[this.props.uuid] && this.props.repo.DAG.Nodes[this.props.uuid].Locked) {
        button = <a role="button" tabIndex="0" className="btn btn-xs btn-default" data-toggle="popover" data-placement="left" data-trigger="focus" title="Action not permitted" data-content="It is not possible to add a data instance to a locked node. Please select an unlocked node (white) from the DAG above." onClick={this.isLocked.bind(this)}>Add Data Instance</a>;
      }

      return (
        <div className="pull-right">
        {button}
          <Modal show={this.state.showDIModal} onHide={this.closeDataInstanceModal.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Add a New Data Instance.</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {alertMsg}
              <div className="form-group">
                <label htmlFor="di_name">Name</label>
                <input className="form-control" type="text" ref="di_name" name="di_name" id="di_name" placeholder="Enter a name for your data instance"/>
              </div>
              <div className="form-group">
                <label htmlFor="di_type">Type</label>
                <select name="di_type" id="di_type" ref="di_type" className="form-control">
                {types}
                </select>
              </div>
              <div className="checkbox">
                <label htmlFor="di_versioned">
                  <input type="checkbox" id="di_versioned" ref="di_versioned" defaultChecked />
                  versioned
                </label>
              </div>

              <div className="form-group">
                <button onClick={this.saveDataInstance.bind(this)} className="btn btn-primary">Add</button>
                <button onClick={this.closeDataInstanceModal.bind(this)} className="btn btn-default">Cancel</button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      );
    }

    return (
      <div className="pull-right"></div>
    );
  }

  isLocked(e) {
    e.preventDefault();
  }


  openDataInstanceModal(e) {
    e.preventDefault();
    this.setState({showDIModal: true});
  }

  closeDataInstanceModal(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({showDIModal: false, errorMsg: null});
  }

  saveDataInstance(e) {
    var self = this;

    var versioned = this.refs.di_versioned.getDOMNode().checked ?'1':'0';
    var payload = {
      'typename': this.refs.di_type.getDOMNode().value,
      'dataname': this.refs.di_name.getDOMNode().value,
      'versioned': versioned
    };

    ServerStore.state.api.repo({
      uuid: self.props.uuid,
      endpoint: 'instance',
      method: 'POST',
      payload: JSON.stringify(payload),

      callback: function(res){
        // force a refresh of the data instances data from the server.
        self.closeDataInstanceModal();
        ServerActions.fetch({uuid: self.props.uuid});
      },
      error: function(err) {
        // need to insert an error message into the top of the modal window.
        self.setState({errorMsg: err.message});
      }
    })
  }

}


class InstanceAdd extends React.Component {

  componentDidMount() {
    if(!ServerStore.getState().types){
      ServerActions.fetchTypes();
    }
  }

  render() {
    return (
      <AltContainer store={ServerStore}>
        <InstanceAddButton uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};

module.exports = InstanceAdd;
