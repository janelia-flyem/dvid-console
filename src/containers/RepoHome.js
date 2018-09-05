import { connect } from 'react-redux';
import RepoHome from '../components/RepoHome';
import { loadRepoInfoFromAlias } from '../actions/dvid';

const mapStateToProps = state => ({
  repos: state.dvid.get('repos'),
  repoDetail: state.dvid.get('repoDetail'),
});

const mapDispatchToProps = dispatch => ({
  actions: {
    loadRepoInfoFromAlias: (name) => {
      dispatch(loadRepoInfoFromAlias(name));
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RepoHome);
