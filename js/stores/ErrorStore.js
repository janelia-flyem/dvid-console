import alt from '../alt';
import ErrorActions from '../actions/ErrorActions';

class ErrorStore {
  constructor() {
    this.bindActions(ErrorActions);
    this.errors = null;
    this.persist = false;
  }
  onUpdate(error) {
    this.errors = error;
  }
  onClear() {
    this.errors = null;
  }
}

module.exports = (alt.createStore(ErrorStore, 'ErrorStore'));
