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
    this.repo = null;

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

  onFetch(uuid) {
    var self = this;

    if (uuid) {
      self.api.get({
        uuid: uuid,
        endpoint: 'info',
        callback: function(data) {
          self.repo = data;
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
