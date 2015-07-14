import alt from '../alt';
import ServerActions from '../actions/ServerActions';
import ErrorActions from '../actions/ErrorActions';
import dvid from 'dvid';

class ServerStore {
  constructor() {
    this.bindActions(ServerActions);
    this.repos = null;
    this.stats = null;
    this.api = dvid.connect({host:'emdata1', port: 8500});

   this.exportPublicMethods({
     getLoad: this.getLoad
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

  onFetch(msg) {
    var self = this;
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
