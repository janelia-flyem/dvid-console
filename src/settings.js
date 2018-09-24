import settings from './settings.json';

export function getPort() {
  if ('dvid' in settings && 'port' in settings.dvid) {
    return settings.dvid.port;
  }
  return window.location.port;
}

export function getHostName() {
  if ('dvid' in settings && 'host' in settings.dvid) {
    return settings.dvid.host;
  }
  return window.location.hostname;
}

export function getProtocol() {
  if ('dvid' in settings && 'protocol' in settings.dvid) {
    return settings.dvid.protocol;
  }
  return window.location.protocol;
}

export function baseurl() {
  return `${getProtocol()}//${getHostName()}:${getPort()}`;
}

export function apiurl() {
  return `${baseurl()}/api`;
}
