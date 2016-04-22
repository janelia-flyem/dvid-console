var React  = require('react'),
  Router   = require('react-router'),
  config   = require('../utils/config'),
  core     = require('../utils/core'),
  tileSource = null,
  labeltype = null,
  TileCoordinates = require('./TileCoordinates.react'),
  SparseVolViewer = require('./SparseVolViewer.react'),
  slice1    = 'xy',
  slice2    = 'xz',
  slice3    = 'yz',
  viewer   = null,
  img_helper = null;

import ServerStore from '../stores/ServerStore';
import ErrorActions from '../actions/ErrorActions';

var TileMapArea = React.createClass({
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    return {
      x: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      y: 0,
      z: 0,
      layer: 0,
      volumeViewer: false,
      plane: undefined,
      segmentation: false,
      // this is initially set to true, so that we will update the location
      // of the tile viewer window on page load, but then not again after that.
      // The aim is to prevent a feedback loop where the url updates the
      // image location which in turn updates the url, which updates the image location....
      url_update: true,
      //for use by the sprsevolume viewer child.
      click_x: null,
      click_y: null,
      click_z: null,
      click_axis: null,
      click_label: null,
    };
  },

  componentDidMount: function() {
    //this.componentWillReceiveProps(this.props);
    $('body').on('mouseover', '.openseadragon-canvas:eq(0) canvas', function() {
      $('.keyboard-command-area').focusWithoutScrolling();
      $('#coords-tip').show();
    }).on('mouseout', '.openseadragon-canvas:eq(0) canvas', function() {
      $('.keyboard-command-area').blur();
      $('#coords-tip').hide();
    });
  },

  componentWillReceiveProps: function (props) {
    var self = this;
    var dataIsTiled = false;

    /* This checks to see if we already have a tile viewer in the page.
     * If we do, then the work here is done, so return.
     */
    if (viewer) {
      return;
    }

    tileSource  = props.tileSource;
    labeltype = props.labelSource;

    if (props.instances && props.instances.hasOwnProperty(tileSource)) {
      var node = this.getDOMNode();
      var uuid = this.props.uuid;
      config.uuid = uuid;
      // set the variables for the tile viewer based on data fetched from the server
      var url = config.baseUrl();
      var startingTileSource = 0;

      var tileSources = {
        "multiscale2d": 1,
        "imagetile": 1,
        "googlevoxels": 1,
      };

      //check if we are using tiles or grayscale
      if (tileSources.hasOwnProperty(props.instances[tileSource].Base.TypeName)) {
        dataIsTiled = true;
      }

      // check if we have a plane in the url and modify the display accordingly.
      if (props.plane) {
        var tileSourceMapping = {
          'xy': 0,
          'xz': 1,
          'yz': 2
        };
        startingTileSource = tileSourceMapping[props.plane];
        self.setState({plane: startingTileSource, targetZ: startingTileSource});
      }

      var createTileViewer = function(gScaleData, tileData) {

        var maxPoint   = gScaleData.Extended.MaxPoint,
        minPoint   = gScaleData.Extended.MinPoint,
        dx        = maxPoint[0] - minPoint[0],
        dy        = maxPoint[1] - minPoint[1],
        dz        = maxPoint[2];

        // set a default level of one unless we actually have tiling information
        var maxLevel = config.settings.maxTileLevel;
        if (tileData.Extended && tileData.Extended.Levels) {
          maxLevel = Object.keys(tileData.Extended.Levels).length - 1;
        }

        var tileSize = 512;
        if (tileData.Extended && tileData.Extended.Levels) {
          tileSize = tileData.Extended.Levels[0].TileSize[0];
        }

        viewer = new TileViewer({
          id: 'viewer',
          maxZoom: maxLevel,
          tileSource: url + '/api/node/' + uuid + '/' + tileSource + '/tile/xy/{zoom}/{x}_{y}_{z}',
          segSource: url + '/api/node/' + uuid + '/' + labeltype + 'pseudocolor/0_1/{tile}_{tile}/{x}_{y}_{z}', 
          rawSegSource:  url + '/api/node/' + uuid + '/' + labeltype + '/raw/0_1_2/{tile}_{tile}_1/{x}_{y}_{z}',
          current_z: dz / 2,
          tileSize: tileSize,
          x_mid: dx / 2,
          y_mid: dy / 2,
          segTileSize: 256
        });

        window.viewer = viewer;

        viewer.map.addEventListener('moveend', function(e) {

          var center = this.getCenter();
          var point  = this.project(center, maxLevel);
          var y = L.Util.formatNum(point.y, 1);
          var x = L.Util.formatNum(point.x, 1);
          var z = this.current_z;

          self.updateUrl({
            plane: 'xy',
            coordinates: x +'_' + y + '_' + z,
          });
        });

        self.setState({layer: dz / 2, targetZ: dz / 2});

        if (props.coordinateString) {
          var coords = props.coordinateString.split('_');
          viewer.changeLayer(coords[2]);
          viewer.jumpTo({x: coords[0], y: coords[1]});
        }

      }

      ServerStore.state.api.node({
        uuid: uuid,
        endpoint: tileSource + '/info',
        callback: function (tileData) {

          var gScaleData = tileData;

          // if we have a tiled data set and we don't have the MaxTileCoord meta
          // information, then we need to look to the source datatype. If that
          // doesn't exist, then we are out of luck as we can't predict the
          // extent of the data set.
          if (dataIsTiled) {
            if (tileData.Extended.Source) {
              var source = tileData.Extended.Source;
              ServerStore.state.api.node({
                uuid: uuid,
                endpoint: source + '/info',
                callback: function(infoData) {
                  gScaleData = infoData;
                  createTileViewer(gScaleData, tileData);
                },
                error: function() {
                  ErrorActions.update(new Error('There was a problem loading the meta information from ' + source + '. Please make sure that you have loaded it into dvid.'));
                }
              });
            }
            else {
              gScaleData.Extended.MaxPoint =  gScaleData.Extended.MaxTileCoord.map(function(n) {
                return n//; * gScaleData.Extended.Levels[0].TileSize[0];
              });
              gScaleData.Extended.MinPoint = gScaleData.Extended.MinTileCoord.map(function(n) {
                return n//; * gScaleData.Extended.Levels[0].TileSize[0];
              });
              createTileViewer(gScaleData, tileData);
            }
          }
          else {
            createTileViewer(gScaleData, tileData);
          }
        }
      });
    }
  },

  componentWillUnmount: function() {
    if (viewer) {
      viewer = null;
    }
  },

  comsponentWillUpdate: function() {
  },

  componentDidUpdate: function(prevProps, prevState) {
  },

  handleLayerChange: function(layer) {
    if (viewer) {
      viewer.changeLayer(layer);
      var center = viewer.getCenter();

      var x = center.x;
      var y = center.y;
      var uuid = this.props.uuid;

      var tileSourceMapping = ['xy','xz','yz'];
      var plane = tileSourceMapping[this.state.plane] || 'xy';

      this.updateUrl({
        plane: plane,
        coordinates: x +'_' + y + '_' + layer,
      });
    }

  },

  handleZChange: function(event) {
    if (event.target) {
      this.setState({layer: event.target.value, targetZ: event.target.value});
      this.handleLayerChange(event.target.value);
    }
  },

  handleZKeyDown: function (event) {
    // event fired when the z input is focused and a key is pressed.
  },

  handleZKeyUp: function(event) {
    // need to keep this here or the input number and the layer get out of sync
    // when throttling.
    this.handleLayerChange(event.target.value);
  },

  handleCoordinateChange: function(event) {
    event.preventDefault();

    var x = parseInt(this.refs.horizontal.getDOMNode().value.trim(), 10);
    var y = parseInt(this.refs.vertical.getDOMNode().value.trim(), 10);
    var z = parseInt(this.refs.depth.getDOMNode().value.trim(), 10);

    // populate the entries with the current values if they weren't changed in the form.
    x = x || this.state.x;
    y = y || this.state.y;
    z = z || this.state.layer;

    viewer.changeLayer(z);
    viewer.jumpTo({x: x, y: y});
  },

  //simply delegates to the updateViewerPlane() function. I would
  //bypass this entirely, but it seems to have strange consequences
  //on the state object.
  handlePlaneChange: function(event) {
  },

  handleSegmentation: function (event) {
  },

  sparseCloseHandler: function() {
    this.setState({volumeViewer: false});
  },

  updateUrl: function(opts) {
    opts.uuid = this.props.uuid;
    opts.tileSource = this.props.tileSource;
    if (this.props.labelSource) {
      opts.labelSource = this.props.labelSource;
      this.replaceWith('tilemapwithcoords', opts );
    } else {
      this.replaceWith('tileonlywithcoords', opts );
    }
  },

  updateViewerPlane: function (currentSeg) {
  },


  handleTargetXChange: function(e) {
    this.setState({'targetX': e.target.value});
  },

  handleTargetYChange: function(e) {
    this.setState({'targetY': e.target.value});
  },

  handleTargetZChange: function(e) {
    this.setState({'targetZ': e.target.value});
  },

  render: function() {

    if (!this.props.instances || !this.props.instances.hasOwnProperty(this.props.tileSource) ) {
      return (
        <div className="data-missing">
          <h3>Tile data not available</h3>
          <p className="subtle">Help on how to generate tile data can be found <a href="">here</a>.</p>
        </div>
      );
    }

    // need to figure out what plane we are in and change the XYZ labels accordingly.
    //

    var inputOne   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm', 'value': this.state.targetX, 'onChange': this.handleTargetXChange});
    var inputTwo   = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm', 'value': this.state.targetY, 'onChange': this.handleTargetYChange});
    var inputThree = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm', 'value': this.state.targetZ, 'onChange': this.handleTargetZChange});

    if (this.state.plane === 1) {
      inputOne   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm', 'value'  : this.state.targetX, 'onChange': this.handleTargetXChange });
      inputTwo   = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm', 'value': this.state.targetZ, 'onChange': this.handleTargetZChange});
      inputThree = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm', 'value' : this.state.targetY, 'onChange': this.handleTargetYChange});
    }
    else if (this.state.plane === 2) {
      inputOne   = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm', 'value': this.state.targetZ, 'onChange': this.handleTargetZChange});
      inputTwo   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm', 'value': this.state.targetX, 'onChange': this.handleTargetXChange});
      inputThree = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm', 'value': this.state.targetY, 'onChange': this.handleTargetYChange});
    }

    var segButton = null;
    if (this.props.labelSource) {
      var segmentation_active = this.state.segmentation ? 'active' : '';
      var seg_class= "btn btn-default " + segmentation_active;
      segButton = <button type="button" className={seg_class} id="toggle-composite" onClick={this.handleSegmentation}>Segmentation</button>
    }

    var sparse_viewer = '';
    if (this.state.volumeViewer) {
      sparse_viewer = <SparseVolViewer dvid={ServerStore.state.api} uuid={this.props.uuid} x={this.state.click_x} y={this.state.click_y} z={this.state.click_z} axis={this.state.click_axis} label={this.state.click_label} closeHandler={this.sparseCloseHandler} labelType={this.props.labelSource} tileSource={this.props.tileSource} />;
    }

    var neutu_url = "neutu://" + this.props.uuid + '/' + this.props.tileSource + '/' + this.props.labelSource + '/' + this.state.x + '/' + this.state.y + '/' + this.state.layer;

    var labelBlock = '';
    if (this.props.labelSource) {
      labelBlock = <p>Label Source: {this.props.labelSource}</p>
    }

    return (
      <div>
        <div id="toolbar">
        {/*
          <div className="row">
            <form className="form-inline">
              <div className="col-sm-12">
                <button type="button" className="btn btn-default hidden" id="toggle-overlay">overlay</button>
                {segButton}
                <select value={this.state.plane} className="form-control cut_plane" ref="cutPlane" onChange={this.handlePlaneChange}>
                  <option value="0">xy</option>
                  <option value="1">xz</option>
                  <option value="2">yz</option>
                </select>
              </div>
            </form>
          </div>
          */}
          <div className="row">
            <div className="col-sm-1" id="stack-input">
              <input id="depth" type="number" min="0" max="2000000" value={this.state.layer} onChange={this.handleZChange} onKeyDown={this.handleZKeyDown} onKeyUp={this.handleZKeyUp}/>
            </div>
            {/*
            <div className="col-sm-11" id="slider-container">
              <input id="stack-slider" min="0" max="2000" type="range" value={this.state.layer} onChange={this.handleZChange} onKeyDown={this.handleZKeyDown} onKeyUp={this.handleZKeyUp}/>
            </div>
            */}
          </div>
        </div>
        <div id="viewer" className="openseadragon">
          {sparse_viewer}
          <div id="viewer-console" className="row">
            <div className="col-sm-4">
              <p>Tile Source: {this.props.tileSource}</p>
            </div>
            <div className="col-sm-5">
              {labelBlock}
            </div>
            <div className="col-sm-3">
            {/*<TileCoordinates width={this.state.x} height={this.state.y} depth={this.state.layer} plane={this.state.plane}/>*/}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <form className="form-inline" name="coordinates" onSubmit={this.handleCoordinateChange} id="coordinates">
              <div className="form-group">
                <label>x</label>{inputOne}
              </div>
              <div className="form-group">
                <label>y</label>{inputTwo}
              </div>
              <div className="form-group">
                <label>z</label>{inputThree}
              </div>
              <button  className="btn btn-default btn-sm" type="submit" id="coordinatechange">Go</button>
            </form>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
          <a href={neutu_url}>Open with NeuTu</a>
          </div>
        </div>
        <div id="coords-tip" style={{display: 'none'}}></div>
      </div>
    );
  }
});

module.exports = TileMapArea;
