import React from 'react';
import Router from 'react-router';
import {Modal, Button} from 'react-bootstrap';
import DataInstances from './DataInstances.react';
import ErrorActions from '../actions/ErrorActions';
import InstanceActions from '../actions/InstanceActions';
import InstanceStore from '../stores/InstanceStore';
import InstanceAdd from './InstanceAdd.React.js';
import AltContainer from 'alt/AltContainer';
import config from '../utils/config';

var InstanceSelectPanel = React.createClass({
  // have to write this component with the old syntax otherwise we cant use mixins.
  mixins: [Router.State, Router.Navigation],

  showAllHandler: function(event) {
    InstanceActions.toggle();
  },

  showDataHandler: function(event) {
    var tile_source = null,
      label_source = null;
    // grab tile source selection
    tile_source = $("#instance_select input:radio[name=tile_source]:checked").val();
    // grab label source selection
    label_source = $("#instance_select input:radio[name=label_source]:checked").val();
    // display an error message if either one is missing.
    if(!tile_source) {
      ErrorActions.update('Please select a tile source from the table below.');
      return;
    }

    ErrorActions.clear();
    // generate a new url with the choices made and ...
    // redirect the browser
    if (!label_source) {
      this.transitionTo('tileonly', {
        uuid : this.props.uuid,
        tileSource : tile_source
      });
    } else {
      // label source has been selected, so lets try and center on the ROI.
      var label_meta = this.props.repo.DataInstances[label_source];
      // first grab the min and max points from the Extended meta data
      var minPoint = label_meta.Extended.MinPoint;
      var maxPoint = label_meta.Extended.MaxPoint;
      // work out the mid points for the x,y & z planes
      var x = Math.round((maxPoint[0] + minPoint[0]) / 2);
      var y = Math.round((maxPoint[1] + minPoint[1]) / 2);
      var z = Math.round((maxPoint[2] + minPoint[2]) / 2);

      this.transitionTo('tilemapwithcoords', {
        uuid : this.props.uuid,
        tileSource : tile_source,
        labelSource : label_source,
        plane: 'xy',
        coordinates : x + '_' + y + '_' + z
      });
    }
  },

  neuroGlancerHandler: function(event) {
    var tile_source = null;
    var label_source = null;
    var seg_layer = '';
    // grab tile source selection
    tile_source = $("#instance_select input:radio[name=tile_source]:checked").val();
    // display an error message if tilesource is missing.
    if(!tile_source) {
      ErrorActions.update('Please select a tile source from the table below.');
      return;
    }
    ErrorActions.clear();

    tile_source = tile_source.replace('*','');

    // grab label source selection
    label_source = $("#instance_select input:radio[name=label_source]:checked").val();
    if(label_source){
      label_source = label_source.replace('*','');
      var seg_layer = "_%27" + label_source + "%27:{%27type%27:%27segmentation%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ this.props.uuid + "/" + label_source + "%27}";
    }
    


    // generate a new url with the choices made and ...
    // redirect the browser
    var tile_layer = "%27" + tile_source + "%27:{%27type%27:%27image%27_%27source%27:%27dvid://" + config.baseUrl() + "/"+ this.props.uuid + "/" + tile_source + "%27}";
    var perspective = "%27perspectiveOrientation%27:[-0.12320884317159653_0.21754156053066254_-0.009492455050349236_0.9681965708732605]_%27perspectiveZoom%27:64";
    var glancer_url = "/neuroglancer/#!{%27layers%27:{" + tile_layer + seg_layer + "}_" + perspective +"}"

    window.location.href = glancer_url
  },

  render: function () {

    var button = <p>Showing all data instances. <button className="btn btn-default btn-xs" onClick={this.showAllHandler}>Show Select Data Instances</button></p>

    if (this.props.nodeRestrict) {
      button = <p>Showing data instances created on this node or its ancestors. <button className="btn btn-default btn-xs" onClick={this.showAllHandler}>Show All Data Instances</button></p>
    }

    return (
      <div className="dataselect">
        <InstanceAdd uuid={this.props.uuid}/>
        <h4>Data Instances</h4>
        <div className="row">
          <div className="col-sm-3">
            {button}
            <hr/>
            <p>Select a tile source and optionally a label source, then open the tile viewer to preview your data.</p>
            <button className="btn btn-default" onClick={this.showDataHandler}>Open Tile Viewer</button>
            <button className="btn btn-default" onClick={this.neuroGlancerHandler}>Open Neuroglancer</button>
          </div>
          <div className="col-sm-9">
            <form id="instance_select">
              <DataInstances repo={this.props.repo} uuid={this.props.uuid}/>
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
      <AltContainer store={InstanceStore}>
        <InstanceSelectPanel repo={this.props.repo} uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};

module.exports = InstanceSelect;
