'use strict';

var dvidApp = angular.module('dvidApp', []);
/*
dvidApp.factory('dvidServer', function($http) {
    return {
        sparseVolByCoord: function(dataname, voxelHit) {
            return $http.get(DVID.sparseVolUrl(dataname, voxelHit)).then(function(result) {
                return result.data;
            });
        }
    }
});
*/
dvidApp.filter('stringsize', function() {
    var stringsizeFilter = function(input, size) {
        return input.slice(0, size-1);
    };
    return stringsizeFilter;
});

dvidApp.directive('control3d', function() {
    var linkFn;
    linkFn = function(scope, element) {
        scope.init = function() {
            var controlarea = angular.element(element);

            var gui = new dat.GUI({ autoPlace: false });
            controlarea.append(gui.domElement);

            // Source Options
            var source_folder = gui.addFolder("Source");

            var h_dataset = source_folder.add(DVID.dataset, 'uuid', DVID.uuids);
            var h_imageName = source_folder.add(DVID.dataset, 'imageName', DVID.dataset.availVoxels);

            h_dataset.onChange(function(value) {
                var datasetNum = -1;
                for (var i = 0; i < DVID.uuids.length; i++) {
                    if (value === DVID.uuids[i]) {
                        datasetNum = i;
                        break;
                    }
                }
                if (datasetNum >= 0) {
                    DVID.changeDataset(datasetNum);
                    DVID.cutView3d.resetDataset();
                    DVID.cutView3d.resetPlanes();
                    DVID.cutView3d.refresh('xy');
                    DVID.cutView3d.refresh('xz');
                    DVID.cutView3d.refresh('yz');
                }
            });

            h_imageName.onChange(function(value) {
                DVID.cutView3d.refresh('xy');
                DVID.cutView3d.refresh('xz');
                DVID.cutView3d.refresh('yz');
            });

            // Sparse Volume Options
            var sparsevol_folder = gui.addFolder("Sparse Volumes");

            var h_labelmapName = sparsevol_folder.add(DVID.dataset, 'labelmapName', DVID.dataset.availLabelmaps);
            var h_showBodies = sparsevol_folder.add(DVID.cutView3d, 'showBodies');
            var h_pickBodies = sparsevol_folder.add(DVID.cutView3d, 'pickBodies');
			var h_alpha = sparsevol_folder.add(DVID.cutView3d, 'bodyAlpha', 0.0, 1.0).step(0.01);
            var h_bodyColor = sparsevol_folder.addColor(DVID.cutView3d, 'sparseVolumeColor');

            h_showBodies.onChange(function(value) {
                DVID.cutView3d.showSparseVolume(value);
            });

            h_pickBodies.onChange(function(on) {
                if (on) {
                    DVID.cutView3d.showSparseVolume(true);
                }
            });
			
			h_alpha.onChange(function(value) {
                console.log("alpha:", value, "particles in 3d cut view: ", DVID.cutView3d.particles);
                console.log("test:", DVID.cutView3d.particles.material.uniforms);
                DVID.cutView3d.scene.remove(DVID.cutView3d.particles);
                DVID.cutView3d.particles.material.uniforms.uBodyAlpha = { type: "f", value: value };
                DVID.cutView3d.scene.add(DVID.cutView3d.particles);
			});

            // Rendering Options
            var render_folder = gui.addFolder("Rendering");

            var h_centerX = render_folder.add(DVID.cutView3d.center, 'x', DVID.cutView3d.minPt.x, DVID.cutView3d.maxPt.x).step(1.0);
            var h_centerY = render_folder.add(DVID.cutView3d.center, 'y', DVID.cutView3d.minPt.y, DVID.cutView3d.maxPt.y).step(1.0);
            var h_centerZ = render_folder.add(DVID.cutView3d.center, 'z', DVID.cutView3d.minPt.z, DVID.cutView3d.maxPt.z).step(1.0);
            var h_imageSize = render_folder.add(DVID.cutView3d, 'viewRadius', 100, 500).step(1.0);
            var h_directionalLight = render_folder.add(DVID.cutView3d, 'directionalLight', 0.2, 2.0).step(0.05);
            var h_tiles = render_folder.add(DVID.cutView3d, 'showTiles');
            var h_axesOnly = render_folder.add(DVID.cutView3d, 'showAxesOnly');
            var h_showChunks = render_folder.add(DVID.cutView3d, 'showingChunks');
			
            // Leap Motion Options
            var leap_folder = gui.addFolder("Leap Motion");
            leap_folder.add(DVID.cutView3d.leap, 'on');
            leap_folder.add(DVID.cutView3d.leap, 'pollFrequency', 100, 1000).step(100);
            leap_folder.add(DVID.cutView3d.leap, 'modeRefraction', 0, 2000).step(100);
            leap_folder.add(DVID.cutView3d.leap, 'refractoryPeriod', 0, 5000).step(100);
            leap_folder.add(DVID.cutView3d.leap, 'sensitivity', 1.0, 10.0).step(1.0);

            h_centerX.onChange(function(value) {
                DVID.cutView3d.changedCenter();
            });
            h_centerY.onChange(function(value) {
                DVID.cutView3d.changedCenter();
            });
            h_centerZ.onChange(function(value) {
                DVID.cutView3d.changedCenter();
            });
            h_imageSize.onChange(function(value) {
                DVID.cutView3d.resetPlanes();

                DVID.cutView3d.constrainPlane('xy');
                DVID.cutView3d.constrainPlane('xz');
                DVID.cutView3d.constrainPlane('yz');

                scope.lastImageSize = value;
            });
            h_directionalLight.onChange(function(value) {
                DVID.cutView3d.light.intensity = value;
            });

            h_axesOnly.onChange(function(value) {
                DVID.cutView3d.refresh('xy');
                DVID.cutView3d.refresh('xz');
                DVID.cutView3d.refresh('yz');
            });
            
            h_showChunks.onChange(function(value) {
                DVID.cutView3d.refreshChunkView();
            });
        };
        scope.init();
    };
    return {
        restrict: 'E',
        link: linkFn
    };
});

