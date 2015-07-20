import React from 'react';
import Router from 'react-router';
import DataInstances from './DataInstances.react';
import ErrorActions from '../actions/ErrorActions';

var InstanceSelect = React.createClass({
  // have to write this component with the old syntax otherwise we cant use mixins.
  mixins: [Router.State, Router.Navigation],

  showDataHandler: function(event) {
    var tile_source = null,
      label_source = null;
    // grab tile source selection
    tile_source = $("#instance_select input:radio[name=tile_source]:checked").val();
    // grab label source selection
    label_source = $("#instance_select input:radio[name=label_source]:checked").val();
    // display an error message if either one is missing.
    if(!tile_source || !label_source) {
      ErrorActions.update('Please select a tile source and a label source from the table below.');
      return;
    }

    ErrorActions.clear();
    // generate a new url with the choices made and ...
    // redirect the browser
    this.transitionTo('tilemap', {
      uuid : this.props.uuid,
      tileSource : tile_source,
      labelSource : label_source
    });
  },

  render: function () {
    return (
      <div className="dataselect">
        <button className="btn btn-default" onClick={this.showDataHandler}>Open Tile Viewer</button>
        <form id="instance_select">
          <DataInstances repo={this.props.repo}/>
        </form>
      </div>
    );
  }

});

module.exports = InstanceSelect;
