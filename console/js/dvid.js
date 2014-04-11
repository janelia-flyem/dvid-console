
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var DVID = {
    REVISION: '1',
	API_VERSION: 'v1',
	apiURL: '/api/v1/',

    // Loaded on initialization of MainCtrl controller.
    datasets: {},
    uuids: [],  // List of root node UUIDs for each dataset.

    // Currently selected dataset for visualization
    dataset: {
        // For currently selected dataset, what are the available voxels data names?
        availVoxels: [],

        // For currently selected dataset, what are the available labels data names?
        availLabels: [],

        // For current selected dataset, what are the available labelmaps?
        availLabelmaps: [],

        uuid: "",          // UUID (string) for current dataset
        imageName: "",     // data name for current image intensities
        labelName: "",     // data name for label information
        labelmapName: "",  // data name for labelmap
        labelID: "0"       // unsigned 64-bit label to display body (0 = no display)
    },

    // Returns true if a name matches one of the names in the list.
    allowedType: function(data, typenames) {
        if (data.hasOwnProperty('TypeService')) {
            var typename = data.TypeService.Name;
            for (var i = 0; i < typenames.length; i += 1) {
                if (typename === typenames[i]) {
                    return true;
                }
            }
        }
        return false;
    },

    // Returns an array of data names for a dataset object.
    getDataNames: function(dataMap, typenames) {
        var names = [];
        for (dataName in dataMap) {
            if (this.allowedType(dataMap[dataName], typenames)) {
                names.push(dataName);
            }
        }
        return names;
    },

    // Returns an array of data names for this dataset index and with an optional data type (list of strings).
    getAvailData: function(dataset, typenames) {
        if (dataset.hasOwnProperty('Root') && dataset.DataMap) {
            return this.getDataNames(dataset.DataMap, typenames);
        }
        return [];
    },

    changeDataset: function(datasetNum) {
        console.log("Changing dataset to ", datasetNum, " of ", DVID.uuids.length);
        if (DVID.uuids.length > datasetNum) {
            DVID.dataset.uuid = DVID.uuids[datasetNum];
            var dataset = DVID.datasets[datasetNum];
            this.dataset.availVoxels = DVID.getAvailData(dataset, ['grayscale8', 'rgba8', 'grayscale16']);
            this.dataset.availLabels = DVID.getAvailData(dataset, ['labels32', 'labels64']);
            this.dataset.availLabelmaps = DVID.getAvailData(dataset, ['labelmap'])
            this.dataset.availQuadtrees = DVID.getAvailData(dataset, ['quadtree'])
            if (this.dataset.availVoxels.length > 0) {
                this.dataset.imageName = this.dataset.availVoxels[0];
                this.changeDataImage(dataset, this.dataset.imageName);
            }
            if (this.dataset.availLabels.length > 0) {
                this.dataset.labelName = this.dataset.availLabels[0];
                this.dataset.labelID = "0";
            }
            if (this.dataset.availLabelmaps.length > 0) {
                this.dataset.labelmapName = this.dataset.availLabelmaps[0];
            }
            if (this.dataset.availQuadtrees.length > 0) {
                this.dataset.quadtreeName = this.dataset.availQuadtrees[0];
            }
        }
    },

    changeDataImage: function(dataset, dataname) {
        console.log("changeDataImage: ", dataset, dataname);
        var data = dataset.DataMap[dataname];
        if (data !== undefined) {
            var minPt = new THREE.Vector3(data.MinPoint[0], data.MinPoint[1], data.MinPoint[2]);
            var maxPt = new THREE.Vector3(data.MaxPoint[0], data.MaxPoint[1], data.MaxPoint[2]);
            this.dataset.minPt = minPt;
            this.dataset.maxPt = maxPt;
			
			this.dataset.resolution = new THREE.Vector3(data.VoxelSize[0], data.VoxelSize[1], data.VoxelSize[2]);
			
            this.dataset.center = new THREE.Vector3();
            this.dataset.center.addVectors(minPt, maxPt);
            this.dataset.center.divideScalar(2);
            console.log("changeDataImage center is now: ", this.dataset.center);
        }
    },

    // Load texture.
    loadTexture: function(url) {
        var mapping = new THREE.UVMapping();
        var texture;
        texture = THREE.ImageUtils.loadTexture(url, mapping, function() {
                texture.flipY = true;
            },
            function() {
                console.log('Error in trying GET', url);
            });
        return texture;
    },

    // Returns a URL to access a slice
    voxelsUrl: function(dataname, uuid, sliceType, center, offset, viewRadius) {
        var sizeStr = Math.round(viewRadius * 2) + '_' + Math.round(viewRadius * 2);
        var pos = offset[sliceType].position.clone();
        var name = dataname;
        console.log("Get URL: slice", sliceType, ":", pos, "  center:", center);
        switch (sliceType) {
            case 'xy':
                pos.x -= viewRadius;
                pos.y -= viewRadius;
                break;
            case 'xz':
                pos.x -= viewRadius;
                pos.z -= viewRadius;
                break;
            case 'yz':
                pos.y -= viewRadius;
                pos.z -= viewRadius;
                break;
        }
        pos.add(center);

        // Make sure this is within current dataset bounds.

        var offsetStr = Math.round(pos.x) + '_' + Math.round(pos.y) + '_' + Math.round(pos.z);
        var url = '/api/v1/' + 'node/' + uuid + '/' + name + '/isotropic/' + sliceType + '/' + sizeStr + '/' + offsetStr;
        return url;
    },

    // Returns a URL to retrieve a subvolume given a coordinate.
    surfaceByLabelUrl: function(dataname, label) {
        return '/api/v1/' + 'node/' + this.dataset.uuid + '/' + 'bodies' + '/surface/' + label;
    },

    // Returns a URL to retrieve a subvolume given a coordinate.
    surfaceByCoordUrl: function(dataname, pt) {
        var coord = Math.round(pt.x) + '_' + Math.round(pt.y) + '_' + Math.round(pt.z);
        return '/api/v1/' + 'node/' + this.dataset.uuid + '/' + 'bodies' + '/surface-by-point/' + coord;
    },

    // Returns a URL to retrieve a subvolume given a coordinate.
    sparseVolByLabelUrl: function(dataname, label) {
        return '/api/v1/' + 'node/' + this.dataset.uuid + '/' + 'bodies' + '/sparsevol/' + label;
    },

    // Returns a URL to retrieve a subvolume given a coordinate.
    sparseVolByCoordUrl: function(dataname, pt) {
        var coord = Math.round(pt.x) + '_' + Math.round(pt.y) + '_' + Math.round(pt.z);
        return '/api/v1/' + 'node/' + this.dataset.uuid + '/' + 'bodies' + '/sparsevol-by-point/' + coord;
    },

    // Returns a URL to retrieve a swc file for the given bodyid assuming it's been saved in
    // a 'skeletons' keyvalue data in DVID with .swc ending.
    swcUrl: function(bodyid) {
        var swcfile = bodyid + '.swc';
        return '/api/v1/' + 'node/' + this.dataset.uuid + '/skeletons/' + swcfile;
    },

    /*
    ravToGlPt: function(ravPt) {
        return new THREE.Vector3(ravPt[0], DVID.view3d.maxPt.y - ravPt[1], ravPt[2] - DVID.view3d.zsliceAdjust);
    },
    */
};