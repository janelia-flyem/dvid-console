import alt from '../alt';
import ServerActions from '../actions/ServerActions';
import dvid from 'dvid';

class ServerStore {
  constructor() {
    this.bindActions(ServerActions);
    this.repos = null;
    this.stats = {};
    this.api = dvid.connect();

   this.exportPublicMethods({
     getRepoById: this.getRepoById
   });

  }

  onFetchStats() {

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
