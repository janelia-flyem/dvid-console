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
}

module.exports = (alt.createActions(InstanceActions));
