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

    default:
      return state;
  }
}
