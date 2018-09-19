import { connect } from 'react-redux';
import CommitHistory from '../components/CommitHistory';
import { loadRepoInfoFromAlias } from '../actions/dvid';

const mapStateToProps = state => ({
  repos: state.dvid.get('repos'),
  repoDetail: state.dvid.get('repoDetail'),
  repoInfoLoading: state.dvid.get('repoInfoLoading'),
  repoInfoLoaded: state.dvid.get('repoInfoLoaded'),
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
)(CommitHistory);
