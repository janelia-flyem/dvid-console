/**
  * @author DocSavage / http://github.com/DocSavage
  * @author Bill Katz
  */

// Creates a 3d orientation scene with a bounding box and associated cutView3d object.
DVID.Orientation3D = function(halfSize, width, height) {
    if (halfSize === undefined) {
        halfSize = 300;
    }
    this.width = width;
    this.height = height;
    this.halfSize = halfSize;

    this.camera = new THREE.PerspectiveCamera(30, width / height, 1, halfSize * 30);
    this.camera.position.copy(DVID.dataset.center);
    var cameraOffset = new THREE.Vector3(2000, 4000, 10000);
    this.camera.position.add(cameraOffset);
    this.camera.lookAt(DVID.dataset.center);

    this.scene = new THREE.Scene();
    //this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(0xffffff));

    var geometry = new THREE.PlaneGeometry(2 * halfSize, 2 * halfSize);

    // Orthogonal cut planes using meshes

    this.planes = {
        xy: new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0xff22ff})),
        xz: new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0x22ff66})),
        yz: new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0x2222ff}))
    };

    // Rotate the planes into proper orientation.
    this.planes.xy.rotation.x = -Math.PI;
    this.planes.xz.rotation.x = -Math.PI / 2;
    this.planes.yz.rotation.y = -Math.PI / 2;
    this.planes.yz.rotation.x = -Math.PI / 2;

    // Since we are trying to establish orientation, put planes at "center"
    this.planes.xy.position.copy(DVID.dataset.center);
    this.planes.xz.position.copy(DVID.dataset.center);
    this.planes.yz.position.copy(DVID.dataset.center);

    // Setup initial material properties and add planes to scene.
    for (var p in this.planes) {
        var plane = this.planes[p];
        plane.material.ambient = plane.material.color;
        plane.material.side = THREE.DoubleSide;
        this.scene.add(plane);
    }

    // Add the bounding box.
    var bboxSize = new THREE.Vector3();
    bboxSize.subVectors(DVID.dataset.maxPt, DVID.dataset.minPt);
    var cubeGeom = new THREE.CubeGeometry( bboxSize.x, bboxSize.y, bboxSize.z, 5, 5, 5);
    var bboxOffset = new THREE.Vector3();
    bboxOffset.addVectors(DVID.dataset.minPt, DVID.dataset.maxPt);
    bboxOffset.divideScalar(2.0);
    var bboxMaterial = new THREE.MeshBasicMaterial({color: 0xff2222, wireframe: true});
    var bbox = new THREE.Mesh(cubeGeom, bboxMaterial);
    bbox.position.copy(bboxOffset);
    this.scene.add(bbox);
    console.log("bbox:", bboxSize.x, bboxSize.y, bboxSize.z);
    console.log("cubeGeom:", cubeGeom);

    // Add picking support.
    this.hit = {
        selected: false,
        plane: null,
        offset: new THREE.Vector3(),
        object: {}
    };

    this.hit.plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 2000, 2000, 8, 8 ),
        new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } )
    );
    this.hit.plane.visible = false;
    this.scene.add( this.hit.plane );

    this.projector = new THREE.Projector();

    // Setup the renderer.
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.sortObjects = false;
    this.renderer.setSize(width, height);
    this.renderer.shadowMapEnabled = true;

    // Setup the trackball.
    /*
    this.trackball = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.trackball.rotateSpeed = 1.0;
    this.trackball.zoomSpeed = 1.2;
    this.trackball.panSpeed = 0.8;
    this.trackball.noZoom = false;
    this.trackball.noPan = false;
    this.trackball.staticMoving = true;
    this.trackball.dynamicDampingFactor = 0.3;
    this.trackball.target.copy(DVID.dataset.center);
    */

    // Keep track of mouse.
    this.mouse = new THREE.Vector2();

    this.request_active = {
        xy: false,
        xz: false,
        yz: false
    };
};

