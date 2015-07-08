import alt from '../alt';

class ErrorActions {
  update(error) {
    this.dispatch(error);
  }
  clear() {
    this.dispatch();
  }
}

module.exports = (alt.createActions(ErrorActions));
