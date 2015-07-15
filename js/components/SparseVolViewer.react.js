var React    = require('react'),
  Router     = require('react-router'),
  config     = require('../utils/config'),
  core       = require('../utils/core'),
  dataSource = config.baseUrl();

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
