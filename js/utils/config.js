// Set the base url of the DVID server that you are trying to
// contact.
var host = '';
var port = '';

exports.host = host;
exports.port = port;

var root = '';

if (host) {
  root = "http://" + host;
}

if (port) {
  root = root + ":" + port;
}


var settings = {
  // the layers at which tile will be fetched from the server. For sources that
  // have been tiled, this should be the defaults 0 - inf. For limited gray scale
  // data, this needs to be 4 for both.
  minTileLevel: 0,
  maxTileLevel: 4,

  // constrain the amount of zoom allowed. For gray scale we don't want to zoom out
  // too far as the image will turn black when there are no tiles to load.
  minZoomLevel: 0.5,
  //maxZoomLevel: 0,
  defaultZoomLevel: 0.5,

  showNavigator: true
};
exports.settings = settings;

// Set the dvid url that will return the tiles. This example is for the
// multiscale2d data instance, but others are possible.
exports.tileFetchUrl = function(uuid, level, plane, x, y, z) {
  var api_url = root + "/api/node/" + uuid + "/" + settings.datatype + "/tile/" + plane + "/" + level + "/" + x + "_" + y + "_" + z;
  return api_url;
}

// request information about a specific data instance within
// a repository.
exports.datatypeInfoUrl = function(uuid, datatype) {
  return root + '/api/node/' + uuid + '/' + datatype + '/info';
};

// request information about a specific repository
exports.repoInfoUrl = function(uuid) {
  return root + '/api/repo/' + uuid  + '/info';
};

// request information about all the repositories in the
// root DVID instance.
exports.reposInfoUrl = function(uuid) {
  return root + '/api/repos/info';
};

exports.baseUrl = function() {
  if(!root){
    var port = window.location.port || "80"
    root = "http://" + window.location.hostname + ":" + port;
  }
  return root;
};

//cheap language switches for lite vs. full app
var wording;
if(window.DVID_LITE){
  wording = {
    app_name: 'DICED + DVID'
  }
}else{
  wording = {
    app_name: 'DVID'
  }
}
exports.wording = wording;
