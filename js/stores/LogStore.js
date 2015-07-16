import alt from '../alt';
import LogActions from '../actions/LogActions';

class LogStore {
  constructor() {
    this.bindActions(LogActions);
    this.current = [];
    this.orig = [];
  }
  onUpdate(log) {
    this.current = log;
  }
  onRevert() {
    this.current = this.orig.slice();
  }
  onInit(log) {
    this.orig = log.slice();
    this.current = this.orig.slice();
  }
}

module.exports = (alt.createStore(LogStore));
