import { connect } from 'react-redux';
import Repo from '../components/Repo';
import { loadRepoInfoFromAlias } from '../actions/dvid';

const mapStateToProps = state => ({
  repos: state.dvid.get('repos'),
  repoDetail: state.dvid.get('repoDetail'),
  repoRestrictions: state.dvid.get('repoRestrictions'),
  loaded: state.dvid.get('repoInfoLoaded')
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
)(Repo);
