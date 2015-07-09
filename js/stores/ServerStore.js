import alt from '../alt';
import ServerActions from '../actions/ServerActions';
import dvid from 'dvid';

class ServerStore {
  constructor() {
    this.bindActions(ServerActions);
    this.repos = [];
    this.stats = {};
    this.api = dvid.connect();
  }

  onFetchStats() {

  }

  onFetch(msg) {
    var self = this;
    self.api.reposInfo({
      callback: function(data) {
        self.repos = [];
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            self.repos.push(data[key]);
          }
        }
        self.emitChange();
      },
      error: function (err) {
        console.log(err);
      }
    });
  }
}

module.exports = (alt.createStore(ServerStore));
