import { EcomConfig } from './config';
import { Logger, Logging, LogLevel } from './logging/Logger';
import cloneDeep from 'lodash.clonedeep';
import { coreConfig } from './config.spec.data';
import Mock = jest.Mock;

let loggerMock: Logger = new Logger('');
loggerMock.error = jest.fn();
jest.mock('./logging/getLogger', () => ({ getLogger: (_: string) => loggerMock }));

describe('config', () => {
  beforeEach(() => Logging.init(LogLevel.NONE));
  describe('setConfig', () => {
    it('uses defaults for omitted values', () => {
      // Arrange
      const testConfig = cloneDeep(coreConfig);

      // @ts-ignore
      delete testConfig.logLevel;
      // @ts-ignore
      delete testConfig.project.apiKey.preview;
      // @ts-ignore
      delete testConfig.project.apiKey.release;

      EcomConfig.setConfig(testConfig);

      // Act
      const result = EcomConfig.getCoreConfig();

      // Assert
      expect(result.logLevel).toEqual(LogLevel.INFO);
      expect(result.project.apiKey.preview).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
      expect(result.project.apiKey.release).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
    });
    it('uses defaults for empty values', () => {
      // Arrange
      const testConfig = cloneDeep(coreConfig);

      // @ts-ignore
      testConfig.project.apiKey.preview = '';
      // @ts-ignore
      testConfig.project.apiKey.release = '';

      EcomConfig.setConfig(testConfig);

      // Act
      const result = EcomConfig.getCoreConfig();

      // Assert
      expect(result.project.apiKey.preview).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
      expect(result.project.apiKey.release).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
    });
  });

  describe('validateConfig', () => {
    it('logs validation errors', () => {
      // Arrange
      const testConfig = {
        fsServerOrigin: 'ORIGIN',
        logLevel: LogLevel.DEBUG,
        project: {
          apiKey: {
            master: 'MASTER',
            preview: 'PREVIEW',
            release: 'RELEASE',
          },
          caasURL: 'CAASURL',
          navigationServiceURL: 'NAVIGATIONSERVICEURL',
          projectID: 'PROJECTID',
          tenantID: 'TENANTID',
        },
      };

      // Act & Assert
      // @ts-ignore
      expect(() => EcomConfig.setConfig(testConfig)).toThrowError('Validation of configuration failed. Please check your config.');

      expect((loggerMock.error as Mock).mock.calls).toEqual([
        ['fsServerOrigin', '"FirstSpirit Server Origin" must be a valid uri'],
        ['project.navigationServiceURL', '"Navigation Service URL" must be a valid uri'],
        ['project.caasURL', '"CaaS URL" must be a valid uri'],
        ['project.projectID', '"Project ID" must be a valid GUID'],
        ['project.apiKey.master', 'must be a valid GUID'],
        ['project.apiKey.preview', '"Preview API Key" must be a valid GUID'],
        ['project.apiKey.release', '"Release API Key" must be a valid GUID'],
      ]);
    });
    it('throws error on apiKey config not found', () => {
      // Arrange
      const testConfig = {
        fsServerOrigin: 'ORIGIN',
        logLevel: LogLevel.DEBUG,
        project: {
          apikey: { }, // <-- See this small `k`
          caasURL: 'CAASURL',
          navigationServiceURL: 'NAVIGATIONSERVICEURL',
          projectID: 'PROJECTID',
          tenantID: 'TENANTID',
        },
      };

      // Act & Assert
      // @ts-ignore
      expect(() => EcomConfig.setConfig(testConfig)).toThrowError('API key configuration not found');
    });
  });

  describe('getCoreConfig', () => {
    it('returns the core config', () => {
      // Arrange
      EcomConfig.setConfig(coreConfig);
      // Act
      const result = EcomConfig.getCoreConfig();
      // Assert
      expect(result).toEqual(coreConfig);
    });
  });

  describe('getFSXAConfig', () => {
    it('returns the FSXAConfig config', () => {
      // Arrange
      EcomConfig.setConfig(coreConfig);
      // Act
      const result = EcomConfig.getFSXAConfig();
      // Assert
      expect(result.preview).toEqual({
        projectID: coreConfig.project.projectID,
        caasURL: coreConfig.project.caasURL,
        navigationServiceURL: coreConfig.project.navigationServiceURL,
        tenantID: coreConfig.project.tenantID,
        apikey: coreConfig.project.apiKey.preview,
        contentMode: 'preview',
        logLevel: coreConfig.logLevel,
      });
      expect(result.release).toEqual({
        projectID: coreConfig.project.projectID,
        caasURL: coreConfig.project.caasURL,
        navigationServiceURL: coreConfig.project.navigationServiceURL,
        tenantID: coreConfig.project.tenantID,
        apikey: coreConfig.project.apiKey.release,
        contentMode: 'release',
        logLevel: coreConfig.logLevel,
      });
    });
  });
});
