import alt from '../alt';

class InstanceActions {
  toggle() {
    this.dispatch();
  }
}

module.exports = (alt.createActions(InstanceActions));
