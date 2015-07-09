import alt from '../alt';

class ServerActions {
  update(data) {
    this.dispatch(data);
  }
  fetchStats() {
    this.dispatch();
  }
  fetch() {
    this.dispatch('message');
  }
}

module.exports = (alt.createActions(ServerActions));