dvidApp.directive('orientation3d', function() {
    var linkFn;
    linkFn = function(scope, element) {

        var renderarea = angular.element(element);
        var renderwidth = 200;
        var renderheight = 200;

        var container = document.createElement( 'div' );
        renderarea.append( container );

        scope.init = function() {
            DVID.orientation3d = new DVID.Orientation3D(500, renderwidth, renderheight);
            var domElement = DVID.orientation3d.getDomElement();
            container.appendChild(domElement);

            window.addEventListener( 'resize', onWindowResize, false );

            DVID.orientation3d.animate();

            DVID.orientation3d.refresh('xy');
            DVID.orientation3d.refresh('xz');
            DVID.orientation3d.refresh('yz');
        }
		scope.init();

        function onWindowResize() {
            DVID.orientation3d.resize(renderwidth, renderheight);
        }
    };
    return {
        restrict: 'E',
        link: linkFn
    };
});

dvidApp.directive('browser3d', function() {
    var linkFn;
    linkFn = function(scope, element) {

        var container, tileview;
        var renderarea = angular.element(element);
        var renderwidth = window.innerWidth - 300;
        var renderheight = window.innerHeight;
        if (renderwidth > 1000) {
            renderwidth = 1000;
        }
        if (renderheight > 800) {
            renderheight = 800;
        }

        init();

        function init() {
            container = document.createElement( 'div' );
            renderarea.append( container );

			// Add the stats window.
			var stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild(stats.domElement);

			// Add the cutView3d window.
            DVID.cutView3d = new DVID.CutView3D(renderwidth, renderheight, DVID.orientation3d, stats);
            var domElement = DVID.cutView3d.getDomElement();
            container.appendChild(domElement);

            domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            domElement.addEventListener('mousedown', onDocumentMouseDown, false);
            domElement.addEventListener('mouseup', onDocumentMouseUp, false);

            window.addEventListener('keydown', onDocumentKeyDown, false);

            window.addEventListener( 'resize', onWindowResize, false );

            DVID.cutView3d.animate();

            DVID.cutView3d.refresh('xy');
            DVID.cutView3d.refresh('xz');
            DVID.cutView3d.refresh('yz');
        }

        function onWindowResize() {
            DVID.cutView3d.resize(renderwidth, renderheight);
        }

        function onDocumentKeyDown( event ) {
            event.preventDefault();
            DVID.cutView3d.keyDown(event.keyCode);
        }

        function onDocumentMouseMove( event ) {
            //console.log("Mouse Move: selected", DVID.cutView3d.hit.selected, ", trackball enabled", DVID.cutView3d.trackball.enabled);
            event.preventDefault();

            var x = event.clientX - container.offsetLeft + window.pageXOffset;
            var y = event.clientY - container.offsetTop + window.pageYOffset;

            var selectable = DVID.cutView3d.mouseMove(x, y);
            if (selectable) {
                container.style.cursor = 'pointer';
            } else {
                container.style.cursor = 'auto';
            }
        }

        function onDocumentMouseDown( event ) {
            //console.log("Mouse Down: selected", DVID.cutView3d.hit.selected, ", trackball enabled", DVID.cutView3d.trackball.enabled);
            event.preventDefault();
            if (DVID.cutView3d.mouseDown()) {
                container.style.cursor = 'move';
            }
        }

        function onDocumentMouseUp( event ) {
            //console.log("Mouse Up: selected", DVID.cutView3d.hit.selected, ", trackball enabled", DVID.cutView3d.trackball.enabled);
            event.preventDefault();
            DVID.cutView3d.mouseUp();
            container.style.cursor = 'auto';
        }
    };
    return {
        restrict: 'E',
        link: linkFn
    };
});
