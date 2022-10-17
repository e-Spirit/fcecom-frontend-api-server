import { FSXAContentMode, LogLevel } from 'fsxa-api';
import { EcomFSXARemoteApi } from './ecomFSXARemoteApi';
import { createNamespace } from 'continuation-local-storage';

describe('EcomFSXARemoteApi', () => {
  const testFsServerUrl = 'testFsServerUrl';
  const testConfig = {
    apikey: '123',
    navigationServiceURL: 'testUrl/navigationservice',
    caasURL: 'testCaasUrl',
    projectID: 'testProjectId',
    tenantID: 'testTenantId',
    contentMode: FSXAContentMode.PREVIEW,
    logLevel: LogLevel.NONE,
  };
  const session = createNamespace('request');
  it('should return release when referrer does not match ', () => {
    const api = new EcomFSXARemoteApi({ ...testConfig, fsServerUrl: 'wrongUrl' });

    let result;
    session.run(() => {
      session.set('queryParams', { referrer: 'wrongServerUrl' });
      result = api.contentMode;
    });

    expect(result).toEqual('release');
  });
  it('should return release when fsServerUrl is undefined', () => {
    const api = new EcomFSXARemoteApi(testConfig);

    let result;
    session.run(() => {
      session.set('queryParams', { referrer: testFsServerUrl });
      result = api.contentMode;
    });

    expect(result).toEqual('release');
  });
  it('should return preview when referrer and fsServerUrl Match', () => {
    const api = new EcomFSXARemoteApi({ ...testConfig, fsServerUrl: testFsServerUrl });

    let result;
    session.run(() => {
      session.set('queryParams', { referrer: testFsServerUrl });
      result = api.contentMode;
    });

    expect(result).toEqual('preview');
  });
});
