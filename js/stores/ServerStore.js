import alt from '../alt';
import ServerActions from '../actions/ServerActions';
import ErrorActions from '../actions/ErrorActions';
import dvid from 'dvid';
import config from '../utils/config';

class ServerStore {

  constructor() {
    this.bindActions(ServerActions);
    this.repos = null;
    this.stats = null;
    this.api = dvid.connect({host: config.host, port: config.port, username: 'dvidconsole', application: 'dvidconsole'});
    this.repo = null;
    //need to add a separate prop: node?
    this.uuid = null;
    this.repoMasterUuuid = null;
    this.repoMasterBranchHist = null;
    this.repoDefaultInstances = null;
    this.types = null;
    this.serverInfo = null;
    this.dataSource = null;

   this.exportPublicMethods({
     getLoad: this.getLoad
   });

  }

  onClearRepo(){
    this.repo = null;
    this.uuid = null;
  }

  onUpdate() {
    var self = this;
  }

  onBranchNode(opts) {
    var self = this;
    this.api.node({
      uuid: opts.uuid,
      endpoint: 'branch',
      method:'POST',
      callback: function(data) {
        if(opts.callback){
          opts.callback()
        }
        self.onFetch(opts);
      },
      error: function(err) {
        ErrorActions.update(err);
      }
    });
  }

  onCommitNode(opts) {
    var self = this,
      uuid = opts.uuid,
      entry = opts.entry,
      cb = opts.callback,
      payload = {
        note: entry
      },
      err = function(err) {
        ErrorActions.update(err);
      };

    if (opts.error) {
      err = opts.error;
    }

    this.api.node({
      uuid: opts.uuid,
      endpoint: 'commit',
      payload: JSON.stringify(payload),
      method:'POST',
      callback: function(data) {
        if(cb){
          cb();
        }
        self.onFetch(opts);
      },
      error: err
    });
  }

  onFetchStats() {
    var self = this;
    self.api.serverInfo({
      callback: function(data) {
        self.stats = data;
        self.emitChange();
      },
      error: function (err) {
        ErrorActions.update(err);
      }
    });
  }

  onFetchTypes() {
    var self = this;
    if (self.types){
      return false;
    }
    self.api.serverCompiledTypes({
      callback: function(data) {
        self.types = data;
        self.emitChange();
      },
      error: function (err) {
        ErrorActions.update(err);
      }
    });
  }

  onFetch(opts) {
    var self = this;

    if (opts && opts.uuid) {
      //check if a repo update is necessary
      //saves load time when navigating a repo

      self.api.repo({
        uuid: opts.uuid,
        endpoint: 'info',
        callback: function(data) {
          self.repo = data;
          self.uuid = ServerStore.getFullUUIDinRepo(self.repo, opts.uuid);

          if (opts.callback) {
            opts.callback(data);
          }
          self.emitChange();
        },
        error: function (err) {
          ErrorActions.update(err);
        }
      });
    }
    else {
      self.api.reposInfo({
        callback: function(data) {
          self.repo = null;
          self.uuid = null;
          self.repos = data;
          self.emitChange();
          if (opts && opts.callback) {
            opts.callback(data);
          }
        },
        error: function (err) {
          ErrorActions.update(err);
        }
      });
    }
   return false; 
  }

  onFetchMaster(opts) {
    var self = this;

    if (opts && opts.uuid) {
      // check to see if the branches data type is present
      // if yes, then grab the master uuid
      // else run the error callback.
      self.api.node({
        uuid: opts.uuid,
        endpoint: 'branches/key/master',
        callback: function(data) {
          if (opts.callback) {
            opts.callback(data);
          }
          self.repoMasterUuuid = data[0];
          self.repoMasterBranchHist = data;
          self.emitChange();
        },
        error: function (err) {
          self.repoMasterUuuid = null;
          self.repoMasterBranchHist = null;
          self.emitChange();
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }
  }
  
  onFetchDefaultInstances(opts){
    var self = this;

    if (opts && opts.uuid) {
      // check to see if the master_info key is present on the branche datainstance
      // if yes, then pass the master_info json obj to the callback
      // else run the error callback.
      self.api.node({
        uuid: opts.uuid,
        endpoint: 'default_instances/key/data',
        callback: function(data) {
          if (opts.callback) {
            opts.callback(data);
          }
          self.repoDefaultInstances = data;
          self.emitChange();
        },
        error: function (err) {
          self.repoDefaultInstances = null;
          self.emitChange();
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }

  }

  onFetchServerInfo(opts){
    var self = this;

    self.api.serverInfo({
      callback: function(data) {

        self.serverInfo = data;
        self.emitChange();
        if (opts && opts.callback) {
          opts.callback(data);
        }
      },
      error: function (err) {
        if(opts.error){
          opts.error(err);
        }
      }
    });
    return false;
  }

  onFetchDataSource(opts){
    const url = this.api.createUrl('api/server/note');
    fetch(url)
      .then(function(response){
        if(response.ok) {
          return response.json();
        }
      })
      .then(function(json){
        this.dataSource = null;//json.source;
        this.emitChange();
      }.bind(this))
      .catch(function(error){
        this.dataSource = null;
        this.emitChange();
      }.bind(this))
  }

  onAddLog(data) {
    var self = this,
      entry = data.entry,
      uuid  = data.uuid,
      cb    = data.callback,
      payload = {
        log: [ entry ]
      },
      error = function(err) {
        ErrorActions.update(err);
      };

    if (data.error) {
      error = data.error;
    }

    var request = {
      endpoint: 'log',
      uuid: uuid,
      payload: JSON.stringify(payload),
      method: 'POST',
      callback: function(data) {
        self.onFetch({uuid: uuid, callback: cb});
      },
      error: error
    };

    if (entry) {
      if (data.isRepo) {
        self.api.repo( request );
      } else {
        self.api.node( request );
      }
    }
  }

  getLoad(callback) {
    var self = this;
    self.state.api.load({
      callback: callback,
      error: function(err) {
        ErrorActions.update(err);
      }
    });
  }

  onUpdateUuuid(data){
    this.uuid = data.uuid;
  }



  /** utility functions **/

  static sortRepolist(repos){
    let repo_list = []
      for (var key in repos) {
        if (repos.hasOwnProperty(key)) {
          if (repos[key]) {
            repo_list.push(repos[key]);
          }
        }
      }

      // sort the list so that the repositories with the most recent
      // changes are at the top.
      repo_list.sort(function(a,b){
        return new Date(b.Updated) - new Date(a.Updated);
      });

      return repo_list;
  }

  static getFullUUIDinRepo(repo, shortuuid){
    if(repo === null){
      return false;
    }
    for(var id in repo.DAG.Nodes){
      if(RegExp('^' + shortuuid).test(id)){
        //no need to update repo--uuid is in current repo
        return id;
      }
    }
    return null;
  }

  static IdInCurrentRepo(repo, uuid){

    var idInRepo = ServerStore.getFullUUIDinRepo(repo, uuid)
    if(idInRepo){
      return true;
    }
    return false;
  }

  static getRepoAliasFromRoot(repos, rootId){
     if (repos.hasOwnProperty(rootId)) {
      return repos[rootId].Alias;
    }
    return '';
  }

  static getRepoRootFromAlias(repos, alias){
    for (var key in repos) {
      if (repos[key].Alias === alias) {
        return key;
      }
    }
    return null;
  }

}

module.exports = (alt.createStore(ServerStore, 'ServerStore'));
