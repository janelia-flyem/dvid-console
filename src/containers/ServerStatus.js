import { connect } from 'react-redux';
import ServerStatus from '../components/ServerStatus';
import { loadStatus } from '../actions/dvid';

const mapStateToProps = state => ({
  status: state.dvid.get('status'),
});

const mapDispatchToProps = dispatch => ({
  actions: {
    loadStatus: () => {
      dispatch(loadStatus());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ServerStatus);
