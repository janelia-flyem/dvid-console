import dvid from 'dvid';
import settings from '../settings.json';

const api = dvid.connect({
  host: settings.dvid.host,
  port: settings.dvid.port,
  username: 'dvidconsole',
  application: 'dvidconsole',
});

export const LOADING_DVID_STATS = 'LOADING_DVID_STATS';
export const LOADED_DVID_STATS = 'LOADED_DVID_STATS';
export const LOAD_DVID_STATS_ERROR = 'LOAD_DVID_STATS_ERROR';

function loadingDvidStats() {
  return {
    type: LOADING_DVID_STATS,
  };
}

function loadedDvidStats(json) {
  return {
    type: LOADED_DVID_STATS,
    json,
  };
}

function loadDvidStatsError(error) {
  return {
    type: LOAD_DVID_STATS_ERROR,
    error,
  };
}


export function loadStats() {
  return function loadStatsAsync(dispatch) {
    dispatch(loadingDvidStats());
    api.serverInfo({
      callback: data => dispatch(loadedDvidStats(data)),
      error: err => dispatch(loadDvidStatsError(err)),
    });
  };
}

export const LOADING_DVID_REPOS = 'LOADING_DVID_REPOS';
export const LOADED_DVID_REPOS = 'LOADED_DVID_REPOS';
export const LOAD_DVID_REPOS_ERROR = 'LOAD_DVID_REPOS_ERROR';

function loadingDvidRepos() {
  return {
    type: LOADING_DVID_REPOS,
  };
}

function loadedDvidRepos(json) {
  return {
    type: LOADED_DVID_REPOS,
    json,
  };
}

function loadDvidReposError(error) {
  return {
    type: LOAD_DVID_REPOS_ERROR,
    error,
  };
}

export function loadRepos() {
  return function loadReposAsync(dispatch) {
    dispatch(loadingDvidRepos());
    api.reposInfo({
      callback: data => dispatch(loadedDvidRepos(data)),
      error: err => dispatch(loadDvidReposError(err)),
    });
  };
}

export const LOADING_DVID_STATUS = 'LOADING_DVID_STATUS';

export function loadStatus() {
  return {
    type: LOADING_DVID_STATUS,
  };
}
