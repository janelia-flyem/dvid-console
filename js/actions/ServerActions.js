import alt from '../alt';

class ServerActions {
  update(data) {
    this.dispatch(data);
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
  addLog(entry) {
    this.dispatch(entry);
  }
  branchNode(data) {
    this.dispatch(data);
  }
  commitNode(data) {
    this.dispatch(data);
  }
}

module.exports = (alt.createActions(ServerActions));
