import { EcomConfig } from './config';
import { Logger, Logging, LogLevel } from './logging/Logger';
import { getTestCoreConfig } from './config.spec.data';
import { CoreConfig } from './config.meta';
import { MissingDefaultLocaleError } from './errors';
import { set } from 'lodash';
import { get } from 'lodash';
import Mock = jest.Mock;

let loggerMock: Logger = new Logger('');
loggerMock.error = jest.fn();
jest.mock('./logging/getLogger', () => ({ getLogger: (_: string) => loggerMock }));

describe('config', () => {
  beforeEach(() => Logging.init(LogLevel.NONE));
  describe('setConfig', () => {
    it('uses defaults for omitted values', () => {
      // Arrange
      const testConfig = getTestCoreConfig();

      // @ts-ignore
      delete testConfig.logLevel;
      // @ts-ignore
      delete testConfig.project.apiKey.preview;
      // @ts-ignore
      delete testConfig.project.apiKey.release;

      EcomConfig.applyConfig(testConfig);

      // Act
      const result = EcomConfig.getCoreConfig();

      // Assert
      expect(result.logLevel).toEqual(LogLevel.INFO);
      expect(result.project.apiKey.preview).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
      expect(result.project.apiKey.release).toEqual('0b099fe4-f040-405b-b0cf-5e6af08c0593');
    });
    it('uses defaults for empty values', () => {
      // Arrange
      const testConfig = getTestCoreConfig();

      // @ts-ignore
      testConfig.project.apiKey.preview = '';
      // @ts-ignore
      testConfig.project.apiKey.release = '';

      EcomConfig.applyConfig(testConfig);

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
      const testConfig: Partial<CoreConfig> = {
        fsServerOrigin: 'ORIGIN',
        defaultLocale: 'de',
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
      expect(() => EcomConfig.applyConfig(testConfig)).toThrow('Validation of configuration failed. Please check your config.');

      expect((loggerMock.error as Mock).mock.calls).toEqual([
        ['fsServerOrigin', '"FirstSpirit Server Origin" must be a valid uri'],
        ['defaultLocale', '"Default Locale" with value "de" fails to match the required pattern: /^[a-z]{2}_[A-Z]{2}$/'],
        ['project.navigationServiceURL', '"Navigation Service URL" must be a valid uri'],
        ['project.caasURL', '"CaaS URL" must be a valid uri'],
        ['project.projectID', '"Project ID" must be a valid GUID'],
        ['project.apiKey', '"API Key Config" does not match any of the allowed types'],
      ]);
    });
    it('throws error on apiKey config not found', () => {
      // Arrange
      const testConfig = {
        fsServerOrigin: 'ORIGIN',
        logLevel: LogLevel.DEBUG,
        project: {
          apikey: {}, // <-- See this small `k`
          caasURL: 'CAASURL',
          navigationServiceURL: 'NAVIGATIONSERVICEURL',
          projectID: 'PROJECTID',
          tenantID: 'TENANTID',
        },
      };

      // Act & Assert
      // @ts-ignore
      expect(() => EcomConfig.applyConfig(testConfig)).toThrow('API key configuration not found');
    });
    it('does accept configuration object containing additional parameters', () => {
      const coreConfig = getTestCoreConfig();
      expect(() => {
        // Arrange & Act
        EcomConfig.applyConfig({ ...coreConfig, foo: 'bar' } as any);

        // Assert
      }).not.toThrow();
      expect(EcomConfig.getCoreConfig()).toEqual({ ...coreConfig, foo: 'bar' });
    });
  });

  describe('getCoreConfig', () => {
    it('returns the core config', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      EcomConfig.applyConfig(coreConfig);
      // Act
      const result = EcomConfig.getCoreConfig();
      // Assert
      expect(result).toEqual(coreConfig);
    });
  });

  describe('getFSXAConfig', () => {
    it('returns the FSXAConfig config', () => {
      const coreConfig = getTestCoreConfig();
      // Arrange
      EcomConfig.applyConfig(coreConfig);
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

  describe('getDefaultLocale', () => {
    it('returns correct default locale', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: 'en_GB' });
      // Act
      const { defaultLocale } = EcomConfig.getCoreConfig();
      // Assert
      expect(defaultLocale).toEqual('en_GB');
      expect(() => {
        expect(EcomConfig.getDefaultLocale()).toEqual('en_GB');
      }).not.toThrow();
    });

    it('throws error if default locale is not set', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });
      const expectedError = new MissingDefaultLocaleError('locale is undefined and no fallback is available');
      // Act
      const { defaultLocale } = EcomConfig.getCoreConfig();
      // Assert
      expect(defaultLocale).toEqual(undefined);
      expect(() => EcomConfig.getDefaultLocale()).toThrow(expectedError);
    });
  });
  describe('removeAllTrailingSlashes', () => {
    it('returns url without any trailing slashes when provided with a single trailing slash', () => {
      // Arrange
      const url = 'https://example.com/';
      // Act
      const sanitizedUrl = EcomConfig.removeAllTrailingSlashes(url);
      // Assert
      expect(sanitizedUrl).not.toEndWith('/');
    });

    it('returns url without any trailing slashes when provided with multiple trailing slashes', () => {
      // Arrange
      const url = 'https://example.com////';
      // Act
      const sanitizedUrl = EcomConfig.removeAllTrailingSlashes(url);
      // Assert
      expect(sanitizedUrl).not.toEndWith('/');
    });

    it('returns url without any trailing slashes when provided without any trailing slashes', () => {
      // Arrange
      const url = 'https://example.com';
      // Act
      const sanitizedUrl = EcomConfig.removeAllTrailingSlashes(url);
      // Assert
      expect(sanitizedUrl).not.toEndWith('/');
    });
  });
  describe('sanitizeProperty', () => {
    it('sanitizes property by applying a sanitization function', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      EcomConfig.coreConfig = coreConfig;

      const initialValue = 'initialValue';
      const sanitizedValue = 'sanitizedValue';
      const path = 'project.navigationServiceURL';

      const sanitizeFunction = (_: string): string => sanitizedValue;

      // Act
      set(EcomConfig.coreConfig, path, initialValue);
      EcomConfig.sanitizeProperty(path, sanitizeFunction);

      // Assert
      expect(initialValue).not.toEqual(sanitizedValue);
      expect(get(EcomConfig.coreConfig, path)).toEqual(sanitizedValue);
    });

    it('logs an error and uses initial value if the sanitization function does return undefined or null', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      EcomConfig.coreConfig = coreConfig;

      const initialValue = 'initialValue';
      const sanitizedValue = 'sanitizedValue';
      const path = 'project.navigationServiceURL';

      const sanitizeFunction =
        (returnValue: any) =>
        (_: string): string =>
          returnValue;

      Logging.init(LogLevel.DEBUG);
      const warningSpy = jest.fn();
      const debugSpy = jest.fn();

      global.console = { ...global.console, warn: warningSpy, debug: debugSpy } as any;

      // Act
      set(EcomConfig.coreConfig, path, initialValue);
      EcomConfig.sanitizeProperty(path, sanitizeFunction(undefined));
      EcomConfig.sanitizeProperty(path, sanitizeFunction(null));

      // Assert
      expect(initialValue).not.toEqual(sanitizedValue);
      expect(get(EcomConfig.coreConfig, path)).toEqual(initialValue);

      expect(warningSpy).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalled();

      const warningMessage = 'Sanitizing property project.navigationServiceURL was not successful';
      expect(warningSpy.mock.calls[0][0]).toContain(warningMessage);
      expect(warningSpy.mock.calls[1][0]).toContain(warningMessage);

      // language=JSON
      expect(debugSpy.mock.calls[0][0]).toContain('{"originalValue":"initialValue"}');
      // language=JSON
      expect(debugSpy.mock.calls[1][0]).toContain('{"originalValue":"initialValue","sanitizedProperty":null}');
    });
  });
  describe('isUntranslatedSectionFilterActive', () => {
    it('returns the value of the removeUntranslatedSections config', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const testConfig = coreConfig;
      // @ts-ignore
      testConfig.project.removeUntranslatedSections = true;

      EcomConfig.applyConfig(testConfig);

      // Act
      const result = EcomConfig.isUntranslatedSectionFilterActive();

      // Assert
      expect(result).toEqual(true);
    });
    it('uses false as a fallback for missing removeUntranslatedSections', () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const testConfig = coreConfig;
      // @ts-ignore
      testConfig.project.removeUntranslatedSections = undefined;

      EcomConfig.applyConfig(testConfig);

      // Act
      const result = EcomConfig.isUntranslatedSectionFilterActive();

      // Assert
      expect(result).toEqual(false);
    });
  });
});
