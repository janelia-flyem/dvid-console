import alt from '../alt';

class FileActions {
  fetchFileNames(uuid) {
    this.dispatch({uuid: uuid});
  }
  fetchREADME(uuid) {
    this.dispatch({uuid: uuid});
  }
}

module.exports = (alt.createActions(FileActions));
