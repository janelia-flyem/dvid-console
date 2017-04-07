import alt from '../alt';

class ServerActions {
  update(data) {
    this.dispatch(data);
  }
  clearRepo(){
    this.dispatch();
  }
  fetchStats() {
    this.dispatch();
  }
  fetchTypes() {
    this.dispatch();
  }
  fetch(uuid) {
    this.dispatch(uuid);
  }
  fetchMaster(data) {
    this.dispatch(data);
  }
  fetchDefaultInstances(data){
    this.dispatch(data)
  }
  addLog(entry) {
    this.dispatch(entry);
  }
  branchNode(data) {
    this.dispatch(data);
  }
  commitNode(data) {
    this.dispatch(data);
  }
  updateUuuid(data) {
    this.dispatch(data);
  }
  fetchServerInfo(data){
    this.dispatch(data);
  }
  fetchDataSource(data){
    this.dispatch(data);
  }
}

module.exports = (alt.createActions(ServerActions));
