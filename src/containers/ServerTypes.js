import { connect } from 'react-redux';
import ServerTypes from '../components/ServerTypes';
import { loadTypes } from '../actions/dvid';

const mapStateToProps = state => ({
  types: state.dvid.get('types'),
});

const mapDispatchToProps = dispatch => ({
  actions: {
    loadTypes: () => {
      dispatch(loadTypes());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ServerTypes);
