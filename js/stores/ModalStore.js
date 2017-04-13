import alt from '../alt';
import ModalActions from '../actions/ModalActions';

//safe 'enums' for switching modals
const BRANCH_MODAL = Symbol();
const COMMIT_MODAL = Symbol();
const DAGINFO_MODAL = Symbol();

export const ModalTypes = {
  BRANCH_MODAL,
  COMMIT_MODAL,
  DAGINFO_MODAL
};


class ModalStore {
  //safe enums for switching modals
  constructor() {
    this.bindActions(ModalActions);
    this.currentModal = null;
    this.uuid = null;
    this.isEditable = null;
  }

  onOpenModal(opts){
    this.currentModal = opts.MODAL_TYPE;
    this.uuid = opts.uuid;
    this.isEditable = opts.isEditable;

  }

  onCloseModal(){
    this.currentModal = null;
    this.uuid = null;
    this.isEditable = null;
  }
}

export default (alt.createStore(ModalStore,'ModalStore'));
