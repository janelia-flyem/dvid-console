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
}

module.exports = (alt.createActions(ServerActions));
