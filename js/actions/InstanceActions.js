import alt from '../alt';

class InstanceActions {
  toggle() {
    this.dispatch();
  }
  fetchRestrictions(opts){
    this.dispatch(opts)
  }
  fetchNeuroglancer(opts){
    this.dispatch(opts)
  }
  clearMeta(){
    this.dispatch()
  }
  setMetaEmpty(){
    this.dispatch()
  }
  updateSelected(opts){
    this.dispatch(opts)
  }
}

module.exports = (alt.createActions(InstanceActions));
