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

  render() {

    if (this.props.types) {

      var types = [];

      for (var key in this.props.types) {
        if (this.props.types.hasOwnProperty(key)) {
          var type = this.props.types[key];
          types.push(<option key={key} value={key}>{key}</option>);
        }
      }

      var sync_instances = [];

      for (var key in this.props.repo.DataInstances) {
        if (this.props.repo.DataInstances.hasOwnProperty(key)) {
          var instance = this.props.repo.DataInstances[key];
          sync_instances.push(<option key={key} value={key}>{key}</option>);
        }
      }

      var alertMsg = '';

      if (this.state.errorMsg) {
        alertMsg =  <Alert bsStyle="danger">{this.state.errorMsg}</Alert>;
      }


      return (
        <div className="pull-right">
          <Button bsSize="xsmall" bsStyle="default" onClick={this.openDataInstanceModal.bind(this)}>Add Data Instance</Button>
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
                <label htmlFor="di_sync">Sync with other Instances</label>
                <select name="di_sync" id="di_sync" ref="di_sync" multiple="multiple" className="form-control">
                {sync_instances}
                </select>
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
    var synced = $(this.refs.di_sync.getDOMNode()).children('option:selected');
    var selected = [];
    synced.each(function () {
      selected.push(this.value);
    });

    var versioned = (this.refs.di_versioned.getDOMNode().value === "on")?'1':'0';
    var payload = {
      'typename': this.refs.di_type.getDOMNode().value,
      'dataname': this.refs.di_name.getDOMNode().value,
      'versioned': versioned,
      'sync': selected.join()
    };

    ServerStore.state.api.repo({
      uuid: self.props.uuid,
      endpoint: 'instance',
      method: 'POST',
      payload: JSON.stringify(payload),

      callback: function(res){
        // force a refresh of the data instances data from the server.
        self.closeDataInstanceModal();
        ServerActions.fetch.defer({uuid: self.props.uuid});
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
    ServerActions.fetchTypes();
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
