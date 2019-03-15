import * as settings from './settings';

describe('when no settings are used', () => {

  it('returns the correct port', () => {
    expect(settings.getPort()).toBe('');
  });

  it('returns the correct hostname', () => {
    expect(settings.getHostName()).toBe('localhost');
  });

  it('returns the correct protocol', () => {
    expect(settings.getProtocol()).toBe('http');
  });

  it('returns the correct base url', () => {
    expect(settings.baseurl()).toBe('http://localhost');
  });
  it('returns the correct api url', () => {
    expect(settings.apiurl()).toBe('http://localhost/api');
  });

});
