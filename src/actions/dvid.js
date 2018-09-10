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
    return new Promise((resolve, reject) => {
      api.reposInfo({
        callback: (data) => {
          dispatch(loadedDvidRepos(data));
          resolve();
        },
        error: (err) => {
          reject(dispatch(loadDvidReposError(err)));
        },
      });
    });
  };
}

export const LOADING_DVID_TYPES = 'LOADING_DVID_TYPES';
export const LOADED_DVID_TYPES = 'LOADED_DVID_TYPES';
export const LOAD_DVID_TYPES_ERROR = 'LOAD_DVID_TYPES_ERROR';

function loadingDvidTypes() {
  return {
    type: LOADING_DVID_TYPES,
  };
}

function loadedDvidTypes(json) {
  return {
    type: LOADED_DVID_TYPES,
    json,
  };
}

function loadDvidTypesError(error) {
  return {
    type: LOAD_DVID_TYPES_ERROR,
    error,
  };
}

export function loadTypes() {
  return function loadTypesAsync(dispatch) {
    dispatch(loadingDvidTypes());
    api.serverCompiledTypes({
      callback: data => dispatch(loadedDvidTypes(data)),
      error: err => dispatch(loadDvidTypesError(err)),
    });
  };
}


export const LOADING_DVID_STATUS = 'LOADING_DVID_STATUS';
export const LOADED_DVID_STATUS = 'LOADED_DVID_STATUS';
export const LOAD_DVID_STATUS_ERROR = 'LOAD_DVID_STATUS_ERROR';

function loadingStatus() {
  return {
    type: LOADING_DVID_STATUS,
  };
}

function loadedStatus(json) {
  return {
    type: LOADED_DVID_STATUS,
    json,
  };
}

function loadStatusError(error) {
  return {
    type: LOAD_DVID_STATUS_ERROR,
    error,
  };
}
export function loadStatus() {
  return function loadStatusAsync(dispatch) {
    dispatch(loadingStatus());
    api.load({
      callback: data => dispatch(loadedStatus(data)),
      error: err => dispatch(loadStatusError(err)),
    });
  };
}

export const LOADING_REPO_INFO = 'LOADING_REPO_INFO';
export const LOADED_REPO_INFO = 'LOADED_REPO_INFO';
export const LOAD_REPO_INFO_ERROR = 'LOAD_REPO_INFO_ERROR';

function loadingRepoInfo(name) {
  return {
    type: LOADING_REPO_INFO,
    name,
  };
}

function loadedRepoInfo(json) {
  return {
    type: LOADED_REPO_INFO,
    json,
  };
}

function loadRepoInfoError(error) {
  return {
    type: LOAD_REPO_INFO_ERROR,
    error,
  };
}

export function loadRepoInfo(id) {
  return function loadRepoInfoAsync(dispatch) {
    dispatch(loadingRepoInfo(id));
    return new Promise((resolve, reject) => {
      api.repo({
        uuid: id,
        endpoint: 'info',
        callback: (data) => {
          resolve(dispatch(loadedRepoInfo(data)));
        },
        error: (err) => {
          reject(dispatch(loadRepoInfoError(err)));
        },
      });
    });
  };
}

export function loadRepoInfoFromAlias(alias) {
  return function loadRepoInfoFromAliasAsync(dispatch, getState) {
    return dispatch(loadRepos()).then(() => {
      const repoIDs = Object.values(getState().dvid.get('repos')).filter(repo => repo.Alias === alias).map(repo => repo.Root);
      return dispatch(loadRepoInfo(repoIDs[0]));
    });
  };
}
