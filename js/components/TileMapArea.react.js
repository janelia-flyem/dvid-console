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

var TileMapArea = React.createClass({
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    return {
      x: 0,
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
    $('body').on('mouseover','#viewer canvas:eq(0)', function() {
      $('#coords-tip').show();
    }).on('mouseout','#viewer canvas:eq(0)', function() {
      $('#coords-tip').hide();
    });
  },

  componentWillReceiveProps: function (props) {
    var self = this;
    var dataIsTiled = false;

    /* This checks to see if we already have a tile viewer in the page.
     * If we do, then the work here is done, so return.
     */
    if (viewer && viewer.xy) {
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
        "imagetile": 1
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
        self.setState({plane: startingTileSource});
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

        var minLevel = config.settings.minTileLevel;

        if (!dataIsTiled) {
          minLevel = 4;
          maxLevel = 4;
        }

        var tileSize = 512;
        if (tileData.Extended && tileData.Extended.Levels) {
          tileSize = tileData.Extended.Levels[0].TileSize[0];
        }

        var maxHeight = dx;
        var maxWidth = dy;

        // this works out the size of the image based on the number of tiles required
        // to cover the complete image at the largest level.
        //
        //Notes from Bill.
        //
        //Say we have 500x500 tiles but our real volume size is 6133 x 7000 x 8000.
        //In order to cover the real volume size, we have 5 scales.
        //
        //Scale 0 = no downres, so we have 6133/500 = 13 tiles along X to cover real X extent.
        //Scale 1 = 2x, so we have 3067/500 = 7 tiles along X to cover the downres X extent
        //Scale 2 = 4x, it’s now 1534/500 = 4 tiles
        //Scale 3 = 8x, it’s now 717/500 = 2 tiles
        //Scale 4 = 16x, one tile
        //
        //But this means to OpenSeadragon, the “tiled” X extent is really 500 x 16 = 8000 voxels.
        //This will lead to a lot of empty padding at end of x, y, and z, but shouldn’t affect
        //your offsets I believe.
        //

        if (dataIsTiled) {
          maxHeight = maxWidth = tileSize * Math.pow(2, maxLevel);
        }

        var volumeWidth = {
          'xy': dx,
          'xz': dx,
          'yz': dy,
        };

        var volumeHeight = {
          'xy':  dy,
          'xz':  dz,
          'yz':  dz
        };

        var volumeDepth = {
          'xy':  dz,
          'xz':  dy,
          'yz':  dx
        };

        $('#stack-slider').attr('max', maxPoint[2]).attr('min', minPoint[2]).change(function() {
          $('#depth').val($(this).val());
        });

        $('#depth').attr('max', dz);


        viewer = {
          nmPerPixel: 10,
          tileSources: [
          {
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  minLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice1]-1,
            getTileUrl: function xyTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + tileSource + "/raw/" + slice1 + "/" + tileSize + "_" + tileSize + "/" + (x * tileSize) + "_" + (y * tileSize) + "_" + z;
              if (dataIsTiled) {
                  api_url = url + "/api/node/" + uuid + "/" + tileSource + "/tile/" + slice1 + "/" + (maxLevel - level) + "/" + x + "_" + y + "_" + z;
              }
              return api_url;
            }
          },
          {
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  minLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice2]-1,
            getTileUrl: function xzTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + tileSource + "/raw/" + slice2 + "/" + tileSize + "_" + tileSize + "/" + (x * tileSize) + "_" + z + "_" + (y * tileSize);
              if (dataIsTiled) {
                api_url = url + "/api/node/" + uuid + "/" + tileSource + "/tile/" + slice2 + "/" + (maxLevel - level) + "/" + x + "_" + z + "_" + y;
              }
              return api_url;
            }
          },
          {
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  minLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice3]-1,
            getTileUrl: function yzTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + tileSource + "/raw/" + slice3 + "/" + tileSize + "_" + tileSize + "/" + z + "_" + (x * tileSize) + "_" + (y * tileSize);
              if (dataIsTiled) {
                api_url = url + "/api/node/" + uuid + "/" + tileSource + "/tile/" + slice3 + "/" + (maxLevel - level) + "/" + z + "_" + x + "_" + y;
              }
              return api_url;
            }
          },
          // composite for xy plane
          {
            virtualMode: 'segmentation',
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  maxLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice1]-1,
            getTileUrl: function xyTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + labeltype + "/raw/0_1_2/" + tileSize + "_" + tileSize + "_1/" + (x * tileSize) + "_" + (y * tileSize) + "_" + z;
              return api_url;
            }
          },
          {
            virtualMode: 'segmentation',
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  maxLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice2]-1,
            getTileUrl: function xzTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + labeltype + "/raw/0_1_2/" + tileSize + "_1_" + tileSize + "/" + (x * tileSize) + "_" + z + "_" + (y * tileSize);
              return api_url;
            }
          },
          {
            virtualMode: 'segmentation',
            height:    maxHeight,
            width:     maxWidth,
            tileSize:  tileSize,
            minLevel:  maxLevel,
            maxLevel:  maxLevel,
            minZ:      0,
            maxZ:      volumeDepth[slice3]-1,
            getTileUrl: function yzTileURL(level, x, y, z) {
              var api_url = url + "/api/node/" + uuid + "/" + labeltype + "/raw/0_1_2/1_" + tileSize + "_" + tileSize + "/" + z + "_" + (x * tileSize) + "_" + (y * tileSize);
              return api_url;
            }
          },
          ]
        };

        var minZoomLevel = config.settings.minZoomLevel;
        var defaultZoomLevel = config.settings.defaultZoomLevel;

        if (!dataIsTiled) {
          minZoomLevel = 6;
          defaultZoomLevel = 6;
        }

        viewer.xy = OpenSeadragon({
          // need to be able to pass in the react state, so that we can modify it
          // when using the other buttons to change z layer.
          id:                 "viewer",
          prefixUrl:          "js/vendor/openseadragon/images/",
          navigatorSizeRatio: 0.25,
          wrapHorizontal:     false,
          maxZoomPixelRatio:  1.8,
          showNavigator:      config.settings.showNavigator,
          tileSources:        viewer.tileSources,
          //zoomPerClick:       1.0,
          toolbar:            "toolbar",
          minZoomLevel:       minZoomLevel,
          defaultZoomLevel:   defaultZoomLevel,
          zoomInButton:       "zoom-in",
          zoomOutButton:      "zoom-out",
          homeButton:         "home",
          previousButton:     "previous",
          nextButton:         "next",
          preserveViewport:   true,
          fullPageButton:     "full-page",
          initialPage:        startingTileSource,
          //immediateRender:    true,
          //gestureSettingsMouse: {
          //  clickToZoom: false
          //},
          debugMode:          false
        });
        viewer.xy.scalebar({
          pixelsPerMeter: 1000000000/viewer.nmPerPixel,
          fontColor:      "yellow",
          color:          "yellow"
        });

        //window.viewer = viewer;
        img_helper = viewer.xy.activateImagingHelper();
        //window.img_helper = img_helper;

        img_helper.addHandler('image-view-changed', function (event) {
          var center = event.viewportCenter,
            x = Math.round(img_helper.logicalToDataX(center.x)),
            y = Math.round(img_helper.logicalToDataY(center.y)),
            tileSourceMapping = ['xy','xz','yz'];
          self.setState({'x': x, 'y': y});
          var url_plane =  tileSourceMapping[self.state.plane] || 'xy';

          self.updateUrl({
            uuid: uuid,
            plane: url_plane,
            coordinates: x +'_' + y + '_' + self.state.layer,
            tileSource: self.props.tileSource,
            labelSource: self.props.labelSource
          });
        });

        viewer.xy.addHandler('canvas-click', function(event) {
          // if shift is held down, then  do something, otherwise ignore as we
          // don't want to load a new page every time someone clicks on the image.
          if (event.shift) {
            // run an ajax request to see if there is a body at the clicked coordinates
            var coords = img_helper.physicalToDataPoint(event.position);
            var z = Math.round($('#depth').val());
            var bodiesUrl = url + '/api/node/' + uuid + '/' + labeltype + '/label/' + Math.round(coords.x) + '_' + Math.round(coords.y) + '_' + z;
              $.getJSON(bodiesUrl, function(data) {
                if (data.Label && data.Label > 0) {
                  var axis = $('.cut_plane option:selected').text();
                  self.setState({
                    'volumeViewer': true,
                    'click_z': parseInt(z),
                    'click_y': Math.round(coords.y),
                    'click_x': Math.round(coords.x),
                    'click_axis': axis,
                    'click_label': data.Label
                  });
                }
              });
            return;
          }
        });

        viewer.xy.addHandler('open', function(event) {
          var _$osdCanvas = $(viewer.xy.canvas);
          _$osdCanvas.on('mousemove.osdimaginghelper', onMouseMove);
        });

        viewer.xy.addHandler('add-layer', function(event) {
          viewer.layer = event.drawer;
        });

        var viewerInputHook = viewer.xy.addViewerInputHook({hooks: [
          {tracker: 'viewer', handler: 'moveHandler', hookHandler: onHookOsdViewerMove}
        ]});

        function onHookOsdViewerMove(event) {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
            var coords = img_helper.physicalToDataPoint(event.position);
            var z = Math.round($('#depth').val());
            var string = 'x: ' + Math.round(coords.x) + ', y: ' + Math.round(coords.y) + ', z: ' + z;
            $('#coords-tip').empty()
              .append('<p>' + string + '</p>')
              .css({
                'position': 'absolute',
                'top': event.position.y + 20,
                'left': event.position.x + 20
              });
            event.stopHandlers = true;
            event.stopBubbling = true;
            event.preventDefaultAction = true;
        }

        viewer.recenter = false;

        viewer.xy.addHandler('page', function(event) {
          var choice = parseInt($('.cut_plane').val());
          var coordinates = img_helper.logicalToDataPoint(img_helper._viewportCenter);
          coordinates.z = Math.round($('#depth').val());


          // need to move the image to the correct coordinates in the viewer?
          var converted = convertCoordinates({coordinates: coordinates, from: self.state.plane, to: choice});
          var z = Math.round(converted.z);

          // save this information to be used later in the open event handler,
          // when the image has finished updating and we can scroll to the correct
          // location.
          viewer.recenter = {
            from: self.state.plane,
            to: choice,
            coordinates: converted
          };


          self.setState({layer: z});
          self.setState({plane: choice});



        });

        // we have to have the center function triggered in the open event, because
        // it fires off too soon in the page event and the image width is incorrect.
        // This causes it to center in the wrong location.
        viewer.xy.addHandler('open', function(event) {

          if (viewer.recenter) {

            var logicalPoint = img_helper.dataToLogicalPoint(viewer.recenter.coordinates);
            img_helper.centerAboutLogicalPoint(logicalPoint, true);
          }

          viewer.recenter = false;

          // make sure the layer is updated after the page change and open event has been fired.
          // had to move this after the open event, because the navigator wasn't fully loaded before
          var z = Math.round($('#depth').val());
          self.handleLayerChange(z);

          if (props.coordinateString && self.state.url_update) {
            var coordinates = props.coordinateString.split('_');
            var dataPoint = new OpenSeadragon.Point(parseInt(coordinates[0]),parseInt(coordinates[1]));
            var logicalPoint = img_helper.dataToLogicalPoint(dataPoint);
            img_helper.centerAboutLogicalPoint(logicalPoint, true);
            self.setState({
              layer: coordinates[2],
              url_update: false
            });
            self.handleLayerChange(coordinates[2]);
          }
        });

      }

      ServerStore.state.api.node({
        uuid: uuid,
        endpoint: tileSource + '/info',
        callback: function (tileData) {

          var gScaleData = tileData;

          if (dataIsTiled) {
            var source = tileData.Extended.Source;
            ServerStore.state.api.node({
              uuid: uuid,
              endpoint: source + '/info',
              callback: function(infoData) {
                gScaleData = infoData;
                createTileViewer(gScaleData, tileData);
              }
            });
          }
          else {
            createTileViewer(gScaleData, tileData);
          }
        }
      });
    }
  },

  componentWillUnmount: function() {
    if (viewer && viewer.xy) {
      viewer.xy.destroy();
      viewer.xy = null;
      viewer = null;
    }
  },

  comsponentWillUpdate: function() {
  },

  componentDidUpdate: function(prevProps, prevState) {
  },

  handleLayerChange: function(layer) {
    if (viewer.xy && viewer.xy.viewport) {
      viewer.xy.updateLayer(layer);

      var x = Math.round(img_helper.logicalToDataX(img_helper._viewportCenter.x));
      var y = Math.round(img_helper.logicalToDataY(img_helper._viewportCenter.y));
      var uuid = this.props.uuid;

      var tileSourceMapping = ['xy','xz','yz'];
      var plane = tileSourceMapping[this.state.plane] || 'xy';

      this.updateUrl({
        uuid: uuid,
        plane: plane,
        coordinates: x +'_' + y + '_' + layer,
        tileSource: this.props.tileSource,
        labelSource: this.props.labelSource
      });
    }
  },

  handleZChange: core.throttle(function(event) {
    if (event.target) {
      this.setState({layer: event.target.value});
      this.handleLayerChange(event.target.value);
    }
  }, 250),

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

    var point = new OpenSeadragon.Point(x,y);
    var logical = img_helper.dataToLogicalPoint(point);

    //scroll to the point in the plane
    img_helper.centerAboutLogicalPoint(logical);

    // change the layer
    this.setState({layer: z});
    this.handleLayerChange(z);
    this.refs.horizontal.getDOMNode().value = '';
    this.refs.vertical.getDOMNode().value = '';
    this.refs.depth.getDOMNode().value = '';

  },

  //simply delegates to the updateViewerPlane() function. I would
  //bypass this entirely, but it seems to have strange consequences
  //on the state object.
  handlePlaneChange: function(event) {
    this.updateViewerPlane();
  },

  handleSegmentation: function (event) {
    var currentSeg = this.state.segmentation;
    this.setState({segmentation: !currentSeg});
    var choice = parseInt(this.refs.cutPlane.getDOMNode().value, 10);
    if (!currentSeg) {
      viewer.xy.addLayer({
        tileSource: viewer.tileSources[choice + 3],
        opacity: 0.4
      });
    }
    else {
      if (viewer.layer) {
        viewer.xy.removeLayer(viewer.layer);
      }
    };
  },

  sparseCloseHandler: function() {
    this.setState({volumeViewer: false});
  },

  updateUrl: function(opts) {
    if (this.props.labelSource) {
      this.replaceWith('tilemapwithcoords', opts );
    } else {
      this.replaceWith('tileonlywithcoords', opts );
    }
  },

  updateViewerPlane: function (currentSeg) {
    if (typeof currentSeg == 'undefined') {
      currentSeg = this.state.segmentation;
    }
    // convert the value to an integer for later lookups
    var choice = parseInt(this.refs.cutPlane.getDOMNode().value, 10);

    // update the tile viewer display.
    viewer.xy.goToPage(choice);
    // update the slider to reflect the new depth, which can be found in the viewer
    // object.
    var depth = viewer.tileSources[choice].maxZ;
    $('#depth').attr('max', depth);
    $('#stack-slider').attr('max', depth);

    // if segmentation should be on, then use the correct tileSource by adding
    // 3, so that we skip to the segmentation tile sources.
    if (currentSeg) {
      viewer.xy.addLayer({
        tileSource: viewer.tileSources[choice + 3],
        opacity: 0.5
      });
    }
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

    var inputOne   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm'});
    var inputTwo   = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm'});
    var inputThree = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm'});

    if (this.state.plane === 1) {
      inputOne   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm'});
      inputTwo   = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm'});
      inputThree = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm'});
    }
    else if (this.state.plane === 2) {
      inputOne   = React.createElement('input',{'id': 'depth', 'type': 'number', 'min': 0, 'ref': 'depth', 'className': 'form-control input-sm'});
      inputTwo   = React.createElement('input',{'id': 'horizontal', 'type': 'number', 'min': 0, 'ref': 'horizontal', 'className': 'form-control input-sm'});
      inputThree = React.createElement('input',{'id': 'vertical', 'type': 'number', 'min': 0, 'ref': 'vertical', 'className': 'form-control input-sm'});
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

    return (
      <div>
        <div id="toolbar">
          <div className="row">
            <form className="form-inline">
              <div className="col-sm-12">
                <button type="button" className="btn btn-default" id="home">Home</button>
                <button type="button" className="btn btn-default" id="zoom-in">Zoom In</button>
                <button type="button" className="btn btn-default" id="zoom-out">Zoom Out</button>
                {/*<button type="button" className="btn btn-default" id="full-page">Full Screen</button>*/}
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
          <div className="row">
            <div className="col-sm-1" id="stack-input">
              <input id="depth" type="number" min="0" max="2000" value={this.state.layer} onChange={this.handleZChange} onKeyDown={this.handleZKeyDown} onKeyUp={this.handleZKeyUp}/>
            </div>
            <div className="col-sm-11" id="slider-container">
              <input id="stack-slider" min="0" max="2000" type="range" value={this.state.layer} onChange={this.handleZChange} onKeyDown={this.handleZKeyDown} onKeyUp={this.handleZKeyUp}/>
            </div>
          </div>
        </div>
        {sparse_viewer}
        <div id="viewer" className="openseadragon"></div>
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
          <TileCoordinates width={this.state.x} height={this.state.y} depth={this.state.layer} plane={this.state.plane}/>
          <a href={neutu_url}>Open with NeuTu</a>
          </div>
        </div>
        <div id="coords-tip" style={{display: 'none'}}></div>
      </div>
    );
  }
});

