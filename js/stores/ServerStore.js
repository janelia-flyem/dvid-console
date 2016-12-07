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
    this.types = null;

   this.exportPublicMethods({
     getLoad: this.getLoad
   });

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
      callback: cb,
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
      self.api.repo({
        uuid: opts.uuid,
        endpoint: 'info',
        callback: function(data) {
          self.repo = data;
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
          self.repos = data;
          self.emitChange();
        },
        error: function (err) {
          ErrorActions.update(err);
        }
      });
    }
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
          self.emitChange();
        },
        error: function (err) {
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }
  }
  
  onFetchMasterInfo(opts){
    var self = this;

    if (opts && opts.uuid) {
      // check to see if the master_info key is present on the branche datainstance
      // if yes, then pass the master_info json obj to the callback
      // else run the error callback.
      self.api.node({
        uuid: opts.uuid,
        endpoint: 'branches/key/master_info',
        callback: function(data) {
          if (opts.callback) {
            opts.callback(data);
          }
          self.emitChange();
        },
        error: function (err) {
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }

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

}

module.exports = (alt.createStore(ServerStore));
