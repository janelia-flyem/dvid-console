import { connect } from 'react-redux';
import Home from '../components/Home';
import { loadRepos } from '../actions/dvid';

const mapStateToProps = state => ({
  repos: state.dvid.get('repos'),
});

const mapDispatchToProps = dispatch => ({
  actions: {
    loadRepos: () => {
      dispatch(loadRepos());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);
