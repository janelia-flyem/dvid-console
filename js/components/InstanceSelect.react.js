import React from 'react';
import Router from 'react-router';
import {Modal, Button} from 'react-bootstrap';
import DataInstances from './DataInstances.react';
import ErrorActions from '../actions/ErrorActions';
import InstanceActions from '../actions/InstanceActions';
import InstanceStore from '../stores/InstanceStore';
import ServerStore from '../stores/ServerStore';
import InstanceAdd from './InstanceAdd.react.js';
import AltContainer from 'alt-container';
import config from '../utils/config';
import ServerActions from '../actions/ServerActions';

var InstanceSelectPanel = React.createClass({
  // have to write this component with the old syntax otherwise we cant use mixins.
  mixins: [Router.State, Router.Navigation],

  showAllHandler: function(event) {
    InstanceActions.toggle();
  },


  neuroGlancerHandler: function(event) {
    var image_source = null;
    var label_source = null;
    var seg_layer = '';
    // grab image source selection
    image_source = $("#instance_select input:radio[name=image_source]:checked").val();
    // display an error message if imagesource is missing.
    if(!image_source) {
      ErrorActions.update('Please select a image source from the table below.');
      return;
    }
    ErrorActions.clear();

    image_source = image_source.replace('*','');

    // grab label source selection
    label_source = $("#instance_select input:radio[name=label_source]:checked").val();
    if(label_source){
      label_source = label_source.replace('*','');
      var seg_layer = "_%27" + label_source + "%27:{%27type%27:%27segmentation%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ this.props.ServerStore.uuid + "/" + label_source + "%27}";
    }
    


    // generate a new url with the choices made and ...
    // redirect the browser
    var image_layer = "%27" + image_source + "%27:{%27type%27:%27image%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ this.props.ServerStore.uuid + "/" + image_source + "%27}";
    var perspective = "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";
    var glancer_url = "/neuroglancer/#!{%27layers%27:{" + image_layer + seg_layer + "}_" + perspective +"}"

    window.location.href = glancer_url
  },

  render: function () {

    var button = <p>Showing all data instances. <button className="btn btn-default btn-xs" onClick={this.showAllHandler}>Show Select Data Instances</button></p>

    if (this.props.InstanceStore.nodeRestrict) {
      button = <p>Showing data instances created on this node or its ancestors. <button className="btn btn-default btn-xs" onClick={this.showAllHandler}>Show All Data Instances</button></p>
    }

    return (
      <div className="dataselect">
        <InstanceAdd uuid={this.props.ServerStore.uuid}/>
        <h4>Data Instances</h4>
        <div className="row">
          <div className="col-sm-3">
            {button}
            <hr/>
            <p>Select an image source and optionally a label source, then open neuroglancer to preview your data.</p>
            <button className="btn btn-default" onClick={this.neuroGlancerHandler}>Open Neuroglancer</button>
          </div>
          <div className="col-sm-9">
            <form id="instance_select">
              <DataInstances repo={this.props.ServerStore.repo} uuid={this.props.ServerStore.uuid}/>
            </form>
          </div>
        </div>
      </div>
    );
  }

});

class InstanceSelect extends React.Component {
  render() {
    return (
      <AltContainer stores={{InstanceStore: InstanceStore, ServerStore:ServerStore}}>
        <InstanceSelectPanel />
      </AltContainer>
    );
  }
};

module.exports = InstanceSelect;
