import alt from '../alt';

class ModalActions {
  openModal(opts){
    this.dispatch({
      MODAL_TYPE: opts.MODAL_TYPE, 
      uuid: opts.uuid,
      isEditable: opts.isEditable
    });
  }
  closeModal() {
    this.dispatch();
  }
}

module.exports = (alt.createActions(ModalActions));
