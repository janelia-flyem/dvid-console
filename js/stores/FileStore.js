import alt from '../alt';
import FileActions from '../actions/FileActions';
import ErrorActions from '../actions/ErrorActions';
import dvid from 'dvid';
import config from '../utils/config';

class FileStore {
  constructor() {
    this.bindActions(FileActions);
    this.api = dvid.connect({host: config.host, port: config.port, username: 'dvidconsole', application: 'dvidconsole'});
    this.filenames = null;
    this.readme = null;
  }

  onFetchFileNames(opts) {
    var self = this;

    if (opts && opts.uuid) {
      self.api.node({
        uuid: opts.uuid,
        endpoint: '.files/keys',
        callback: function(data) {
          //sort the filenames
          data = data.sort(function(a, b){
            return a.localeCompare(b);
          })

          if (opts.callback) {
            opts.callback(data);
          }
          self.filenames = data;
          self.emitChange();
        },
        error: function (err) {
          self.filenames = null
          self.emitChange();
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }
  }
  onFetchREADME(opts){
    var self = this;

    if (opts && opts.uuid) {
      self.api.node({
        uuid: opts.uuid,
        endpoint: '.files/key/README.md',
        callback: function(data) {
          if (opts.callback) {
            opts.callback(data);
          }
          self.readme = data;
          self.emitChange();
        },
        error: function (err) {
          self.readme = 'none'
          self.emitChange();
          if (opts.error) {
            opts.error(err);
          }
        }
      });
    }
  }


}

module.exports = (alt.createStore(FileStore, 'FileStore'));
