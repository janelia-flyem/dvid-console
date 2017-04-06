import alt from '../alt';

class InstanceActions {
  toggle() {
    this.dispatch();
  }
  fetchMeta(opts){
    this.dispatch(opts)
  }
}

module.exports = (alt.createActions(InstanceActions));
