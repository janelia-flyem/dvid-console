var React    = require('react'),
  Router     = require('react-router'),
  config     = require('../utils/config'),
  core       = require('../utils/core'),
  dataSource = config.baseUrl();

import THREE from 'three';

/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 */

THREE.TrackballControls = function ( object, domElement ) {

	var _this = this;
	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { left: 0, top: 0, width: 0, height: 0 };

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;
	this.noRoll = false;

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = new THREE.Vector3();

	var EPS = 0.000001;

	var lastPosition = new THREE.Vector3();

	var _state = STATE.NONE,
	_prevState = STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_touchZoomDistanceStart = 0,
	_touchZoomDistanceEnd = 0,

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.up0 = this.object.up.clone();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start'};
	var endEvent = { type: 'end'};


	// methods

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			var box = this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}

	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	var getMouseOnScreen = ( function () {

		var vector = new THREE.Vector2();

		return function ( pageX, pageY ) {

			vector.set(
				( pageX - _this.screen.left ) / _this.screen.width,
				( pageY - _this.screen.top ) / _this.screen.height
			);

			return vector;

		};

	}() );

	var getMouseProjectionOnBall = ( function () {

		var vector = new THREE.Vector3();
		var objectUp = new THREE.Vector3();
		var mouseOnBall = new THREE.Vector3();

		return function ( pageX, pageY ) {

			mouseOnBall.set(
				( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
				( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
				0.0
			);

			var length = mouseOnBall.length();

			if ( _this.noRoll ) {

				if ( length < Math.SQRT1_2 ) {

					mouseOnBall.z = Math.sqrt( 1.0 - length*length );

				} else {

					mouseOnBall.z = .5 / length;
					
				}

			} else if ( length > 1.0 ) {

				mouseOnBall.normalize();

			} else {

				mouseOnBall.z = Math.sqrt( 1.0 - length * length );

			}

			_eye.copy( _this.object.position ).sub( _this.target );

			vector.copy( _this.object.up ).setLength( mouseOnBall.y )
			vector.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
			vector.add( _eye.setLength( mouseOnBall.z ) );

			return vector;

		};

	}() );

	this.rotateCamera = (function(){

		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion();


		return function () {

			var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

			if ( angle ) {

				axis.crossVectors( _rotateStart, _rotateEnd ).normalize();

				angle *= _this.rotateSpeed;

				quaternion.setFromAxisAngle( axis, -angle );

				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

				_rotateEnd.applyQuaternion( quaternion );

				if ( _this.staticMoving ) {

					_rotateStart.copy( _rotateEnd );

				} else {

					quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
					_rotateStart.applyQuaternion( quaternion );

				}

			}
		}

	}());

	this.zoomCamera = function () {

		if ( _state === STATE.TOUCH_ZOOM_PAN ) {

			var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			_touchZoomDistanceStart = _touchZoomDistanceEnd;
			_eye.multiplyScalar( factor );

		} else {

			var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {

				_eye.multiplyScalar( factor );

				if ( _this.staticMoving ) {

					_zoomStart.copy( _zoomEnd );

				} else {

					_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

				}

			}

		}

	};

	this.panCamera = (function(){

		var mouseChange = new THREE.Vector2(),
			objectUp = new THREE.Vector3(),
			pan = new THREE.Vector3();

		return function () {

			mouseChange.copy( _panEnd ).sub( _panStart );

			if ( mouseChange.lengthSq() ) {

				mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

				pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
				pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

				_this.object.position.add( pan );
				_this.target.add( pan );

				if ( _this.staticMoving ) {

					_panStart.copy( _panEnd );

				} else {

					_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

				}

			}
		}

	}());

	this.checkDistances = function () {

		if ( !_this.noZoom || !_this.noPan ) {

			if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

			}

		}

	};

	this.update = function () {

		_eye.subVectors( _this.object.position, _this.target );

		if ( !_this.noRotate ) {

			_this.rotateCamera();

		}

		if ( !_this.noZoom ) {

			_this.zoomCamera();

		}

		if ( !_this.noPan ) {

			_this.panCamera();

		}

		_this.object.position.addVectors( _this.target, _eye );

		_this.checkDistances();

		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	this.reset = function () {

		_state = STATE.NONE;
		_prevState = STATE.NONE;

		_this.target.copy( _this.target0 );
		_this.object.position.copy( _this.position0 );
		_this.object.up.copy( _this.up0 );

		_eye.subVectors( _this.object.position, _this.target );

		_this.object.lookAt( _this.target );

		_this.dispatchEvent( changeEvent );

		lastPosition.copy( _this.object.position );

	};

	// listeners

	function keydown( event ) {

		if ( _this.enabled === false ) return;

		window.removeEventListener( 'keydown', keydown );

		_prevState = _state;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

			_state = STATE.PAN;

		}

	}

	function keyup( event ) {

		if ( _this.enabled === false ) return;

		_state = _prevState;

		window.addEventListener( 'keydown', keydown, false );

	}

	function mousedown( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

		}

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_rotateStart.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );
			_rotateEnd.copy( _rotateStart );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_zoomEnd.copy(_zoomStart);

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_panEnd.copy(_panStart)

		}

		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );

		_this.dispatchEvent( startEvent );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_rotateEnd.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		}

	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );
		_this.dispatchEvent( endEvent );

	}

	function mousewheel( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta / 40;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail / 3;

		}

		_zoomStart.y += delta * 0.01;
		_this.dispatchEvent( startEvent );
		_this.dispatchEvent( endEvent );

	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_state = STATE.TOUCH_ROTATE;
				_rotateStart.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				_rotateEnd.copy( _rotateStart );
				break;

			case 2:
				_state = STATE.TOUCH_ZOOM_PAN;
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panStart.copy( getMouseOnScreen( x, y ) );
				_panEnd.copy( _panStart );
				break;

			default:
				_state = STATE.NONE;

		}
		_this.dispatchEvent( startEvent );


	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1:
				_rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				break;

			case 2:
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panEnd.copy( getMouseOnScreen( x, y ) );
				break;

			default:
				_state = STATE.NONE;

		}

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				_rotateStart.copy( _rotateEnd );
				break;

			case 2:
				_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panEnd.copy( getMouseOnScreen( x, y ) );
				_panStart.copy( _panEnd );
				break;

		}

		_state = STATE.NONE;
		_this.dispatchEvent( endEvent );

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousedown', mousedown, false );

	this.domElement.addEventListener( 'mousewheel', mousewheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

	// force an update at start
	this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;



// variables for THREE
var camera, scene, renderer, controls;

// used to store the sparse blocks handle, so we can remove it if needed
var blocks;

// allow images to be loaded from other domains.
THREE.ImageUtils.crossOrigin = '';

var SparseVolViewer = React.createClass({

  getInitialState: function() {
    return {
      'uuid': null,
      'label': null,
      'labelType': null,
      'bodies': null,
      'x': 0,
      'y': 0,
      'z': 0,
      'axis': 'xy',
      'voxRatio': 1
    };
  },

  componentDidMount: function() {
    var self = this;
    // set the uuid on initial load as this wont change during the lifetime
    // of this page.
    var update = 0;
    var new_state = {};
    // foreach property value
    for (var key in this.props) {
       if (this.props.hasOwnProperty(key)) {
         // if the value is not null, then proceed.
         if(this.props[key]) {
           // convert props to state if they are defined and different
          if(this.props[key] !== this.state[key]) {
            new_state[key] = this.props[key];
            update++;
          }
        }
      }
    }

    this.props.dvid.node({
      uuid: this.props.uuid,
      endpoint: this.props.labelType + '/info',
      callback: function(labelInfo) {
        // set the ratio we need to scale the z-axis so that it matches the dimensions of the xy plane.
        // typically this will be a ratio of one for iostropic data, but will be larger when the z
        // dimension has been stretched.
        new_state['voxRatio'] = labelInfo.Extended.VoxelSize[2] / labelInfo.Extended.VoxelSize[0];

        new_state['bodies'] = labelInfo.Base.Syncs[0];
        // trigger an update to the canvas if any of the properties are different
        if (update > 0) {
          self.setState(new_state, function() {
            init(self.state, self.props);
            animate();
          });
        }
      }
    });
  },

  componentWillUnmount: function() {
  },

  comsponentWillUpdate: function() {
  },

  componentDidUpdate: function(prevProps, prevState) {
  },

  componentWillReceiveProps: function (props) {
    var update = 0;
    var new_state = {};

    if (!this.state.bodies) {
      return;
    }

    // foreach property value
    for (var key in props) {
       if (props.hasOwnProperty(key)) {
         // if the value is not null, then proceed.
         if(props[key]) {
           // convert props to state if they are defined and different
          if(props[key] !== this.state[key]) {
            new_state[key] = props[key];
            update++;
          }
        }
      }
    }

    // trigger an update to the canvas if any of the properties are different
    if (update > 0) {
      this.setState(new_state, function() {
        init(this.state, props);
        animate();
      });
    }
  },

  closeHandler: function() {
    console.log('should be implemented by the parent container');
    // http://stackoverflow.com/questions/27227792/react-js-removing-a-component
  },

  render: function () {
    return (
      <div id="volume_viewer">
        <p className="bodymeta">Body ID: {this.state.label}</p>
        <p className="closelink" onClick={this.props.closeHandler}> Close [x]</p>
      </div>
    );
  }

});

module.exports = SparseVolViewer;

function init(state, props) {
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(500, 500 );
  document.getElementById('volume_viewer').appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 70, 500 / 500, 1, 20000 );
  camera.position.z = 8000;

  scene = new THREE.Scene();

  // add lighting
  //var light = new THREE.DirectionalLight( 0xffffff, 1 );
  //light.position.set( 20, 20, 20 ).normalize();
  //scene.add( light );

  // LIGHTS
  var ambientLight = new THREE.AmbientLight( 0x222222 );

  var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light.position.set( 200, 400, 500 );

  var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light2.position.set( -500, 250, -200 );

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);

  var plane = {};


  for (var key in state) {
    if (state.hasOwnProperty(key)) {
      plane[key] = state[key];
    }
  }


  compose_scene(plane, props);


  // lastly setup the controls.
  controls = new THREE.TrackballControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
}

