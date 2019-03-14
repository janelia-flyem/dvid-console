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
  // the dvid api expects the protocol to not end with a ':'
  return window.location.protocol.replace(/:$/,'');
}

export function baseurl() {
  return `${getProtocol()}//${getHostName()}:${getPort()}`;
}

export function apiurl() {
  return `${baseurl()}/api`;
}
