import * as settings from './settings';

jest.mock('./settings.json', () => ({
  dvid: {
    port: 8000,
    host: 'emdata.test.org',
    protocol: 'https'
  }
}), { virtual: true });

describe('when settings are used', () => {

  it('returns the correct port', () => {
    expect(settings.getPort()).toBe(8000);
  });

  it('returns the correct hostname', () => {
    expect(settings.getHostName()).toBe('emdata.test.org');
  });

  it('returns the correct protocol', () => {
    expect(settings.getProtocol()).toBe('https');
  });

  it('returns the correct base url', () => {
    expect(settings.baseurl()).toBe('https://emdata.test.org:8000');
  });
  it('returns the correct api url', () => {
    expect(settings.apiurl()).toBe('https://emdata.test.org:8000/api');
  });

});
