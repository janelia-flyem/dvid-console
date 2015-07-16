import alt from '../alt';

class LogActions {
  update(log) {
    this.dispatch(log);
  }
  revert() {
    this.dispatch();
  }
  init(log) {
    this.dispatch(log);
  }
}

module.exports = (alt.createActions(LogActions));
