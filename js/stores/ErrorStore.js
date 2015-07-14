import alt from '../alt';
import ErrorActions from '../actions/ErrorActions';

class ErrorStore {
  constructor() {
    this.bindActions(ErrorActions);
    this.errors = [];
    this.persist = false;
  }
  onUpdate(error) {
    this.errors.push(error);
  }
  onClear() {
    this.errors = [];
  }
}

module.exports = (alt.createStore(ErrorStore));
