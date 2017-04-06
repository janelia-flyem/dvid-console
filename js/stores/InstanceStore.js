import alt from '../alt';
import InstanceActions from '../actions/InstanceActions';
import dvid from 'dvid';
import config from '../utils/config';

class InstanceStore {

  constructor() {
    this.bindActions(InstanceActions);
    this.nodeRestrict = true;
    this.neuroglancerInstances = null;
    this.restrictions = null;
    this.api = dvid.connect({host: config.host, port: config.port, username: 'dvidconsole', application: 'dvidconsole'});
  }

  onToggle() {
    if (this.nodeRestrict === true) {
      this.nodeRestrict = false;
    }
    else {
      this.nodeRestrict = true;
    }
  }

  onFetchMeta(opts){
    /**
     * Fetches neuroglancer and restrictions key values
     * from the meta endpoint. Makes two separate http requests
     */
    var self = this;

    function fetchNeuroglancerInstances(opts){
      self.api.node({
        uuid: opts.uuid,
        endpoint: '.meta/key/neuroglancer',
        callback: function(data) {
          self.neuroglancerInstances = data;
          self.emitChange();
          if (opts.callback) {
            opts.callback(data);
          }
        },
        error: err
      });
    }


    function err(error){
        self.neuroglancerInstances = null;
        self.restrictions = null;
        self.emitChange();
        if (opts.error) {
          opts.error(err);
        }
    }

    if (opts && opts.uuid) {
      self.api.node({
        uuid: opts.uuid,
        endpoint: '.meta/key/restrictions',
        callback: function(data) {
          self.restrictions = data;
          fetchNeuroglancerInstances(opts)
        },
        error: err
      });
    }
  }

/* Instance utility functions */
  static dataInstancesForNode(ServerStore, nodeRestrict){
      var instances = ServerStore.repo.DataInstances;
      var chosen_node = ServerStore.uuid;
      var dagNodes = ServerStore.repo.DAG.Nodes;

      // create a lookup and reverse lookup for all of the nodes so we can get parents.
      var byUUIDLookUp = {};
      var byIdLookUp = {};
      var sorted = [];
      var parents = {};

      for (var key in dagNodes) {
        byUUIDLookUp[key] = dagNodes[key].Parents;
        byIdLookUp[dagNodes[key].VersionID] = key;
      }


      // generate an ancestors list to be used for exclusion.
      var ancestors = {};
      // work back from the chosen node and add all the ancestors to one list.
      function add_ancestors (node) {
        if (byUUIDLookUp.hasOwnProperty(node.UUID)) {
          ancestors[node.UUID] = true;
          // check for parents array
          if (node.Parents.length > 0) {
            for (let nodeParent of node.Parents) {
              var parentUUID = byIdLookUp[nodeParent]
              add_ancestors(dagNodes[parentUUID])
            }
          }
        }
      }
      add_ancestors(dagNodes[chosen_node]);

      var base_key_regex = /^(.*)(_\d)$/;

      for (var key in instances) {
        // skip this if RepoUUID is not in ancestors list
        if (nodeRestrict === false || ancestors.hasOwnProperty(instances[key].Base.RepoUUID)) {
          if (instances.hasOwnProperty(key)) {
            var match = base_key_regex.exec(key);
            if (match) {
              sorted.push([key, instances[key], match[1] + '_' + instances[key].Base.TypeName]);
              parents[match[1] + '_' + instances[key].Base.TypeName] = 1;
            }
            else{
              sorted.push([key, instances[key]]);
            }
          }
        }
      }

      // returns the data instances sorted by type then name.
      sorted.sort(function(a,b) {
        var aType = a[1].Base.TypeName;
        var bType = b[1].Base.TypeName;
        // first see if we have the same type of instance
        if (aType === bType) {
          // same instance type, so sort by the instance name.
          if (a[0] > b[0]) return 1;
          if (a[0] < b[0]) return -1;
          return 0;
        } else {
          // sort by the type.
          if (aType < bType) return -1;
          if (aType > bType) return 1;
        }
        return 0;
      });

      return [sorted, parents]
  } 
}

module.exports = (alt.createStore(InstanceStore));
