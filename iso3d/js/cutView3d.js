/**
  * @author DocSavage / http://github.com/DocSavage
  * @author Bill Katz
  */

// See https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

DVID.CutView3D = function(width, height, orientation3d, stats) {

	this.stats = stats;
    this.width = width;
    this.height = height;
    //this.planeSize = 250;
    this.viewRadius = 250;

    this.orientation3d = orientation3d;

    this.resetDataset();

    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, this.viewRadius * 100);
    this.camera.position = new THREE.Vector3(400, 800, 4000);
    this.camera.matrixAutoUpdate = true;

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(0x060606));

    this.light = new THREE.DirectionalLight(0xffffff, DVID.dataset.directionalLight);
    this.light.castShadow = true;
    this.directionalLight = 1.0;

    this.camera.add(this.light);
    this.light.position.set(0,0,2000);
    this.light.target = this.camera;

    this.resetPlanes(true);

    // Add picking support.
    this.hit = {
        selected: false,
        plane: null,
        offset: new THREE.Vector3(),
        object: {}
    };

    this.hit.plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 20000, 20000 ),
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
    this.trackball = new THREE.TrackballControls(this.camera, this.renderer.domElement, this.orientation3d);
    this.trackball.rotateSpeed = 1.0;
    this.trackball.zoomSpeed = 1.2;
    this.trackball.panSpeed = 0.8;
    this.trackball.noZoom = false;
    this.trackball.noPan = false;
    this.trackball.staticMoving = true;
    this.trackball.dynamicDampingFactor = 0.3;
    //this.trackball.target.copy(DVID.dataset.center);

    // Keep track of mouse.
    this.mouse = new THREE.Vector2();

    this.lastRequest = {
        xy: '',
        xz: '',
        yz: ''
    };
    this.showPlanes = true;
    this.showTiles = false;
    this.showAxesOnly = false;

    // Handle sparse volume picking
    this.pickBodies = false;
    this.showBodies = true;
	this.bodyAlpha = 1.0;
    this.sparseVolumeColor = '#10ffff';

    this.leap.controller = new Leap.Controller({enableGestures: true});
    if (this.leap.controller) {
        var that = this;
        this.leap.controller.on('connect', function() {
            setInterval(function() {
                that.leap.frameFunction.call(that);
            }, that.leap.pollFrequency);
        });
        this.leap.controller.connect();
    }
    
    // Add chunk grid so we can see size of grids.
    this.showingChunks = false;
    this.chunkGrid = this.makeChunkGrid();
    
/*
    var xhr = new XMLHttpRequest();
//    var url = DVID.sparseVolByLabelUrl('bodies', 9779);
    var url = DVID.surfaceByLabelUrl('segmentation', 3532);
    console.log("Calling ", url);
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    var origObj = this;
    xhr.onload = function(e) {
        var arrayBuffer = xhr.response;
        if (arrayBuffer) {
            origObj.addSurface(arrayBuffer, '#10ffff');
        }
    };
    xhr.send();

    var xhr2 = new XMLHttpRequest();
//    var url2 = DVID.sparseVolByLabelUrl('bodies', 17374);
    var url2 = DVID.surfaceByLabelUrl('segmentation', 3833);
    xhr2.open('GET', url2, true);
    xhr2.responseType = 'arraybuffer';

    xhr2.onload = function(e) {
        var arrayBuffer = xhr2.response;
        if (arrayBuffer) {
            origObj.addSurface(arrayBuffer, '#ffff10');
        }
    };
    xhr2.send();

    var xhr3 = new XMLHttpRequest();
//    var url3 = DVID.sparseVolByLabelUrl('bodies', 15147);
    var url3 = DVID.surfaceByLabelUrl('segmentation', 2792);
    xhr3.open('GET', url3, true);
    xhr3.responseType = 'arraybuffer';

    xhr3.onload = function(e) {
        var arrayBuffer = xhr3.response;
        if (arrayBuffer) {
            origObj.addSurface(arrayBuffer, '#ff05ff');
        }
    };
    xhr3.send();
    */
};

