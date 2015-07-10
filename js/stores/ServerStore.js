import alt from '../alt';
import ServerActions from '../actions/ServerActions';
import dvid from 'dvid';

class ServerStore {
  constructor() {
    this.bindActions(ServerActions);
    this.repos = null;
    this.stats = null;
    this.api = dvid.connect();

   this.exportPublicMethods({
     getRepoById: this.getRepoById
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
        console.log(err);
      }
    });
  }

  onFetch(msg) {
    var self = this;
    self.api.reposInfo({
      callback: function(data) {
        self.repos = data;
        self.emitChange();
      },
      error: function (err) {
        console.log(err);
      }
    });
  }

  getRepoById(id) {
  }

}

module.exports = (alt.createStore(ServerStore));