function compose_scene(plane, props) {
  var side = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    side: THREE.DoubleSide,
    opacity: 0.5
  });

  // grab the data from DVID at this point.
  var label = plane.label;

  add_cut_planes(plane.uuid,scene, plane, props);

  if (label) {
    add_sparse_blocks(plane.uuid, scene, label, plane, undefined, props);
    // adding in the more complete sparse volume really kills the browser
    // this is probably not viable until either memory or cpu requirements
    // can be figured out.
    //
    add_sparse(plane.uuid, scene, label, plane, undefined, props);
  }
  add_axis(scene);
};

function add_cut_planes(uuid, scene, plane, props) {
  var cross_cut = new THREE.Object3D();
  plane.axis = 'xy';
  cross_cut.add(cut_plane(plane, uuid, props));
  plane.axis = 'yz';
  cross_cut.add(cut_plane(plane, uuid, props));
  plane.axis = 'xz';
  cross_cut.add(cut_plane(plane, uuid, props));
  cross_cut.translateX(-plane.x);
  cross_cut.translateY(-plane.y);
  cross_cut.translateZ(-plane.z);
  scene.add(cross_cut);
};


function add_sparse(uuid, scene, label, plane, color, props) {
  var createGeometry = function(e) {
    // response is unsigned 8 bit integer
    var responseArray   = new Uint32Array(this.response);
    var dimensions      = new Uint8Array(this.response,1,1);
    var dimensionsOfRun = new Uint8Array(this.response,2,1);
    var spans           = responseArray[2];
    var geometry        = new THREE.BufferGeometry();

    // how many points would we need to draw to get the RLE volume filled.
    var points = 0;
    for (var i = 0; i < spans; i++) {
      var offset = i * 4;
      var span = responseArray[offset + 6];
      points += span;
    }

    var positions = new Float32Array(spans * 3 * 2); //*2 to capture two points per span (startx,endx)
    var colors    = new Float32Array(spans * 3 * 2);
    var color     = new THREE.Color();

    // loop over the spans and work out the dimensions
    var counter = 0; //so we can add two points per span
    for (var i = 0; i < spans; i++) {
      var offset = i * 4;
      var x = (responseArray[offset + 3]);
      var y = (responseArray[offset + 4]);
      var z = responseArray[offset + 5]; //Original Z from server
      //Modify z to handle anisotropic data (stretching)
      z = Math.round( (z - plane.z) * plane.voxRatio ) + plane.z;
      var span = responseArray[offset + 6];

      // this is where we would add all the additional points if we
      // wanted to fill in the RLE gaps.
      //for (j = 0; j < span; j++) {
        // do some work
      //}

      positions[counter * 3] = x;
      positions[(counter * 3) + 1] = y;
      positions[(counter * 3) + 2] = z;

      colors[counter * 3] = 255;
      colors[(counter * 3) + 1] = 255;
      colors[(counter * 3) + 2] = 0;
      counter++;

      //Add in an endpoint for each point
      positions[counter * 3] = x + span;
      positions[(counter * 3) + 1] = y;
      positions[(counter * 3) + 2] = z;

      colors[counter * 3] = 255;
      colors[(counter * 3) + 1] = 255;
      colors[(counter * 3) + 2] = 0;
      counter++;
    }

    geometry.addAttribute( 'position', new  THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    var material = new THREE.PointCloudMaterial( { size: 2, vertexColors: THREE.VertexColors } );
    var particleSystem = new THREE.PointCloud( geometry, material );

    particleSystem.translateX(-plane.x);
    particleSystem.translateY(-plane.y);
    particleSystem.translateZ(-plane.z);

    scene.add( particleSystem );
    scene.remove(blocks);

  };

  props.dvid.node({
    uuid: uuid,
    endpoint: plane.bodies + '/sparsevol/' + label,
    data: true,
    callback: createGeometry
  });

};


function add_sparse_blocks(uuid, scene, label, plane, color, props) {
  var cube_size = 32; // need to get this from dvid

  var createGeometry = function(e) {
    // response is unsigned 8 bit integer
    var responseArray   = new Uint32Array(this.response);
    var dimensions      = new Uint8Array(this.response,1,1);
    var dimensionsOfRun = new Uint8Array(this.response,2,1);
    var spans           = responseArray[2];
    var geometry        = new THREE.BoxGeometry( cube_size, cube_size, cube_size);
    color = color ? color : 0xffff00;
    var mesh            = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 } );
    var group           = new THREE.Object3D();

    // loop over the spans and work out the dimensions
    for (var i = 0; i < spans; i++) {
      var offset = i * 4;
      var x = (responseArray[offset + 3] * 32) + 16;
      var y = (responseArray[offset + 4] * 32) + 16;
      var z = (responseArray[offset + 5] * 32) + 16;
      var span = responseArray[offset + 6];

      for (var j = 0; j < span; j++) {
        var cube = new THREE.Mesh(geometry,mesh);

        cube.position.x = parseInt(x) + (j * 32);
        cube.position.y = y;
        cube.position.z = z;

        group.add(cube);
      }
    }

    // places the cut plane at the center of the scene, so that rotation
    // is centered around it.
    group.translateX(-plane.x);
    group.translateY(-plane.y);
    group.translateZ(-plane.z);

    scene.add(group);

    blocks = group;

  };

  props.dvid.node({
    uuid: uuid,
    endpoint: plane.bodies + '/sparsevol-coarse/' + label,
    data: true,
    callback: createGeometry
  });

};