module.exports = TileMapArea;

function convertCoordinates (input) {
  var converted = null;
  switch (input.from) {
    case 0:// xy
      converted = convertFromXY(input.coordinates, input.to);
      break;
    case 1:// xz
      converted = convertFromXZ(input.coordinates, input.to);
      break;
    case 2:// yz
      converted = convertFromYZ(input.coordinates, input.to);
      break;
    default://
      converted = input.coordinates;
  }

  return converted;
};

function convertFromXY(coordinates, to) {
  var converted = null;
  switch (to) {
    case 1:// xz okay
      converted = new OpenSeadragon.Point(coordinates.x, coordinates.z);
      converted.z = coordinates.y;
      break;
    case 2:// yz okay
      converted = new OpenSeadragon.Point(coordinates.y, coordinates.z);
      converted.z = coordinates.x;
      break;
    default:
      converted = coordinates;
  }
  return converted;
};

function convertFromXZ(coordinates, to) {
  var converted = null;
  switch (to) {
    case 0:// xy okay
      converted = new OpenSeadragon.Point(coordinates.x, coordinates.z);
      converted.z = coordinates.y;
      break;
    case 2:// yz okay
      converted = new OpenSeadragon.Point(coordinates.z, coordinates.y);
      converted.z = coordinates.x;
      break;
    default:
      converted = coordinates;
  }
  return converted;
};
function convertFromYZ(coordinates, to) {
  var converted = null;
  switch (to) {
    case 0:// xy okay
      converted = new OpenSeadragon.Point(coordinates.z, coordinates.x);
      converted.z = coordinates.y;
      break;
    case 1:// xz okay
      converted = new OpenSeadragon.Point(coordinates.z, coordinates.y);
      converted.z = coordinates.x;
      break;
    default:
      converted = coordinates;
  }
  return converted;
};

// logs the underlying body id if present to the console.
// this might be useful in the future, but would need better
// integration into the page via a popup or something like
// that. Just for debugging right now.
function onMouseMove(event) {
  return;
  var url = config.baseUrl();
  var uuid = config.uuid;
  var z = Math.round($('#depth').val());
  var osdmouse = OpenSeadragon.getMousePosition(event);

  var offset = _$osdCanvas.offset();

  var dataX = window.img_helper.physicalToDataX( event.pageX - offset.left );
  var dataY = window.img_helper.physicalToDataY( event.pageY - offset.top  );

  var bodiesUrl = url + '/api/node/' + uuid + '/bodies/label/' + Math.round(dataX) + '_' + Math.round(dataY) + '_' + z;
  $.getJSON(bodiesUrl, function(data) {
    if (data.Label && data.Label > 0) {
      console.info(data.Label);
    }
  });

};

