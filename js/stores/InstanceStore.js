import alt from '../alt';
import InstanceActions from '../actions/InstanceActions';

class InstanceStore {
  constructor() {
    this.bindActions(InstanceActions);
    this.nodeRestrict = true;
  }
  onToggle() {
    if (this.nodeRestrict === true) {
      this.nodeRestrict = false;
    }
    else {
      this.nodeRestrict = true;
    }
  }
}

module.exports = (alt.createStore(InstanceStore));