// Create the cut plane to show context from the original
// 2D image location
function cut_plane(plane, uuid, props) {
  var size = 512;

  var imgSrc = null;
  if (plane.axis === 'yz') {
    imgSrc = THREE.ImageUtils.loadTexture(props.dvid.isoImageUrl({
      uuid: uuid,
      tileSource: plane.tileSource,
      axis: plane.axis,
      size: size,
      x: Math.round(plane.x),
      y: Math.round(plane.y) - (size / 2),
      z: plane.z - Math.round( ( size / plane.voxRatio ) / 2)
    }));

    // imgSrc = THREE.ImageUtils.loadTexture('http://localhost:8021/test-square.jpg');
  }
  else if (plane.axis === 'xz') {
    imgSrc = THREE.ImageUtils.loadTexture(props.dvid.isoImageUrl({
      uuid: uuid,
      tileSource: plane.tileSource,
      axis: plane.axis,
      size: size,
      x: Math.round(plane.x) - (size / 2),
      y: Math.round(plane.y),
      z: plane.z - Math.round( ( size / plane.voxRatio ) / 2)
    }));
    // imgSrc = THREE.ImageUtils.loadTexture('http://localhost:8021/test-square.jpg');
  }
  else {
    imgSrc = THREE.ImageUtils.loadTexture(props.dvid.isoImageUrl({
      uuid: uuid,
      tileSource: plane.tileSource,
      axis: plane.axis,
      size: size,
      x: Math.round(plane.x) - (size / 2),
      y: Math.round(plane.y) - (size / 2),
      z: plane.z
    }));
    //imgSrc = THREE.ImageUtils.loadTexture('http://localhost:8021/test-square.jpg');
  }


  var planeGeo = new THREE.PlaneGeometry(size,size);
  var cutPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: false,
    map: imgSrc,
    opacity: 0.7
  }));
  cutPlane.position.x = parseInt(plane.x);
  cutPlane.position.y = parseInt(plane.y);
  cutPlane.position.z = parseInt(plane.z);
  // Rotate the plane so that it is on the correct axis if it
  // was not cut along the xy.
  if (plane.axis === 'yz') {
    cutPlane.rotation.y = -Math.PI / 2;
    cutPlane.rotation.x = -Math.PI / 2;
  }
  else if (plane.axis === 'xz') {
    cutPlane.rotation.x = -Math.PI / 2;
  }
  else {
    cutPlane.rotation.x = -Math.PI;
  }
  return cutPlane;
};

function add_axis(scene) {
  var geometry        = new THREE.BoxGeometry( 2,2,2 );

  var color           = 0xff0000;
  var mesh            = new THREE.MeshBasicMaterial({ color: color } );
  var x_line = new THREE.Mesh(geometry,mesh);
  x_line.scale.x = 5000;
  x_line.position.x = 5000;
  scene.add(x_line);

  color           = 0x00ff00;
  mesh            = new THREE.MeshBasicMaterial({ color: color } );
  var y_line = new THREE.Mesh(geometry,mesh);
  y_line.scale.y = 5000;
  y_line.position.y = 5000;
  scene.add(y_line);

  color           = 0x0000ff;
  mesh            = new THREE.MeshBasicMaterial({ color: color } );
  var z_line = new THREE.Mesh(geometry,mesh);
  z_line.scale.z = 5000;
  z_line.position.z = 5000;
  scene.add(z_line);
};
