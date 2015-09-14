import alt from '../alt';
import LogActions from '../actions/LogActions';

class LogStore {
  constructor() {
    this.bindActions(LogActions);
    this.current = [];
    this.orig = [];
    this.uuid = null;
    this.repo_uuid = null;
  }
  onUpdate(data) {
    this.current = data.log;
    if (this.current && this.current.constructor === Array) {
      this.current.reverse();
    }
    this.uuid = data.uuid;
  }
  onRevert() {
    this.current = this.orig.slice();
    this.uuid = null;
  }
  onInit(data) {
    this.orig = data.log.slice();
    this.orig.reverse();
    this.current = this.orig.slice();
    this.repo_uuid = data.uuid;
  }
}

module.exports = (alt.createStore(LogStore));