DVID.CutView3D.prototype = {

    constructor: DVID.CutView3D,

    background: {
        xy: DVID.loadTexture('/browser3d/images/xy-520x520.png'),
        xz: DVID.loadTexture('/browser3d/images/xz-520x520.png'),
        yz: DVID.loadTexture('/browser3d/images/yz-520x520.png')
    },

    resetDataset: function() {
        this.minPt = DVID.dataset.minPt;
        this.maxPt = DVID.dataset.maxPt;
		this.resolution = DVID.dataset.resolution;
        var center = new THREE.Vector3();
        center.addVectors(this.minPt, this.maxPt);
        center.divideScalar(2);
        this.center = center;
        console.log("On reset dataset, center now", this.center);
        console.log("DVID dataset:", DVID.dataset);
    },

    changedBody: function(label) {
        console.log("DVID.dataset.labelID = ", DVID.dataset.labelID);
        console.log("changedBody to ", label);
    },

    makeChunkGrid: function() {
        var CHUNK_SIZE = 32;
        var planeGeo = new THREE.PlaneGeometry(4 * this.viewRadius, 4 * this.viewRadius);
                
        // Create planes for the grid
        var planes = {
            xy: [],
            xz: [],
            yz: []
        };
        var numPlanes = 4 * this.viewRadius / CHUNK_SIZE;
        var xyPos = new THREE.Vector3(0.0, 0.0, -2 * this.viewRadius);
        var xzPos = new THREE.Vector3(0.0, -2 * this.viewRadius, 0.0);
        var yzPos = new THREE.Vector3(-2 * this.viewRadius, 0.0, 0.0);
        for (var i = 0; i < numPlanes; i++) {
            planes.xy.push(new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 1})));
            planes.xz.push(new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 1})));
            planes.yz.push(new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 1})));

            // Rotate the planes into proper orientation.
            planes.xy[i].rotation.x = -Math.PI;

            planes.xz[i].rotation.x = -Math.PI / 2;

            planes.yz[i].rotation.y = -Math.PI / 2;
            planes.yz[i].rotation.x = -Math.PI / 2;
            
            // Move this particular plane.
            planes.xy[i].position = xyPos.clone();
            xyPos.z += CHUNK_SIZE;
            planes.xz[i].position = xzPos.clone();
            xzPos.y += CHUNK_SIZE;
            planes.yz[i].position = yzPos.clone();
            yzPos.x += CHUNK_SIZE;
            /*
            planes.xz[i].position.x = xzPos.x;
            planes.xz[i].position.y = xzPos.y;
            planes.xz[i].position.z = xzPos.z;
            xyPos.z += CHUNK_SIZE;

            planes.xy[i].position.x = xyPos.x;
            planes.xy[i].position.y = xyPos.y;
            planes.xy[i].position.z = xyPos.z;
            xyPos.z += CHUNK_SIZE;
*/
        }
        
        return planes;
    },
    
    refreshChunkView: function() {
        if (this.showingChunks) {
            for (var p in this.chunkGrid.xy) {
                this.scene.add(this.chunkGrid.xy[p]);
            }
            for (var p in this.chunkGrid.xz) {
                this.scene.add(this.chunkGrid.xz[p]);
            }
            for (var p in this.chunkGrid.yz) {
                this.scene.add(this.chunkGrid.yz[p]);
            }
        } else {
            for (var p in this.chunkGrid.xy) {
                this.scene.remove(this.chunkGrid.xy[p]);
            }
            for (var p in this.chunkGrid.xz) {
                this.scene.remove(this.chunkGrid.xz[p]);
            }
            for (var p in this.chunkGrid.yz) {
                this.scene.remove(this.chunkGrid.yz[p]);
            }            
        }
    },

    resetPlanes: function(init) {
        if (!init) {
            for (var p in this.planes) {
                if (this.planes.hasOwnProperty(p)) {
                    this.scene.remove(this.planes[p]);
                }
            }
            for (var p in this.planeOutlines) {
                if (this.planeOutlines.hasOwnProperty(p)) {
                    this.scene.remove(this.planeOutlines[p]);
                }
            }
        }
        this.planeGeo = new THREE.PlaneGeometry(2 * this.viewRadius, 2 * this.viewRadius);
        this.planeGeo2 = new THREE.PlaneGeometry(2 * this.viewRadius, this.viewRadius);
        this.planeGeo.dynamic = true;

        // Setup the custom shaders for the cut planes
        var fragmentShader, ambient, diffuse, specular, shininess, grayAlpha;
        if (DVID.dataset.imageName === 'grayscale') {
            fragmentShader = document.getElementById('grayscale-fragmentshader').textContent;
            ambient = { type: "f", value: 0.3 };
            diffuse = { type: "f", value: 0.6 };
            specular = { type: "f", value: 0.4 };
            shininess = { type: "f", value: 32.0 };
            grayAlpha = { type: "f", value: 0.9 };
        } else {
            fragmentShader = document.getElementById('labels-fragmentshader').textContent;
            ambient = { type: "f", value: 0.4 };
            diffuse = { type: "f", value: 0.8 };
            specular = { type: "f", value: 0.4 };
            shininess = { type: "f", value: 128.0 };
            grayAlpha = { type: "f", value: 0.8 };
        }
        var resX = this.resolution.getComponent(0);
        var resY = this.resolution.getComponent(1);
        var resZ = this.resolution.getComponent(2);
        var minRes = Math.min(resX, resY, resZ)
        var maxRes = Math.max(resX, resY, resZ)
        var size = 3.0; //maxRes / minRes;
        var anisotropy = this.resolution.divideScalar(minRes);
        var materialsXY = new THREE.ShaderMaterial({
            uniforms: {
                uAmbient: ambient,
                uDiffuse: diffuse,
                uSpecular: specular,
                uShininess: shininess,
                uCenter:  { type: "v3", value: this.center },
                uAnisotropy: { type: "v3", value: anisotropy },
                uLight1: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1000.0) },
                grayAlpha: grayAlpha,
                alpha: { type: "f", value: 1.0 },
                uColor: { type: "c", value: new THREE.Color(0xffffff) },
                texture: { type: "t", value: this.background.xy }
            },
            vertexShader: document.getElementById('plane-vertexshader').textContent,
            fragmentShader: fragmentShader
        });
        var materialsXZ = new THREE.ShaderMaterial({
            uniforms: {
                uAmbient: { type: "f", value: 0.3 },
                uDiffuse: { type: "f", value: 0.6 },
                uSpecular: { type: "f", value: 0.4 },
                uShininess: { type: "f", value: 32.0 },
                uCenter:  { type: "v3", value: this.center },
                uAnisotropy: { type: "v3", value: anisotropy },
                uLight1: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1000.0) },
                grayAlpha: { type: "f", value: 0.9 },
                alpha: { type: "f", value: 1.0 },
                uColor: { type: "c", value: new THREE.Color(0xffffff) },
                texture: { type: "t", value: this.background.xz }
            },
            vertexShader: document.getElementById('plane-vertexshader').textContent,
            fragmentShader: fragmentShader
        });
        var materialsYZ = new THREE.ShaderMaterial({
            uniforms: {
                uAmbient: { type: "f", value: 0.3 },
                uDiffuse: { type: "f", value: 0.6 },
                uSpecular: { type: "f", value: 0.4 },
                uShininess: { type: "f", value: 32.0 },
                uCenter:  { type: "v3", value: this.center },
                uAnisotropy: { type: "v3", value: anisotropy },
                uLight1: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1000.0) },
                grayAlpha: { type: "f", value: 0.9 },
                alpha: { type: "f", value: 1.0 },
                uColor: { type: "c", value: new THREE.Color(0xffffff) },
                texture: { type: "t", value: this.background.yz }
            },
            vertexShader: document.getElementById('plane-vertexshader').textContent,
            fragmentShader: fragmentShader
        });


        // Orthogonal cut planes using meshes
        this.planes = {
            xy: new THREE.Mesh(this.planeGeo, materialsXY),
            xz: new THREE.Mesh(this.planeGeo, materialsXZ),
            yz: new THREE.Mesh(this.planeGeo, materialsYZ)
        };
        this.planes.xy.sliceName = 'xy';
        this.planes.xz.sliceName = 'xz';
        this.planes.yz.sliceName = 'yz';

        // The cut plane borders.
        this.planeOutlines = {
            xy: new THREE.Mesh(this.planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 3})),
            xz: new THREE.Mesh(this.planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 3})),
            yz: new THREE.Mesh(this.planeGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, wireframeLinewidth: 3}))
        };

        // Rotate the planes into proper orientation.
        this.planes.xy.rotation.x = -Math.PI;
        this.planeOutlines.xy.rotation.x = -Math.PI;

        this.planes.xz.rotation.x = -Math.PI / 2;
        this.planeOutlines.xz.rotation.x = -Math.PI / 2;

        this.planes.yz.rotation.y = -Math.PI / 2;
        this.planes.yz.rotation.x = -Math.PI / 2;
        this.planeOutlines.yz.rotation.y = -Math.PI / 2;
        this.planeOutlines.yz.rotation.x = -Math.PI / 2;

        // Setup initial material properties and add planes to scene.
        for (var p in this.planes) {
            if (this.planes.hasOwnProperty(p)) {
                var plane = this.planes[p];
                plane.material.ambient = plane.material.color;
                plane.material.side = THREE.DoubleSide;
                plane.castShadow = true;
                plane.receiveShadow = true;
                this.scene.add(plane);
            }
        }

        // Turn off the plane outlines and add to scene.
        for (var p in this.planeOutlines) {
            if (this.planeOutlines.hasOwnProperty(p)) {
                this.planeOutlines[p].visible = false;
                this.scene.add(this.planeOutlines[p]);
            }
        }
    },

    render: function() {
        this.trackball.update();
        this.renderer.render(this.scene, this.camera);
        //this.orientation3d.notifyChange(this.camera);
    },

    animate: function() {
        var render = this.render;
        var requestAnimationFrame = window.requestAnimationFrame;
        var origObj = this;  // 'this' could change meaning on repeated animate(), so use closure.
        function animateFrame() {
            requestAnimationFrame(animateFrame);
            origObj.render();
			origObj.stats.update();
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

    // Returns true if we are moving something.
    mouseDown: function() {
        if (!this.showPlanes) {
            this.hit.object = null;
            return false;
        }

        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        this.projector.unprojectVector(vector, this.camera);

        if (this.pickBodies) {
            this.selectSurface(this.camera.position, vector.sub(this.camera.position).normalize());
        } else {
            this.planeSelect(this.camera.position, vector.sub(this.camera.position).normalize());
            if (this.hit.selected) {
                this.trackball.enabled = false;
                return true;
            }
        }
        return false;
    },

    mouseUp: function() {
        this.trackball.enabled = true;
        this.planesUnselect();
    },

    // Returns true if mouse now hovers over a selectable object.
    mouseMove: function(x, y) {
        // Translate client coords into viewport x,y
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

    // Handle arrow keys for moving center.
    keyDown: function(keyCode) {
        var delta = 4;
        switch (keyCode) {
            case 37: // left
                this.center.x -= delta;
                if (this.center.x < this.minPt.x) {
                    this.center.x = this.minPt.x;
                }
                break;
            case 39: // right
                this.center.x += delta;
                if (this.center.x > this.maxPt.x) {
                    this.center.x = this.maxPt.x;
                }
                break;
            case 38: // up
                this.center.z -= delta;
                if (this.center.z < this.minPt.z) {
                    this.center.z = this.minPt.z;
                }
                break;
            case 40: // down
                this.center.z += delta;
                if (this.center.z > this.maxPt.z) {
                    this.center.z = this.maxPt.z;
                }
                break;
        }
        this.changedCenter();
    },

    // Rotate into scene view.
    applyCamera: function(vec) {
        var out = new THREE.Vector3(vec.x, vec.y, vec.z);
        // TODO -- make sure euler angle order is XYZ or put in switch
        var mat = new THREE.Matrix4();
        mat.extractRotation(this.camera.matrixWorld);
        out.applyMatrix4(mat);
        return out;
    },

    // Check if a line-of-sight could potentially select a plane and highlight it.
    planeCheck: function(orig, dir) {
        if (this.hit.selected) {
            return;     // Don't look for new plane intersections if we have an already selected plane.
        }

        var raycaster = new THREE.Raycaster(orig, dir);
        var objects = [];
        objects.push(this.planes.xy);
        objects.push(this.planes.xz);
        objects.push(this.planes.yz);
        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            if (this.hit.object !== intersects[0].object) {
                this.hit.object = intersects[0].object;

                this.hit.plane.position.copy(this.hit.object.position);
                this.hit.plane.lookAt(this.camera.position);

                if (this.showPlanes) {
                    for (var p in this.planeOutlines) {
                        this.planeOutlines[p].visible = false;
                    }
                    this.planeOutlines[this.hit.object.sliceName].visible = true;
                }
            }
        } else {
            this.hit.object = null;
            for (var p in this.planeOutlines) {
                this.planeOutlines[p].visible = false;
            }
        }
    },

    planesUnselect: function() {
        this.hit.selected = false;
        this.planeOutlines.xy.visible = false;
        this.planeOutlines.xz.visible = false;
        this.planeOutlines.yz.visible = false;
    },

    // Highlight the selected plane.
    planeHighlight: function() {
        if (this.showPlanes && this.hit.object && !this.pickBodies) {
            switch (this.hit.object.sliceName) {
                case 'xy':
                    this.planeOutlines.xy.visible = true;
                    this.planeOutlines.xz.visible = false;
                    this.planeOutlines.yz.visible = false;
                    break;
                case 'xz':
                    this.planeOutlines.xy.visible = false;
                    this.planeOutlines.xz.visible = true;
                    this.planeOutlines.yz.visible = false;
                    break;
                case 'yz':
                    this.planeOutlines.xy.visible = false;
                    this.planeOutlines.xz.visible = false;
                    this.planeOutlines.yz.visible = true;
                    break;
            }
        }
    },

    planeSelectByDirection: function(direction) {
        var mult = 1.3;
        var absx = Math.abs(direction.x);
        var absy = Math.abs(direction.y);
        var absz = Math.abs(direction.z);
        if (absz > mult * absx && absz > mult * absy) {
            this.hit.selected = true;
            this.hit.object = this.planes.xy;
        } else if (absy > mult * absz && absy > mult * absx) {
            this.hit.selected = true;
            this.hit.object = this.planes.xz;
        } else if (absx > mult * absz && absx > mult * absy) {
            this.hit.selected = true;
            this.hit.object = this.planes.yz;
        } else {
            this.planesUnselect();
            this.hit.object = null;
        }
        if (this.hit.object !== null) {
            return this.hit.object.sliceName;
        } else {
            return false;
        }
    },

    // Returns intersection objects sorted from closest to farthest
    cutPlaneIntersection: function(origin, direction) {
        var raycaster = new THREE.Raycaster(origin, direction);
        var objects = [];
        objects.push(this.planes.xy);
        objects.push(this.planes.xz);
        objects.push(this.planes.yz);
        return raycaster.intersectObjects(objects);
    },

    planeSelect: function(origin, direction) {
        var raycaster = new THREE.Raycaster(origin, direction);
        var objects = [];
        objects.push(this.planes.xy);
        objects.push(this.planes.xz);
        objects.push(this.planes.yz);
        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            this.hit.selected = true;
            this.hit.object = intersects[0].object;

            var intersects = raycaster.intersectObject( this.hit.plane );
            if (intersects.length > 0) {
                this.hit.offset.copy( intersects[0].point ).sub( this.hit.plane.position );
            }
            this.planeHighlight();
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
                slice = THREE.Math.clamp(pos.z, -this.viewRadius, this.viewRadius);
                this.hit.object.position.z = slice;
                this.planeOutlines.xy.position.z = slice;
                this.refresh('xy');
                break;
            case 'xz':
                slice = THREE.Math.clamp(pos.y, -this.viewRadius, this.viewRadius);
                this.hit.object.position.y = slice;
                this.planeOutlines.xz.position.y = slice;
                this.refresh('xz');
                break;
            case 'yz':
                slice = THREE.Math.clamp(pos.x, -this.viewRadius, this.viewRadius);
                this.hit.object.position.x = slice;
                this.planeOutlines.yz.position.x = slice;
                this.refresh('yz');
                break;
        }
    },

    // Constrain a plane, e.g., 'xy', 'xz', 'yz', to fit within cube dictated by this.viewRadius.
    constrainPlane: function(plane) {
        var slice;
        switch (plane) {
            case 'xy':
                slice = THREE.Math.clamp(this.planes.xy.position.z, -this.viewRadius, this.viewRadius);
                this.planes.xy.position.z = slice;
                this.planeOutlines.xy.position.z = slice;
                break;
            case 'xz':
                slice = THREE.Math.clamp(this.planes.xz.position.y, -this.viewRadius, this.viewRadius);
                this.planes.xz.position.y = slice;
                this.planeOutlines.xz.position.y = slice;
                break;
            case 'yz':
                slice = THREE.Math.clamp(this.planes.yz.position.x, -this.viewRadius, this.viewRadius);
                this.planes.yz.position.x = slice;
                this.planeOutlines.yz.position.x = slice;
                break;
        }
        this.refresh(plane);
    },

    // Move the selected plane by a given delta (with 'x', 'y', and 'z' properties.
    planeMoveByDelta: function(delta) {
        if (this.hit.object === null || !this.hit.selected) {
            return;
        }
        var slice;
        switch (this.hit.object.sliceName) {
            case 'xy':
                slice = this.planes.xy.position.z + delta.z;
                slice = THREE.Math.clamp(slice, -this.viewRadius, this.viewRadius);
                this.hit.object.position.z = slice;
                this.planeOutlines.xy.position.z = slice;
                this.refresh('xy');
                break;
            case 'xz':
                slice = this.planes.xz.position.y + delta.y;
                slice = THREE.Math.clamp(slice, -this.viewRadius, this.viewRadius);
                this.hit.object.position.y = slice;
                this.planeOutlines.xz.position.y = slice;
                this.refresh('xz');
                break;
            case 'yz':
                slice = this.planes.yz.position.x + delta.x;
                slice = THREE.Math.clamp(slice, -this.viewRadius, this.viewRadius);
                this.hit.object.position.x = slice;
                this.planeOutlines.yz.position.x = slice;
                this.refresh('yz');
                break;
        }
    },

    centerMoveByDelta: function(delta) {
        if (delta.length() < 3.0) {
            return;
        }
        this.center.add(delta);
        this.changedCenter();
    },

    changedCenter: function() {
        if (this.orientation3d !== undefined) {
            this.orientation3d.notifyCenterChange(this.center);
        }
        this.refresh('xy');
        this.refresh('xz');
        this.refresh('yz');
        //console.log("Center ", this.center);
    },

    refresh: function(sliceType, tryLast) {
        if (this.showAxesOnly) {
            this.planes[sliceType].material.map = this.background[sliceType];
            this.planes[sliceType].material.map.needsUpdate = true;
            this.lastRequest[sliceType] = '';
            //console.log("axes only");
            return;
        }
        if (tryLast && this.lastRequest[sliceType].length === 0) {
            //console.log("no last request");
            return;
        }
        var dataname = DVID.dataset.imageName;
        var uuid = DVID.dataset.uuid;

        var mapping = new THREE.UVMapping();
        var flipY = true;
        var url;
        if (tryLast) {
            url = this.lastRequest[sliceType];
            //console.log("retrying ", url);
            this.lastRequest[sliceType] = '';
        } else {
            url = DVID.voxelsUrl(dataname, uuid, sliceType, this.center, this.planes, this.viewRadius);
            if (url === "") {
                return;
            }
            // If we already have an active request for this sliceType, just queue it and return.
            if (this.lastRequest[sliceType].length > 0) {
                //console.log("putting ", url, " on queue");
                this.lastRequest[sliceType] = url;
                return;
            }
            this.lastRequest[sliceType] = url;
        }

        var texture;
        var origObj = this;

        texture = THREE.ImageUtils.loadTexture(url, mapping, function() {
                //texture.flipY = flipY;
                texture.premultiplyAlpha = false;
                origObj.planes[sliceType].material.uniforms.texture.value = texture;
                origObj.planes[sliceType].material.uniforms.texture.needsUpdate = true;
                var queuedUrl = origObj.lastRequest[sliceType];
                if (queuedUrl.length > 0 && queuedUrl !== url) {
                    //console.log("Retrying refresh because ", queuedUrl, " !== ", url);
                    origObj.refresh(sliceType, true);
                } else {
                    origObj.lastRequest[sliceType] = '';
                }
            },
            function() {
                console.log('Error in trying GET',url);
                origObj.refresh(sliceType, true);
            }
        );
    },

    deleteSparseVolume: function() {
        if (this.particles) {
            if (this.showBodies) {
                this.scene.remove(this.particles);
            }
            delete this.particles;
        }
    },

    showSparseVolume: function(on) {
      if (on) {
          if (this.particles) {
              this.scene.add(this.particles);
              this.showBodies = true;
          } else {
              this.showBodies = false;
          }
      } else {
          if (this.particles) {
              this.scene.remove(this.particles);
              this.showBodies = false;
          }
      }
    },

    addSurface: function(arrayBuffer, color) {
        var uintArray = new Uint32Array(arrayBuffer);
		var numVoxels = uintArray[0]		
        console.log("addSurface with", numVoxels, "voxels in surface of color", color, "; center = ", this.center);

		var farrayLength = numVoxels * 3
        var vertices = new Float32Array(arrayBuffer, 4, farrayLength);
		var normals = new Float32Array(arrayBuffer, 4 + farrayLength * 4, farrayLength)

        var geom = new THREE.BufferGeometry();
		geom.attributes = {
			position: {
				itemSize: 3,
				array: vertices,
				numItems: numVoxels * 3
			},
			normal: {
				itemSize: 3,
				array: normals,
				numItems: numVoxels * 3
			}
		};
		//var positions = geom.attributes.position.array;
		geom.computeBoundingSphere();
		var resX = this.resolution.getComponent(0);
		var resY = this.resolution.getComponent(1);
		var resZ = this.resolution.getComponent(2);
		var minRes = Math.min(resX, resY, resZ)
		var maxRes = Math.max(resX, resY, resZ)
		var size = 3.0; //maxRes / minRes;
		var anisotropy = this.resolution.divideScalar(minRes);
        var uniforms = {
            uSplatSize:    { type: "f", value: size },
            uColor:   { type: "c", value: new THREE.Color(color) },
            uBodyAlpha:   { type: "f", value: 1.0 }, //this.bodyAlpha },
            uAmbient: { type: "f", value: 0.3 },
            uDiffuse: { type: "f", value: 0.7 },
            uSpecular: { type: "f", value: 0.3 },
            uShininess: { type: "f", value: 32.0 },
			uCenter:  { type: "v3", value: this.center },
			uAnisotropy: { type: "v3", value: anisotropy },
            uLight1: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1000.0) }
        };
        var material = new THREE.ShaderMaterial({
            uniforms:       uniforms,
            vertexShader:   document.getElementById('surface-vertexshader').textContent,
            fragmentShader: document.getElementById('surface-fragmentshader').textContent
        });
        this.deleteSparseVolume();
        this.particles = new THREE.ParticleSystem(geom, material);
        this.scene.add(this.particles);
        this.showBodies = true;
    },

    selectSurface: function(origin, direction) {
        if (!this.pickBodies) {
            return;
        }
        var intersects = this.cutPlaneIntersection(origin, direction);
        if (intersects.length < 1) {
            return;
        }
        var voxelHit = new THREE.Vector3();
        voxelHit.addVectors(intersects[0].point, this.center);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', DVID.surfaceByCoordUrl(DVID.dataset.labelmapName, voxelHit), true);
        xhr.responseType = 'arraybuffer';

        var origObj = this;
        xhr.onload = function(e) {
            var arrayBuffer = xhr.response;
            if (arrayBuffer) {
                origObj.addSurface(arrayBuffer, origObj.sparseVolumeColor);
            }
        };
        xhr.onerror = function(e) {
            console.log("XHR error: ", e)
        }
        xhr.send();
   },

    getVectorFromArray: function(obj) {
        if (obj[0] === undefined || obj[1] === undefined || obj[2] === undefined) {
            console.log("Illegal getVector on", obj);
            return new THREE.Vector3();
        }
        return new THREE.Vector3(obj[0], obj[1], obj[2]);
    },

    leap: {
        on: false,

        controller: null,

        mode: 'resting',       // Could be 'two hands' (rotate & scale), 'plane move', 'center move'

        timeInMode: 0,         // ms that we've been in current mode.

        modeRefraction: 1000,  // ms before we allow changes based on leap motion control.

        // Frequency of leap motion controller polling in ms.
        pollFrequency: 100,

        // Refraction time in ms between mode changes
        refractoryPeriod: 600,

        // Ticks in poll handler between mode changes.
        refraction: 0,

        // LeapMotion space (mm) to voxel space multiplier
        sensitivity: 3.0,

        // Store frame for motion functions
        previousFrame: {},

        // Keep track of fingers by pointable id
        fingers: {},

        // Last finger id
        fingerId: -1,

        fingerPos: new THREE.Vector3(0,0,0),

        // Last hand id
        handId: -1,

        handPos: new THREE.Vector3(0,0,0),

        // Last vector in two-handed rotation.
        lastRotateVector: null,

        vectorToString: function(vector, digits) {
            if (typeof digits === "undefined") {
                digits = 1;
            }
            return "(" + vector.x.toFixed(digits) + ", "
                + vector.y.toFixed(digits) + ", "
                + vector.z.toFixed(digits) + ")";
        },

        // Switch leap mode if we aren't in refractory period.
        switchMode: function(mode) {
            // Titrate the refractory period based on likely errors in transitions.
            var transitions = {
                'resting': {
                    'two hands': 2,
                    'center move': 5,
                    'plane move': 1
                },
                'two hands': {
                    'resting': 1,
                    'center move': 5,
                    'plane move': 2
                },
                'plane move': {
                    'resting': 1,
                    'center move': 5,
                    'two hands': 2
                },
                'center move': {
                    'resting': 1,
                    'two hands': 5,
                    'plane move': 5
                }
            };
            /*
            console.log(this.mode, "->", mode, ": refraction", this.refraction, "--",
                this.controller.frame().hands.length, "hands,",
                this.controller.frame().pointables.length, "pointables");
            */
            if (this.mode !== mode) {
                var oldMode = this.mode;
                var curMode = mode;
                if (curMode === 'plane move xy' || curMode === 'plane move xz' || curMode === 'plane move yz') {
                    curMode = 'plane move';
                }
                if (oldMode === 'plane move xy' || oldMode === 'plane move xz' || oldMode === 'plane move yz') {
                    oldMode = 'plane move';
                }
                if (transitions[oldMode].hasOwnProperty(curMode)) {
                    multiplier = transitions[oldMode][curMode];
                } else {
                    multiplier = 1;
                }
                if (this.refraction * this.pollFrequency > this.refractoryPeriod * multiplier ) {
                    this.mode = mode;
                    this.timeInMode = 0;
                    this.refraction = 0;
                }
            } else {
                this.refraction = 0;
            }
        },

        frameFunction: function() {
            if (!this.leap.on) {
                return;
            }

            // TODO -- Look at last X frames and get best results
            var frame = this.leap.controller.frame();

            var handIds = {};
            var action = false;  // True if we did something with hands.

            var translation, rotationAxis, rotationAngle, rotationMatrix, scaleFactor;
            var pointable, finger, pos, dir, sceneDir, origin, direction;
            var hudString = '';

            // Determine mode of LeapMotion operations.
            var handsOK = false;
            var planesOK = false;
            var centerOK = false;
            if (frame.hands.length > 1) {
                handsOK = true;
                this.leap.switchMode('two hands');
            } else if (frame.hands.length == 1) {
                if (frame.pointables.length == 1) {
                    pointable = frame.pointables[0];
                    dir = new THREE.Vector3(pointable.direction[0], pointable.direction[1], pointable.direction[2]);
                    sceneDir = this.applyCamera(dir);
                    var plane = this.planeSelectByDirection(sceneDir);
                    if (plane) {
                        planesOK = true;
                        this.leap.switchMode('plane move ' + plane);
                    }
                } else if (frame.pointables.length > 4) {
                    centerOK = true;
                    this.leap.switchMode('center move');
                }
            } else {
                this.leap.switchMode('resting');
            }

            // Handle mode.
            switch (this.leap.mode) {
                case 'two hands':
                    this.planesUnselect();
                    if (handsOK) {
                        var hand1 = frame.hands[0];
                        //var hand1pos = DVID.applyCamera(hand1.palmPosition);
                        var hand1pos = this.getVectorFromArray(hand1.palmPosition);
                        var hand2 = frame.hands[1];
                        //var hand2pos = DVID.applyCamera(hand2.palmPosition);
                        var hand2pos = this.getVectorFromArray(hand2.palmPosition);
                        var delta = hand1pos.sub(hand2pos);
                        delta.normalize();
                        if (this.leap.lastRotateVector) {
                            if (this.leap.timeInMode > this.leap.modeRefraction) {
                                console.log("Two hand rotation after", this.leap.timeInMode, "ms");
                                var axis = new THREE.Vector3();
                                axis.crossVectors(this.leap.lastRotateVector, delta);
                                axis.normalize();
                                var angle = Math.acos(this.leap.lastRotateVector.dot(delta));
                                var quat = new THREE.Quaternion();
                                if (angle * 180.0 / Math.PI < 10.0) {
                                    quat.setFromAxisAngle(axis, -angle);
                                }
                                this.camera.position.applyQuaternion(quat);
                            }
                        }
                        this.leap.lastRotateVector = delta;
                    }
                    break;
                case 'plane move xy':
                case 'plane move xz':
                case 'plane move yz':
                    this.planeHighlight();
                    if (planesOK) {
                        var foundFinger = false;
                        if (frame.pointables.length > 0 && this.hit.selected) {
                            for (var i = 0; i < frame.pointables.length; i++) {
                                pointable = frame.pointables[i];
                                if (pointable.id === this.leap.fingerId) {
                                    var tipPos = this.getVectorFromArray(pointable.tipPosition);
                                    var scenePos = this.applyCamera(tipPos);
                                    if (this.leap.timeInMode > this.leap.modeRefraction) {
                                        console.log("Plane move after", this.leap.timeInMode, "ms");
                                        var delta = new THREE.Vector3();
                                        delta.copy(scenePos);
                                        delta.sub(this.leap.fingerPos).multiplyScalar(this.leap.sensitivity);
                                        this.planeMoveByDelta(delta);
                                    }
                                    this.leap.fingerPos = scenePos;
                                    foundFinger = true;
                                    break;
                                }
                            }
                            if (!foundFinger) {
                                pointable = frame.pointables[0];
                                var tipPos = this.getVectorFromArray(pointable.tipPosition);
                                var scenePos = this.applyCamera(tipPos);
                                this.leap.fingerId = pointable.id;
                                this.leap.fingerPos = scenePos;
                            }
                        } else {
                            this.leap.fingerId = -1;
                        }
                    }
                    break;
                case 'center move':
                    delete this.leap.lastRotateVector;
                    this.planesUnselect();
                    if (centerOK) {
                        var hand = frame.hands[0];
                        var pos = hand.stabilizedPalmPosition;
                        var scenePos = this.applyCamera(new THREE.Vector3(pos[0], pos[1], -pos[2]));
                        if (hand.id === this.leap.handId) {
                            if (this.leap.timeInMode > this.leap.modeRefraction) {
                                console.log("Center move after", this.leap.timeInMode, "ms");
                                var delta = scenePos.clone();
                                delta.sub(this.leap.handPos).multiplyScalar(this.leap.sensitivity);
                                this.centerMoveByDelta(delta);
                            }
                        } else {
                            this.leap.handId = hand.id;
                        }
                        this.leap.handPos = scenePos;
                    }
                    break;
                default:
                    break;
            }

            this.leap.refraction++;
            this.leap.timeInMode += this.leap.pollFrequency;
        }
    }
};