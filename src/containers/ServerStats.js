import { connect } from 'react-redux';
import ServerStats from '../components/ServerStats';
import { loadStats, loadRepos } from '../actions/dvid';

const mapStateToProps = state => ({
  stats: state.dvid.get('stats'),
  repos: state.dvid.get('repos'),
});

const mapDispatchToProps = dispatch => ({
  actions: {
    loadStats: () => {
      dispatch(loadStats());
    },
    loadRepos: () => {
      dispatch(loadRepos());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ServerStats);
