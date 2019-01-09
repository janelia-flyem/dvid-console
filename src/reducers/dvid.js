import Immutable from 'immutable';

const initialState = Immutable.Map({
  stats: {},
  stats_loading: false,
  stats_loaded: false,
  repos: {},
  repos_loading: false,
  repos_loaded: false,
  types: {},
  types_loading: false,
  types_loaded: false,
  status: {},
  status_loading: false,
  status_loaded: false,
  repoInfoLoading: false,
  repoInfoLoaded: false,
  repoDetail: {
    Root: '',
    Alias: '',
    DAG: {
      Nodes: {},
    },
  },
  repoRestrictions: [],
  error: null,
});

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOADING_DVID_STATS':
      return state.set('stats_loading', true).set('stats_loaded', false);
    case 'LOADED_DVID_STATS':
      return state.set('stats', action.json).set('stats_loading', false).set('stats_loaded', true);
    case 'LOAD_DVID_STATS_ERROR':
      return state.set('error', action.error).set('stats_loading', false);

    case 'LOADING_DVID_REPOS':
      return state.set('repos_loading', true).set('repos_loaded', false);
    case 'LOADED_DVID_REPOS':
      return state.set('repos', action.json).set('repos_loading', false).set('repos_loaded', true);
    case 'LOAD_DVID_REPOS_ERROR':
      return state.set('error', action.error).set('repos_loading', false);

    case 'LOADING_DVID_TYPES':
      return state.set('types_loading', true).set('types_loaded', false);
    case 'LOADED_DVID_TYPES':
      return state.set('types', action.json).set('types_loading', false).set('types_loaded', true);
    case 'LOAD_DVID_TYPES_ERROR':
      return state.set('error', action.error).set('types_loading', false);

    case 'LOADING_DVID_STATUS':
      return state.set('status_loading', true).set('status_loaded', false);
    case 'LOADED_DVID_STATUS':
      return state.set('status', action.json).set('status_loading', false).set('status_loaded', true);
    case 'LOAD_DVID_STATUS_ERROR':
      return state.set('error', action.error).set('status_loading', false);

    case 'LOADING_REPO_INFO':
      return state.set('repoInfoLoading', true).set('repoInfoLoaded', false);
    case 'LOADED_REPO_INFO':
      // TODO: at this point we need to build the dag content, so that we can use
      // it in later checks and for the DAG display.
      return state.set('repoDetail', action.json).set('repoInfoLoading', false).set('repoInfoLoaded', true);
    case 'LOADED_REPO_RESTRICTIONS':
      return state.set('repoRestrictions', action.json)

    default:
      return state;
  }
}
