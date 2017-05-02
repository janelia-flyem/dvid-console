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

exports.serverMaintenance = false;
exports.serverMaintenanceMessage = "";

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