DVID.Orientation3D.prototype = {

    constructor: DVID.Orientation3D,

    background: {
        xy: DVID.loadTexture('/browser3d/images/xy-520x520.png'),
        xz: DVID.loadTexture('/browser3d/images/xz-520x520.png'),
        yz: DVID.loadTexture('/browser3d/images/yz-520x520.png')
    },

    render: function() {
        //this.trackball.update();
        this.renderer.render(this.scene, this.camera);
    },

    animate: function() {
        console.log("start", this);
        var render = this.render;
        var requestAnimationFrame = window.requestAnimationFrame;
        var origObj = this;  // 'this' could change meaning on repeated animate(), so use closure.
        function animateFrame() {
            requestAnimationFrame(animateFrame);
            origObj.render();
        }
        animateFrame();
    },

    getDomElement: function() {
        return this.renderer.domElement;
    },

    resize: function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    notifyRotationChange: function(quaternion) {
        var pos = this.camera.position.clone();
        pos.sub(DVID.dataset.center);
        pos.applyQuaternion(quaternion);
        pos.add(DVID.dataset.center);
        this.camera.up.applyQuaternion(quaternion);
        this.camera.position = pos;
        this.camera.lookAt(DVID.dataset.center);
    },

    notifyCenterChange: function(center) {
        this.planes.xy.position.copy(center);
        this.planes.xz.position.copy(center);
        this.planes.yz.position.copy(center);
    },

    // Returns true if we are moving something.
    mouseDown: function() {
        if (!DVID.dataset.planes) {
            this.hit.object = null;
            return false;
        }

        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        this.projector.unprojectVector(vector, this.camera);

        this.planeSelect(this.camera.position, vector.sub(this.camera.position).normalize());
        if (this.hit.selected) {
            this.trackball.enabled = false;
            return true;
        }
        return false;
    },

    mouseUp: function() {
        this.trackball.enabled = true;
        this.planesUnselect();
    },

    // Returns true if mouse now hovers over a selectable object.
    mouseMove: function(x, y) {
        this.mouse.x = ( x / this.width ) * 2 - 1;
        this.mouse.y = - ( y / this.height ) * 2 + 1;

        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        this.projector.unprojectVector(vector, this.camera);
        var origin = this.camera.position;
        var direction = vector.sub(this.camera.position).normalize();

        if (this.hit.selected) {
            var raycaster = new THREE.Raycaster(origin, direction);
            var intersects = raycaster.intersectObject(this.hit.plane);
            if (intersects.length > 0) {
                var newPos = intersects[0].point.sub(this.hit.offset);
                this.planeMove(newPos);
            }
            return true
        } else {
            this.planeCheck(origin, direction);
            if (this.hit.object !== null) {
                return true;
            }
        }
        return false;
    },

    // Check if a line-of-sight could potentially select a plane and highlight it.
    planeCheck: function(orig, dir) {
        if (this.hit.selected) {
            return;     // Don't look for new plane intersections if we have an already selected plane.
        }
        var raycaster = new THREE.Raycaster(orig, dir);
        var intersects = raycaster.intersectObjects(this.planes);
        if (intersects.length > 0) {
            if (this.hit.object != intersects[0].object) {
                this.hit.object = intersects[0].object;

                this.hit.plane.position.copy(this.hit.object.position);
                this.hit.plane.lookAt(this.camera.position);
            }
        } else {
            this.hit.object = null;
        }
    },

    planesUnselect: function() {
        this.hit.selected = false;
    },

    planeSelectByDirection: function(direction) {
        var absx = Math.abs(direction.x);
        var absy = Math.abs(direction.y);
        var absz = Math.abs(direction.z);
        if (absz > absx && absz > absy) {
            this.hit.selected = true;
            this.hit.object = this.planes.xy;
        } else if (absy > absz && absy > absx) {
            this.hit.selected = true;
            this.hit.object = this.planes.xz;
        } else if (absx > absz && absx > absy) {
            this.hit.selected = true;
            this.hit.object = this.planes.yz;
        } else {
            this.planesUnselect();
            this.hit.object = null;
        }
        if (this.hit.object !== null) {
            console.log("Selected ", this.hit.object.sliceName, 'plane (',
                absx, ',', absy, ',', absz, ')');
        }
    },

    planeSelect: function(origin, direction) {
        var raycaster = new THREE.Raycaster(origin, direction);
        var intersects = raycaster.intersectObjects(this.planes);
        if (intersects.length > 0) {
            this.hit.selected = true;
            this.hit.object = intersects[0].object;
            console.log("Selected ", this.hit.object.sliceName, " plane");

            var intersects = raycaster.intersectObject( this.hit.plane );
            if (intersects.length > 0) {
                this.hit.offset.copy( intersects[0].point ).sub( this.hit.plane.position );
            }
        } else {
            this.planesUnselect();
            this.hit.object = null;
        }
        return this.hit.object;
    },

    // Move the selected plane to a coordinate designated by pos (with 'x', 'y', and 'z' properties)
    planeMove: function(pos) {
        if (this.hit.object === null || !this.hit.selected) {
            return;
        }
        var slice;
        switch (this.hit.object.sliceName) {
            case 'xy':
                slice = THREE.Math.clamp(pos.z, this.view3d.minPt.z, this.view3d.maxPt.z);
                this.hit.object.position.z = slice;
                this.refresh('xy');
                break;
            case 'xz':
                slice = THREE.Math.clamp(pos.y, this.view3d.minPt.y, this.view3d.maxPt.y);
                this.hit.object.position.y = slice;
                this.refresh('xz');
                break;
            case 'yz':
                slice = THREE.Math.clamp(pos.x, this.view3d.minPt.x, this.view3d.maxPt.x);
                this.hit.object.position.x = slice;
                this.refresh('yz');
                break;
        }
    },

    // Move the selected plane by a given delta (with 'x', 'y', and 'z' properties.
    planeDelta: function(delta) {
        if (this.hit.object === null || !this.hit.selected) {
            return;
        }
        var slice;
        switch (this.hit.object.sliceName) {
            case 'xy':
                slice = this.planes.xy.position.z + delta.z;
                slice = THREE.Math.clamp(slice, this.view3d.minPt.z, this.view3d.maxPt.z);
                this.hit.object.position.z = slice;
                this.refresh('xy');
                break;
            case 'xz':
                slice = this.planes.xz.position.y + delta.y;
                slice = THREE.Math.clamp(slice, this.view3d.minPt.y, this.view3d.maxPt.y);
                this.hit.object.position.y = slice;
                this.refresh('xz');
                break;
            case 'yz':
                slice = this.planes.yz.position.x + delta.x;
                slice = THREE.Math.clamp(slice, this.view3d.minPt.x, this.view3d.maxPt.x);
                this.hit.object.position.x = slice;
                this.refresh('yz');
                break;
        }
    },

    refresh: function(sliceType) {
        if (this.request_active[sliceType]) {
            return;
        }
        var dataname = DVID.dataset.imageName;
        var uuid = DVID.dataset.uuid;
        this.request_active[sliceType] = true;

        this.planes[sliceType].material.map = this.background[sliceType];
        this.planes[sliceType].material.map.needsUpdate = true;
        this.request_active[sliceType] = false;
    }
};